import { z } from "zod";

export type ResearchInput =
	| { kind: "text"; claim: string }
	| { kind: "url"; url: string };

const textSchema = z
	.string()
	.trim()
	.min(10, "Descreva a alegação com pelo menos 10 caracteres.")
	.max(1000, "A alegação pode ter no máximo 1000 caracteres.");

const blockedHostSuffixes = [
	".localhost",
	".local",
	".internal",
	".lan",
	".home.arpa",
];

function isPrivateIPv4(host: string) {
	const parts = host.split(".").map(Number);
	if (
		parts.length !== 4 ||
		parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
	)
		return false;
	const [a, b] = parts as [number, number, number, number];
	return (
		a === 0 ||
		a === 10 ||
		a === 127 ||
		(a === 100 && b >= 64 && b <= 127) ||
		(a === 169 && b === 254) ||
		(a === 172 && b >= 16 && b <= 31) ||
		(a === 192 && b === 168) ||
		a >= 224
	);
}

export function isPublicUrl(url: URL) {
	if (url.protocol !== "http:" && url.protocol !== "https:") return false;
	if (url.username || url.password) return false;

	const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
	if (host.includes(":")) return false;
	if (host === "localhost" || !host.includes(".")) return false;
	if (blockedHostSuffixes.some((suffix) => host.endsWith(suffix))) return false;
	return !isPrivateIPv4(host);
}

export function parseInput(
	raw: unknown,
): { ok: true; input: ResearchInput } | { ok: false; error: string } {
	const text = textSchema.safeParse(raw);
	if (!text.success)
		return {
			ok: false,
			error: text.error.issues[0]?.message ?? "Entrada inválida.",
		};

	const value = text.data;
	if (/\s/.test(value) || !URL.canParse(value))
		return { ok: true, input: { kind: "text", claim: value } };

	const url = new URL(value);
	if (!isPublicUrl(url))
		return {
			ok: false,
			error: "Use um link público começando com http:// ou https://.",
		};
	return { ok: true, input: { kind: "url", url: url.toString() } };
}
