import { createHmac, timingSafeEqual } from "node:crypto";
import { type Report, verdictLabels } from "./report";
import { MAX_IMAGE_BYTES } from "./research/input";

const GRAPH_API = "https://graph.facebook.com/v23.0";

export type WhatsAppConfig = {
	accessToken: string;
	phoneNumberId: string;
	appSecret: string;
	verifyToken: string;
};

export type IncomingMessage =
	| { from: string; kind: "text"; text: string }
	| { from: string; kind: "image"; mediaId: string }
	| { from: string; kind: "unsupported" };

type WebhookMessage = {
	from?: string;
	type?: string;
	text?: { body?: string };
	image?: { id?: string };
};

type WebhookPayload = {
	entry?: { changes?: { value?: { messages?: WebhookMessage[] } }[] }[];
};

export function isValidSignature(
	rawBody: string,
	signatureHeader: string | null,
	appSecret: string,
) {
	const received = signatureHeader?.match(/^sha256=([a-f0-9]{64})$/)?.[1];
	if (!received) return false;

	const expected = createHmac("sha256", appSecret).update(rawBody).digest();
	return timingSafeEqual(expected, Buffer.from(received, "hex"));
}

export function parseWebhook(payload: unknown): IncomingMessage[] {
	const messages = ((payload as WebhookPayload | null)?.entry ?? []).flatMap(
		(entry) =>
			(entry.changes ?? []).flatMap((change) => change.value?.messages ?? []),
	);

	return messages.flatMap((message): IncomingMessage[] => {
		const from = message.from;
		if (!from) return [];
		if (message.type === "text" && message.text?.body)
			return [{ from, kind: "text", text: message.text.body }];
		if (message.type === "image" && message.image?.id)
			return [{ from, kind: "image", mediaId: message.image.id }];
		return [{ from, kind: "unsupported" }];
	});
}

export function formatReply(
	reports: { url: string; report: Report }[],
	groupUrl?: string,
) {
	const lines = reports.map(
		({ report, url }) =>
			`*${verdictLabels[report.verdict]}* — “${report.claim}”\n${report.summary}${groupUrl ? "" : `\n\nRelatório completo: ${url}`}`,
	);
	if (!groupUrl) return lines.join("\n\n");

	return [
		`Encontrei ${reports.length} alegações nessa mensagem:`,
		...lines,
		`Relatórios completos: ${groupUrl}`,
	].join("\n\n");
}

export async function sendText(
	config: WhatsAppConfig,
	to: string,
	body: string,
) {
	const response = await fetch(
		`${GRAPH_API}/${config.phoneNumberId}/messages`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${config.accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				messaging_product: "whatsapp",
				to,
				type: "text",
				text: { body, preview_url: true },
			}),
		},
	);
	if (!response.ok) throw new Error(`WhatsApp send failed: ${response.status}`);
}

const metaMediaHosts = [".fbsbx.com", ".whatsapp.net", ".fbcdn.net"];

// The media URL comes from Meta's API, but we still refuse to fetch anything outside its CDNs.
function isMetaMediaUrl(value: string) {
	const url = new URL(value);
	return (
		url.protocol === "https:" &&
		metaMediaHosts.some((host) => url.hostname.endsWith(host))
	);
}

export async function downloadMedia(config: WhatsAppConfig, mediaId: string) {
	const headers = { Authorization: `Bearer ${config.accessToken}` };
	const meta = await fetch(`${GRAPH_API}/${mediaId}`, { headers });
	if (!meta.ok) throw new Error(`WhatsApp media lookup failed: ${meta.status}`);

	const { url, file_size } = (await meta.json()) as {
		url?: string;
		file_size?: number;
	};
	if (!url || !isMetaMediaUrl(url))
		throw new Error("WhatsApp media URL is not a Meta CDN URL");
	if ((file_size ?? 0) > MAX_IMAGE_BYTES) return null;

	const media = await fetch(url, { headers });
	if (!media.ok)
		throw new Error(`WhatsApp media download failed: ${media.status}`);
	return new Uint8Array(await media.arrayBuffer());
}
