import { mock } from "bun:test";
import type { Draft } from "@/lib/report";

// Stands in for Tavily, Gemini and the Fact Check API so tests exercise the real orchestration and SQL offline.
export const researchCalls = { search: 0, extract: 0 };

export const supportedDraft: Draft = {
	summary: "Resumo",
	verdict: "supported",
	confidence: "alta",
	limitations: "",
	findings: [
		{
			text: "Fato",
			stance: "supports",
			evidenceType: "direct",
			sourceIds: ["S1"],
		},
	],
	caveats: [],
	openQuestions: [],
};

// Module mocks are process-wide in bun, so keep the real exports other test files rely on.
const factCheck = await import("@/lib/research/factcheck");
mock.module("@/lib/research/factcheck", () => ({
	...factCheck,
	findFactChecks: async () => [],
}));
mock.module("@/lib/research/tavily", () => ({
	extractArticle: async () => "texto do artigo",
	findSources: async () => {
		researchCalls.search++;
		return [
			{
				url: "https://www.camara.leg.br/noticia",
				title: "Notícia",
				domain: "camara.leg.br",
				kind: "primary",
				excerpt: "trecho",
			},
		];
	},
}));
mock.module("@/lib/research/synthesize", () => ({
	extractClaims: async () => {
		researchCalls.extract++;
		return ["Primeira alegação verificável", "Segunda alegação verificável"];
	},
	synthesize: async () => supportedDraft,
}));
