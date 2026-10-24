import { beforeEach, describe, expect, test } from "bun:test";
import { researchCalls as calls } from "@/test/mock-research";

const { runVerification } = await import("./verification");
const { deleteReport, getGroupReports, getReport, saveFeedback } = await import(
	"./reports"
);
type VerificationEvent = import("./verification").VerificationEvent;

async function verify(request: Parameters<typeof runVerification>[0]) {
	const events: VerificationEvent[] = [];
	const summary = await runVerification(
		request,
		new AbortController().signal,
		(event) => events.push(event),
	);
	const done = events.at(-1);
	if (done?.stage !== "done") throw new Error("verification did not finish");
	return { events, done, summary };
}

const text = (claim: string) =>
	({ kind: "new", input: { kind: "text", claim } }) as const;

beforeEach(() => {
	calls.search = 0;
	calls.extract = 0;
});

describe("runVerification", () => {
	test("researches a short claim and stores a single report", async () => {
		const { events, done } = await verify(
			text("O governo criou um imposto novo"),
		);

		expect(events.map((event) => event.stage)).toEqual([
			"claims",
			"searching",
			"sources",
			"analyzing",
			"done",
		]);
		expect(done.href).toStartWith("/r/");
		expect(done.created).toHaveLength(1);
		const report = await getReport(done.created[0] ?? "");
		expect(report?.verdict).toBe("supported");
		expect(report?.sources[0]?.id).toBe("S1");
	});

	test("reuses a recent report for the same claim, ignoring case and spacing", async () => {
		const first = await verify(text("A inflação caiu em 2025"));
		const second = await verify(text("  a inflação   caiu em 2025! "));

		expect(calls.search).toBe(1);
		expect(second.events.map((event) => event.stage)).toContain("cached");
		expect(second.done.href).toBe(first.done.href);
		expect(second.done.created).toEqual([]);
		expect(second.summary).toMatchObject({
			claims: 1,
			reused: 1,
			verdicts: [],
		});
	});

	test("splits long messages into claims and groups the reports", async () => {
		const { done } = await verify(
			text("Mensagem longa de corrente. ".repeat(20)),
		);

		expect(calls.extract).toBe(1);
		expect(done.href).toStartWith("/g/");
		const group = await getGroupReports(done.href.slice(3));
		expect(group?.map((entry) => entry.report.claim)).toEqual([
			"Primeira alegação verificável",
			"Segunda alegação verificável",
		]);
	});

	test("refreshing skips the cache and links to the previous version", async () => {
		const original = await verify(text("O salário mínimo subiu"));
		const previousId = original.done.created[0] ?? "";
		const refreshed = await verify({ kind: "refresh", reportId: previousId });

		expect(calls.search).toBe(2);
		const report = await getReport(refreshed.done.created[0] ?? "");
		expect(report?.previousId).toBe(previousId);
		expect(report?.claim).toBe("O salário mínimo subiu");
	});

	test("refreshing a missing report fails with not_found", async () => {
		await expect(
			verify({ kind: "refresh", reportId: "missing" }),
		).rejects.toMatchObject({
			code: "not_found",
		});
	});
});

describe("deleteReport", () => {
	test("only the delete token from the verification can remove the report", async () => {
		const { done } = await verify(text("O Senado aprovou a reforma"));
		const id = done.created[0] ?? "";
		await saveFeedback(id, "other", "comentário");

		expect(await deleteReport(id, "wrong-token")).toBe(false);
		expect(await getReport(id)).not.toBeNull();
		expect(await deleteReport(id, done.deleteToken)).toBe(true);
		expect(await getReport(id)).toBeNull();
	});
});
