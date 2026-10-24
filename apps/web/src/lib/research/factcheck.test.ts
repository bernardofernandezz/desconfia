import { describe, expect, test } from "bun:test";
import { toFactCheckSources } from "./factcheck";

describe("toFactCheckSources", () => {
	test("maps reviews to fact-check sources and skips unsafe links", () => {
		const sources = toFactCheckSources([
			{
				text: "Governo vai taxar o Pix",
				claimReview: [
					{
						publisher: { name: "Agência Lupa" },
						url: "https://lupa.uol.com.br/jornalismo/2025/01/pix",
						title: "É falso que o governo vai taxar o Pix",
						textualRating: "Falso",
					},
					{ url: "javascript:alert(1)", title: "x" },
				],
			},
		]);

		expect(sources).toEqual([
			{
				url: "https://lupa.uol.com.br/jornalismo/2025/01/pix",
				title: "Agência Lupa: É falso que o governo vai taxar o Pix",
				domain: "lupa.uol.com.br",
				kind: "factcheck",
				excerpt:
					"Alegação checada: “Governo vai taxar o Pix”. Classificação: Falso.",
			},
		]);
	});

	test("keeps at most three unique reviews", () => {
		const review = (n: number) => ({
			url: `https://aosfatos.org/${n}`,
			title: `${n}`,
		});
		const sources = toFactCheckSources([
			{ claimReview: [review(1), review(1), review(2), review(3), review(4)] },
		]);
		expect(sources.map((source) => source.url)).toEqual([
			"https://aosfatos.org/1",
			"https://aosfatos.org/2",
			"https://aosfatos.org/3",
		]);
	});
});
