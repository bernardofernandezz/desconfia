import type { Report, Source } from "../report";
import { findFactChecks } from "./factcheck";
import { synthesize } from "./synthesize";
import { findSources } from "./tavily";
import { finalizeReport, inconclusiveDraft } from "./validate";

const MAX_SOURCES = 8;

export type ClaimStage =
	| { stage: "searching" }
	| { stage: "sources"; count: number }
	| { stage: "analyzing" };

export type ReportOrigin = Pick<
	Report,
	"inputUrl" | "fromImage" | "previousId"
>;

export async function researchClaim(
	claim: string,
	origin: ReportOrigin,
	signal: AbortSignal,
	onStage: (stage: ClaimStage) => void,
): Promise<Report> {
	onStage({ stage: "searching" });
	const [factChecks, webSources] = await Promise.all([
		findFactChecks(claim, signal),
		findSources(claim, signal),
	]);
	const found: Source[] = [...factChecks, ...webSources]
		.slice(0, MAX_SOURCES)
		.map((source, index) => ({ ...source, id: `S${index + 1}` }));
	onStage({ stage: "sources", count: found.length });

	const base = { claim, ...origin, researchedAt: new Date().toISOString() };
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
