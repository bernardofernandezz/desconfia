import { z } from "zod";

export type ImageInput = { data: Uint8Array; mediaType: ImageType };

export type ResearchInput =
	| { kind: "text"; claim: string }
	| { kind: "url"; url: string }
	| { kind: "image"; image: ImageInput };

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const imageSignatures = {
	"image/png": [0x89, 0x50, 0x4e, 0x47],
	"image/jpeg": [0xff, 0xd8, 0xff],
	"image/webp": [0x52, 0x49, 0x46, 0x46],
} as const;

type ImageType = keyof typeof imageSignatures;

export const acceptedImageTypes = Object.keys(imageSignatures) as ImageType[];

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

export function normalizeClaim(claim: string) {
	return claim
		.normalize("NFC")
		.toLocaleLowerCase("pt-BR")
		.replace(/\s+/g, " ")
		.replace(/^[\s"'“”‘’.,!?]+|[\s"'“”‘’.,!?]+$/g, "");
}

function detectImageType(bytes: Uint8Array): ImageType | null {
	const matches = (signature: readonly number[], offset = 0) =>
		signature.every((byte, index) => bytes[offset + index] === byte);
	const isWebp = matches([0x57, 0x45, 0x42, 0x50], 8);

	for (const type of acceptedImageTypes) {
		if (matches(imageSignatures[type]) && (type !== "image/webp" || isWebp))
			return type;
	}
	return null;
}

export function parseImage(
	bytes: Uint8Array,
): { ok: true; image: ImageInput } | { ok: false; error: string } {
	if (bytes.length === 0) return { ok: false, error: "A imagem está vazia." };
	if (bytes.length > MAX_IMAGE_BYTES)
		return { ok: false, error: "A imagem pode ter no máximo 5 MB." };

	const mediaType = detectImageType(bytes);
	if (!mediaType)
		return { ok: false, error: "Envie uma imagem PNG, JPEG ou WebP." };
	return { ok: true, image: { data: bytes, mediaType } };
}
