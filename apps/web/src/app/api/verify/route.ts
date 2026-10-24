import { isLiveResearchEnabled } from "@/lib/providers";
import { isRateLimited } from "@/lib/rate-limit";
import { toResearchError } from "@/lib/research/errors";
import { MAX_IMAGE_BYTES, parseImage, parseInput } from "@/lib/research/input";
import {
	runVerification,
	type VerificationEvent,
	type VerificationRequest,
} from "@/lib/verification";

export const maxDuration = 300;

const VERIFICATION_TIMEOUT_MS = 240_000;

type ParsedRequest =
	| { ok: true; request: VerificationRequest }
	| { ok: false; status: number; error: string };

const invalid = (error: string, status = 400): ParsedRequest => ({
	ok: false,
	status,
	error,
});

async function readImageRequest(request: Request): Promise<ParsedRequest> {
	const declaredSize = Number(request.headers.get("content-length") ?? 0);
	if (declaredSize > MAX_IMAGE_BYTES + 64 * 1024)
		return invalid("A imagem pode ter no máximo 5 MB.", 413);

	const form = await request.formData().catch(() => null);
	const file = form?.get("image");
	if (!(file instanceof File)) return invalid("Envie uma imagem.");

	const parsed = parseImage(new Uint8Array(await file.arrayBuffer()));
	if (!parsed.ok) return invalid(parsed.error);
	return {
		ok: true,
		request: { kind: "new", input: { kind: "image", image: parsed.image } },
	};
}

async function readJsonRequest(request: Request): Promise<ParsedRequest> {
	const body = await request.json().catch(() => null);
	if (typeof body?.refreshOf === "string") {
		return { ok: true, request: { kind: "refresh", reportId: body.refreshOf } };
	}

	const parsed = parseInput(body?.query);
	if (!parsed.ok) return invalid(parsed.error);
	return { ok: true, request: { kind: "new", input: parsed.input } };
}

const jsonError = (status: number, code: string, message: string) =>
	Response.json({ stage: "error", code, message } satisfies VerificationEvent, {
		status,
	});

export async function POST(request: Request) {
	if (!isLiveResearchEnabled()) {
		return jsonError(
			503,
			"demo_mode",
			"A pesquisa ao vivo não está configurada neste ambiente.",
		);
	}

	const isImage = request.headers
		.get("content-type")
		?.startsWith("multipart/form-data");
	const parsed = isImage
		? await readImageRequest(request)
		: await readJsonRequest(request);
	if (!parsed.ok)
		return jsonError(parsed.status, "invalid_input", parsed.error);

	if (await isRateLimited(request, "verify")) {
		return jsonError(
			429,
			"rate_limit",
			"Você fez muitas verificações seguidas. Aguarde alguns minutos.",
		);
	}

	const signal = AbortSignal.any([
		request.signal,
		AbortSignal.timeout(VERIFICATION_TIMEOUT_MS),
	]);
	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		async start(controller) {
			const send = (event: VerificationEvent) =>
				controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
			try {
				await runVerification(parsed.request, signal, send);
			} catch (error) {
				const { code, message } = toResearchError(error);
				console.error(
					"verify failed:",
					code,
					error instanceof Error ? error.name : "unknown",
				);
				send({ stage: "error", code, message });
			} finally {
				controller.close();
			}
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "application/x-ndjson; charset=utf-8",
			"Cache-Control": "no-store",
		},
	});
}
