import { describe, expect, test } from "bun:test";
import {
	MAX_IMAGE_BYTES,
	normalizeClaim,
	parseImage,
	parseInput,
} from "./input";

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

describe("parseImage", () => {
	const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
	const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
	const webp = new Uint8Array([
		0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
	]);

	test.each([
		["image/png", png],
		["image/jpeg", jpeg],
		["image/webp", webp],
	])("detects %s from its bytes", (mediaType, bytes) => {
		expect(parseImage(bytes)).toMatchObject({ ok: true, image: { mediaType } });
	});

	test("rejects files that only pretend to be images", () => {
		expect(parseImage(new TextEncoder().encode("<svg onload=x>")).ok).toBe(
			false,
		);
		expect(parseImage(webp.slice(0, 8)).ok).toBe(false);
		expect(parseImage(new Uint8Array()).ok).toBe(false);
	});

	test("rejects images over the size limit", () => {
		const big = new Uint8Array(MAX_IMAGE_BYTES + 1);
		big.set(png);
		expect(parseImage(big).ok).toBe(false);
	});
});

describe("normalizeClaim", () => {
	test("ignores case, spacing and surrounding punctuation", () => {
		expect(normalizeClaim("  “O governo  criou imposto sobre o PIX!” ")).toBe(
			normalizeClaim("o governo criou imposto sobre o pix"),
		);
	});
});
