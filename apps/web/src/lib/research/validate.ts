import type { Draft, Source } from "../report";

const NO_EVIDENCE_NOTE =
	"As fontes recuperadas não trouxeram evidência suficiente para uma conclusão.";

export function inconclusiveDraft(limitations: string): Draft {
	return {
		summary: "Não encontramos fontes suficientes para avaliar esta alegação.",
		verdict: "inconclusive",
		confidence: "baixa",
		limitations,
		findings: [],
		caveats: [],
		openQuestions: [],
	};
}

export function finalizeReport(
	draft: Draft,
	sources: Source[],
): { draft: Draft; sources: Source[] } {
	const knownIds = new Set(sources.map((source) => source.id));
	const findings = draft.findings
		.map((finding) => ({
			...finding,
			sourceIds: [
				...new Set(finding.sourceIds.filter((id) => knownIds.has(id))),
			],
		}))
		.filter((finding) => finding.sourceIds.length > 0);

	const cited = sources.filter((source) =>
		findings.some((finding) => finding.sourceIds.includes(source.id)),
	);
	const newIds = new Map(
		cited.map((source, index) => [source.id, `S${index + 1}`]),
	);
	const renumbered = findings.map((finding) => ({
		...finding,
		sourceIds: finding.sourceIds.map((id) => newIds.get(id) as string),
	}));

	const hasStance = (stance: "supports" | "contradicts") =>
		renumbered.some((finding) => finding.stance === stance);
	const backed =
		draft.verdict === "inconclusive" ||
		(draft.verdict === "supported" && hasStance("supports")) ||
		(draft.verdict === "contradicted" && hasStance("contradicts")) ||
		(draft.verdict === "misleading" &&
			(hasStance("supports") || hasStance("contradicts")));

	return {
		draft: {
			...draft,
			findings: renumbered,
			verdict: backed ? draft.verdict : "inconclusive",
			confidence: backed ? draft.confidence : "baixa",
			limitations: backed
				? draft.limitations
				: `${NO_EVIDENCE_NOTE} ${draft.limitations}`.trim(),
		},
		sources: cited.map((source) => ({
			...source,
			id: newIds.get(source.id) as string,
		})),
	};
}
