import type { Report, Source } from "./report";

const constituicao: Source = {
	id: "S1",
	url: "https://www.lexml.gov.br/urn/urn:lex:br:federal:constituicao:1988-10-05;1988",
	title: "Constituição da República Federativa do Brasil de 1988",
	domain: "lexml.gov.br",
	kind: "primary",
	excerpt:
		"Texto oficial da Constituição Federal, mantido pelo portal LexML do Senado Federal.",
};

const bolsaFamilia: Source = {
	id: "S1",
	url: "https://www.lexml.gov.br/urn/urn:lex:br:federal:lei:2023-06-19;14601",
	title:
		"Lei nº 14.601, de 19 de junho de 2023 — Institui o Programa Bolsa Família",
	domain: "lexml.gov.br",
	kind: "primary",
	excerpt:
		"Institui o Programa Bolsa Família; altera a Lei nº 8.742, de 7 de dezembro de 1993 (Lei Orgânica da Assistência Social).",
};

const researchedAt = "2026-10-24T12:00:00.000Z";

export const examples: { slug: string; report: Report }[] = [
	{
		slug: "reeleicao-ilimitada",
		report: {
			claim: "O presidente pode se reeleger quantas vezes quiser.",
			inputUrl: null,
			summary:
				"A Constituição permite apenas uma reeleição consecutiva para presidente. Não há previsão de reeleições ilimitadas.",
			verdict: "contradicted",
			confidence: "alta",
			limitations:
				"A análise considera o texto constitucional vigente; propostas de emenda em tramitação não foram avaliadas.",
			findings: [
				{
					text: "O art. 14, § 5º, da Constituição permite que o presidente seja reeleito para um único período subsequente.",
					stance: "contradicts",
					evidenceType: "direct",
					sourceIds: ["S1"],
				},
			],
			caveats: [
				"A regra trata de mandatos consecutivos. Um ex-presidente pode voltar a concorrer após um intervalo.",
			],
			openQuestions: [],
			sources: [constituicao],
			researchedAt,
		},
	},
	{
		slug: "bolsa-familia-600-para-todos",
		report: {
			claim: "O Bolsa Família paga R$ 600 para qualquer pessoa que pedir.",
			inputUrl: null,
			summary:
				"O valor de R$ 600 existe como mínimo por família, mas o programa é restrito a famílias em situação de pobreza e exige contrapartidas.",
			verdict: "misleading",
			confidence: "média",
			limitations:
				"Os valores e critérios podem ser atualizados por regulamento. A análise se baseia apenas no texto da lei que criou o programa.",
			findings: [
				{
					text: "A lei define o Bolsa Família como programa voltado a famílias em situação de pobreza, com critério de renda por pessoa.",
					stance: "contradicts",
					evidenceType: "direct",
					sourceIds: ["S1"],
				},
				{
					text: "A lei prevê um valor mínimo de R$ 600 por família beneficiária, o que explica a origem do número citado.",
					stance: "supports",
					evidenceType: "direct",
					sourceIds: ["S1"],
				},
				{
					text: "A permanência no programa depende de condicionalidades em saúde e educação, como frequência escolar e acompanhamento de saúde.",
					stance: "context",
					evidenceType: "direct",
					sourceIds: ["S1"],
				},
			],
			caveats: ["O pagamento é por família, não por pessoa."],
			openQuestions: [],
			sources: [bolsaFamilia],
			researchedAt,
		},
	},
	{
		slug: "data-das-eleicoes",
		report: {
			claim:
				"A eleição para presidente acontece no primeiro domingo de outubro.",
			inputUrl: null,
			summary:
				"A Constituição determina que o primeiro turno da eleição presidencial ocorra no primeiro domingo de outubro do ano anterior ao fim do mandato.",
			verdict: "supported",
			confidence: "alta",
			limitations:
				"A análise trata da regra constitucional, não do calendário operacional definido pela Justiça Eleitoral.",
			findings: [
				{
					text: "O art. 77 da Constituição fixa o primeiro turno no primeiro domingo de outubro e um eventual segundo turno no último domingo do mesmo mês.",
					stance: "supports",
					evidenceType: "direct",
					sourceIds: ["S1"],
				},
			],
			caveats: [],
			openQuestions: [],
			sources: [constituicao],
			researchedAt,
		},
	},
	{
		slug: "video-obra-atual",
		report: {
			claim: "Vídeo viral mostra uma obra inaugurada pelo governo atual.",
			inputUrl: null,
			summary:
				"Não encontramos fontes que permitam confirmar a data, o local ou a autoria da obra mostrada.",
			verdict: "inconclusive",
			confidence: "baixa",
			limitations:
				"Sem informações sobre a origem do vídeo, não é possível relacioná-lo a uma obra específica. Falta de evidência não significa que a alegação seja falsa.",
			findings: [],
			caveats: [],
			openQuestions: [
				"Quando e onde o vídeo foi gravado?",
				"A obra aparece em registros oficiais de inauguração?",
			],
			sources: [],
			researchedAt,
		},
	},
];

export const findExample = (slug: string) =>
	examples.find((example) => example.slug === slug);
