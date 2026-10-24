import type { Report } from "../report";
import { ResearchError } from "./errors";
import type { ResearchInput } from "./input";
import { extractClaim, synthesize } from "./synthesize";
import { extractArticle, findSources } from "./tavily";
import { finalizeReport, inconclusiveDraft } from "./validate";

export type Stage =
	| { stage: "reading_url" }
	| { stage: "searching"; claim: string }
	| { stage: "sources"; count: number }
	| { stage: "analyzing" };

export async function runResearch(
	input: ResearchInput,
	signal: AbortSignal,
	onStage: (stage: Stage) => void,
): Promise<Report> {
	let claim = input.kind === "text" ? input.claim : "";
	if (input.kind === "url") {
		onStage({ stage: "reading_url" });
		claim = await extractClaim(await extractArticle(input.url, signal), signal);
		if (!claim)
			throw new ResearchError(
				"no_content",
				"Não encontramos uma alegação verificável nesse link.",
			);
	}

	onStage({ stage: "searching", claim });
	const found = await findSources(claim, signal);
	onStage({ stage: "sources", count: found.length });

	const base = {
		claim,
		inputUrl: input.kind === "url" ? input.url : null,
		researchedAt: new Date().toISOString(),
	};
	if (found.length === 0) {
		return {
			...base,
			...inconclusiveDraft(
				"A pesquisa não retornou fontes acessíveis sobre o tema.",
			),
			sources: [],
		};
	}

	onStage({ stage: "analyzing" });
	const { draft, sources } = finalizeReport(
		await synthesize(claim, found, signal),
		found,
	);
	return { ...base, ...draft, sources };
}
