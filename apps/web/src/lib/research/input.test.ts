import { describe, expect, test } from "bun:test";
import { parseInput } from "./input";

describe("parseInput", () => {
	test("accepts a text claim", () => {
		expect(parseInput("O governo criou imposto sobre o PIX")).toEqual({
			ok: true,
			input: { kind: "text", claim: "O governo criou imposto sobre o PIX" },
		});
	});

	test("rejects short or empty input", () => {
		expect(parseInput("curto").ok).toBe(false);
		expect(parseInput(42).ok).toBe(false);
	});

	test("accepts public http(s) links", () => {
		const result = parseInput("https://g1.globo.com/politica/noticia.ghtml");
		expect(result.ok && result.input.kind).toBe("url");
	});

	test.each([
		"http://localhost:3000/admin",
		"http://127.0.0.1/x",
		"http://2130706433/x",
		"http://169.254.169.254/latest/meta-data",
		"http://10.0.0.5/x",
		"http://192.168.1.1/x",
		"http://[::1]/x",
		"http://metadata.google.internal/x",
		"file:///etc/passwd",
		"ftp://example.com/file",
		"https://user:pass@example.com/x",
		"http://intranet/x",
	])("rejects unsafe link %s", (url) => {
		expect(parseInput(url).ok).toBe(false);
	});
});
