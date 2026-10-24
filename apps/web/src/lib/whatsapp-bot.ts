import { ENV } from "@/env.server";
import { isRateLimited } from "./rate-limit";
import { getReport } from "./reports";
import { toResearchError } from "./research/errors";
import { parseImage, parseInput, type ResearchInput } from "./research/input";
import { siteUrl } from "./site-url";
import { runVerification } from "./verification";
import {
	downloadMedia,
	formatReply,
	type IncomingMessage,
	sendText,
	type WhatsAppConfig,
} from "./whatsapp";

const VERIFICATION_TIMEOUT_MS = 240_000;

const HELP_TEXT =
	"Olá! Envie o texto, o link ou o print da mensagem que você quer verificar e eu respondo com o que as fontes dizem.";
const ACK_TEXT =
	"Recebi! Estou pesquisando fontes oficiais e na imprensa. Isso costuma levar cerca de um minuto.";
const RATE_LIMIT_TEXT =
	"Você enviou muitas verificações na última hora. Tente de novo mais tarde.";

export function whatsAppConfig(): WhatsAppConfig | null {
	const {
		WHATSAPP_ACCESS_TOKEN: accessToken,
		WHATSAPP_PHONE_NUMBER_ID: phoneNumberId,
		WHATSAPP_APP_SECRET: appSecret,
		WHATSAPP_VERIFY_TOKEN: verifyToken,
	} = ENV;
	if (!accessToken || !phoneNumberId || !appSecret || !verifyToken) return null;
	return { accessToken, phoneNumberId, appSecret, verifyToken };
}

async function toInput(
	config: WhatsAppConfig,
	message: Exclude<IncomingMessage, { kind: "unsupported" }>,
): Promise<{ ok: true; input: ResearchInput } | { ok: false; error: string }> {
	if (message.kind === "text") {
		const parsed = parseInput(message.text);
		return parsed.ok ? parsed : { ok: false, error: HELP_TEXT };
	}

	const bytes = await downloadMedia(config, message.mediaId);
	if (!bytes) return { ok: false, error: "A imagem pode ter no máximo 5 MB." };
	const parsed = parseImage(bytes);
	return parsed.ok
		? { ok: true, input: { kind: "image", image: parsed.image } }
		: parsed;
}

export async function handleMessage(
	config: WhatsAppConfig,
	message: IncomingMessage,
) {
	const reply = (body: string) => sendText(config, message.from, body);

	if (message.kind === "unsupported") return reply(HELP_TEXT);
	if (await isRateLimited("whatsapp", message.from))
		return reply(RATE_LIMIT_TEXT);

	const parsed = await toInput(config, message);
	if (!parsed.ok) return reply(parsed.error);
	await reply(ACK_TEXT);

	try {
		const { href, reportIds } = await runVerification(
			{ kind: "new", input: parsed.input },
			AbortSignal.timeout(VERIFICATION_TIMEOUT_MS),
			() => {},
		);
		const base = siteUrl();
		const reports = await Promise.all(
			reportIds.map(async (id) => ({
				url: `${base}/r/${id}`,
				report: await getReport(id),
			})),
		);
		const found = reports.flatMap(({ url, report }) =>
			report ? [{ url, report }] : [],
		);
		await reply(
			formatReply(found, reportIds.length > 1 ? `${base}${href}` : undefined),
		);
	} catch (error) {
		const { message: reason } = toResearchError(error);
		await reply(
			`Não consegui concluir a verificação. ${reason} Tente de novo em alguns minutos.`,
		);
	}
}
