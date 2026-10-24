import { z } from "zod";

export const verdicts = [
	"supported",
	"contradicted",
	"misleading",
	"inconclusive",
] as const;
export const confidences = ["baixa", "média", "alta"] as const;

export const findingSchema = z.object({
	text: z.string().describe("Uma constatação factual curta, em português"),
	stance: z.enum(["supports", "contradicts", "context"]),
	evidenceType: z.enum(["direct", "secondary", "inference"]),
	sourceIds: z
		.array(z.string())
		.describe("IDs das fontes que sustentam a constatação, ex.: S1"),
});

export const draftSchema = z.object({
	summary: z.string(),
	verdict: z.enum(verdicts),
	confidence: z.enum(confidences),
	limitations: z.string(),
	findings: z.array(findingSchema),
	caveats: z.array(z.string()),
	openQuestions: z.array(z.string()),
});

export type Source = {
	id: string;
	url: string;
	title: string;
	domain: string;
	kind: "primary" | "press" | "other";
	excerpt: string;
};

export type SourceCandidate = Omit<Source, "id">;

export type Finding = z.infer<typeof findingSchema>;
export type Draft = z.infer<typeof draftSchema>;
export type Verdict = Draft["verdict"];

export type Report = Draft & {
	claim: string;
	inputUrl: string | null;
	fromImage?: boolean;
	previousId?: string;
	sources: Source[];
	researchedAt: string;
};

export const verdictLabels: Record<Verdict, string> = {
	supported: "Confirmado",
	contradicted: "Falso",
	misleading: "Enganoso",
	inconclusive: "Inconclusivo",
};

export const sourceKindLabels: Record<Source["kind"], string> = {
	primary: "Fonte oficial",
	press: "Imprensa",
	other: "Outra fonte",
};

export function formatDate(iso: string) {
	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "long",
		timeStyle: "short",
		timeZone: "America/Sao_Paulo",
	}).format(new Date(iso));
}

export function formatShareText(report: Report) {
	const lines = [
		`*${verdictLabels[report.verdict]}* — verificado pelo Desconfia`,
		`“${report.claim}”`,
		report.summary,
	];
	const mainSource = report.sources[0];
	if (mainSource) lines.push(`Fonte principal: ${mainSource.url}`);
	return lines.join("\n\n");
}

export const claimTransitionName = (slug: string) => `claim-${slug}`;
