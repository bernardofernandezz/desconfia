import {
	createDeleteToken,
	findRecentReportId,
	getReport,
	saveGroup,
	saveReport,
} from "./reports";
import { type ClaimStage, type ReportOrigin, researchClaim } from "./research";
import { ResearchError } from "./research/errors";
import type { ResearchInput } from "./research/input";
import { extractClaims } from "./research/synthesize";
import { extractArticle } from "./research/tavily";

// Short texts are verified as typed; longer ones (WhatsApp chains) are split into claims first.
const SINGLE_CLAIM_MAX_CHARS = 280;

export type VerificationRequest =
	| { kind: "new"; input: ResearchInput }
	| { kind: "refresh"; reportId: string };

export type VerificationEvent =
	| { stage: "reading"; from: "url" | "image" | "text" }
	| { stage: "claims"; claims: string[] }
	| (ClaimStage & { claim: number })
	| { stage: "cached"; claim: number }
	| { stage: "done"; href: string; created: string[]; deleteToken: string }
	| { stage: "error"; code: string; message: string };

type Emit = (event: VerificationEvent) => void;

type Plan = { claims: string[]; origin: ReportOrigin; useCache: boolean };

async function identifyClaims(
	input: ResearchInput,
	signal: AbortSignal,
	emit: Emit,
): Promise<string[]> {
	switch (input.kind) {
		case "text":
			if (input.claim.length <= SINGLE_CLAIM_MAX_CHARS) return [input.claim];
			emit({ stage: "reading", from: "text" });
			return extractClaims({ text: input.claim }, signal);
		case "url":
			emit({ stage: "reading", from: "url" });
			return extractClaims(
				{ text: await extractArticle(input.url, signal) },
				signal,
			);
		case "image":
			emit({ stage: "reading", from: "image" });
			return extractClaims({ image: input.image }, signal);
	}
}

async function plan(
	request: VerificationRequest,
	signal: AbortSignal,
	emit: Emit,
): Promise<Plan> {
	if (request.kind === "refresh") {
		const previous = await getReport(request.reportId);
		if (!previous)
			throw new ResearchError("not_found", "Esse relatório não existe mais.");
		return {
			claims: [previous.claim],
			origin: {
				inputUrl: previous.inputUrl,
				fromImage: previous.fromImage,
				previousId: request.reportId,
			},
			useCache: false,
		};
	}

	const { input } = request;
	return {
		claims: await identifyClaims(input, signal, emit),
		origin: {
			inputUrl: input.kind === "url" ? input.url : null,
			fromImage: input.kind === "image" ? true : undefined,
		},
		useCache: true,
	};
}

export async function runVerification(
	request: VerificationRequest,
	signal: AbortSignal,
	emit: Emit,
) {
	const { claims, origin, useCache } = await plan(request, signal, emit);
	if (claims.length === 0) {
		throw new ResearchError(
			"no_content",
			"Não encontramos uma alegação verificável nesse conteúdo.",
		);
	}
	emit({ stage: "claims", claims });

	const deleteToken = createDeleteToken();
	const reportIds: string[] = [];
	const created: string[] = [];

	for (const [index, claim] of claims.entries()) {
		const cachedId = useCache ? await findRecentReportId(claim) : null;
		if (cachedId) {
			emit({ stage: "cached", claim: index });
			reportIds.push(cachedId);
			continue;
		}

		const report = await researchClaim(claim, origin, signal, (stage) =>
			emit({ ...stage, claim: index }),
		);
		const id = await saveReport(report, deleteToken);
		reportIds.push(id);
		created.push(id);
	}

	const href =
		reportIds.length === 1
			? `/r/${reportIds[0]}`
			: `/g/${await saveGroup(reportIds)}`;
	emit({ stage: "done", href, created, deleteToken });
}
