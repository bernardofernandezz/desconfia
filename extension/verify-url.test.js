import { expect, test } from "bun:test";
import { buildVerifyUrl, isSiteUrl } from "./verify-url.js";

test("opens the landing page with the selection as the claim", () => {
	expect(
		buildVerifyUrl("https://desconfia.app", "  O governo criou um imposto  "),
	).toBe("https://desconfia.app/?q=O+governo+criou+um+imposto");
});

test("falls back to the default site and caps the claim length", () => {
	const url = new URL(buildVerifyUrl("javascript:alert(1)", "a".repeat(2000)));
	expect(url.origin).toBe("http://localhost:3001");
	expect(url.searchParams.get("q")).toHaveLength(1000);
});

test("accepts only http and https site addresses", () => {
	expect(isSiteUrl("https://desconfia.app")).toBe(true);
	expect(isSiteUrl("file:///etc/passwd")).toBe(false);
	expect(isSiteUrl("não é url")).toBe(false);
});
