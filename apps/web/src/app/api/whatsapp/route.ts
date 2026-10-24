import { after } from "next/server";
import { isValidSignature, parseWebhook } from "@/lib/whatsapp";
import { handleMessage, whatsAppConfig } from "@/lib/whatsapp-bot";

export const maxDuration = 300;

// Meta calls this once with a challenge when the webhook is registered.
export async function GET(request: Request) {
	const config = whatsAppConfig();
	if (!config) return new Response(null, { status: 404 });

	const params = new URL(request.url).searchParams;
	const isSubscription =
		params.get("hub.mode") === "subscribe" &&
		params.get("hub.verify_token") === config.verifyToken;
	return isSubscription
		? new Response(params.get("hub.challenge") ?? "")
		: new Response(null, { status: 403 });
}

export async function POST(request: Request) {
	const config = whatsAppConfig();
	if (!config) return new Response(null, { status: 404 });

	const rawBody = await request.text();
	const signature = request.headers.get("x-hub-signature-256");
	if (!isValidSignature(rawBody, signature, config.appSecret)) {
		return new Response(null, { status: 401 });
	}

	let payload: unknown;
	try {
		payload = JSON.parse(rawBody);
	} catch {
		return new Response(null, { status: 400 });
	}

	// Meta expects a quick 200; the verification runs after the response is sent.
	after(async () => {
		for (const message of parseWebhook(payload)) {
			try {
				await handleMessage(config, message);
			} catch (error) {
				console.error(
					"whatsapp reply failed:",
					error instanceof Error ? error.message : "unknown",
				);
			}
		}
	});
	return new Response(null, { status: 200 });
}
