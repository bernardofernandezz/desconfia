import { describe, expect, test } from "bun:test";
import type { Draft, Source } from "../report";
import { finalizeReport } from "./validate";

const source = (id: string): Source => ({
	id,
	url: `https://www.planalto.gov.br/${id}`,
	title: id,
	domain: "planalto.gov.br",
	kind: "primary",
	excerpt: "",
});

const draft = (overrides: Partial<Draft>): Draft => ({
	summary: "",
	verdict: "supported",
	confidence: "alta",
	limitations: "",
	findings: [],
	caveats: [],
	openQuestions: [],
	...overrides,
});

describe("finalizeReport", () => {
	test("drops findings citing unknown sources and forces inconclusive", () => {
		const result = finalizeReport(
			draft({
				findings: [
					{
						text: "x",
						stance: "supports",
						evidenceType: "direct",
						sourceIds: ["S9"],
					},
				],
			}),
			[source("S1")],
		);
		expect(result.draft.findings).toHaveLength(0);
		expect(result.draft.verdict).toBe("inconclusive");
		expect(result.draft.confidence).toBe("baixa");
		expect(result.sources).toHaveLength(0);
	});

	test("keeps only cited sources and renumbers them", () => {
		const result = finalizeReport(
			draft({
				findings: [
					{
						text: "x",
						stance: "supports",
						evidenceType: "direct",
						sourceIds: ["S3", "S3"],
					},
				],
			}),
			[source("S1"), source("S2"), source("S3")],
		);
		expect(result.draft.verdict).toBe("supported");
		expect(result.draft.findings[0]?.sourceIds).toEqual(["S1"]);
		expect(result.sources.map((s) => s.url)).toEqual([
			"https://www.planalto.gov.br/S3",
		]);
	});

	test("a contradicted verdict without contradicting evidence becomes inconclusive", () => {
		const result = finalizeReport(
			draft({
				verdict: "contradicted",
				findings: [
					{
						text: "x",
						stance: "context",
						evidenceType: "secondary",
						sourceIds: ["S1"],
					},
				],
			}),
			[source("S1")],
		);
		expect(result.draft.verdict).toBe("inconclusive");
	});
});
