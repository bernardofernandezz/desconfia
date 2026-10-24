import { describe, expect, test } from "bun:test";
import { createHmac } from "node:crypto";
import type { Report } from "./report";
import { formatReply, isValidSignature, parseWebhook } from "./whatsapp";

describe("isValidSignature", () => {
	const body = '{"entry":[]}';
	const sign = (secret: string) =>
		`sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;

	test("accepts Meta's HMAC signature and rejects anything else", () => {
		expect(isValidSignature(body, sign("segredo"), "segredo")).toBe(true);
		expect(isValidSignature(body, sign("outro"), "segredo")).toBe(false);
		expect(isValidSignature(body, "sha256=abc", "segredo")).toBe(false);
		expect(isValidSignature(body, null, "segredo")).toBe(false);
	});
});

describe("parseWebhook", () => {
	test("extracts text, image and unsupported messages, ignoring status updates", () => {
		const payload = {
			entry: [
				{
					changes: [
						{ value: { statuses: [{ id: "x" }] } },
						{
							value: {
								messages: [
									{ from: "5511", type: "text", text: { body: "oi" } },
									{ from: "5512", type: "image", image: { id: "m1" } },
									{ from: "5513", type: "audio" },
									{ type: "text", text: { body: "sem remetente" } },
								],
							},
						},
					],
				},
			],
		};

		expect(parseWebhook(payload)).toEqual([
			{ from: "5511", kind: "text", text: "oi" },
			{ from: "5512", kind: "image", mediaId: "m1" },
			{ from: "5513", kind: "unsupported" },
		]);
		expect(parseWebhook(null)).toEqual([]);
	});
});

describe("formatReply", () => {
	const report = (claim: string) =>
		({ claim, verdict: "contradicted", summary: "Resumo." }) as Report;

	test("links straight to a single report", () => {
		expect(
			formatReply([{ url: "https://site/r/a", report: report("Alegação") }]),
		).toBe(
			"*Falso* — “Alegação”\nResumo.\n\nRelatório completo: https://site/r/a",
		);
	});

	test("lists every claim and links to the group page", () => {
		const reply = formatReply(
			[
				{ url: "https://site/r/a", report: report("Primeira") },
				{ url: "https://site/r/b", report: report("Segunda") },
			],
			"https://site/g/x",
		);
		expect(reply).toStartWith("Encontrei 2 alegações nessa mensagem:");
		expect(reply).toContain("“Segunda”");
		expect(reply).toEndWith("Relatórios completos: https://site/g/x");
		expect(reply).not.toContain("https://site/r/a");
	});
});
