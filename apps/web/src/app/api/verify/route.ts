import { isLiveResearchEnabled } from "@/lib/providers";
import { saveReport } from "@/lib/reports";
import { runResearch, type Stage } from "@/lib/research";
import { toResearchError } from "@/lib/research/errors";
import { parseInput } from "@/lib/research/input";

export const maxDuration = 120;

export type VerifyEvent =
	| Stage
	| { stage: "done"; id: string }
	| { stage: "error"; code: string; message: string };

const RESEARCH_TIMEOUT_MS = 100_000;
const RATE_LIMIT = { max: 5, windowMs: 10 * 60_000 };
// shortcut: in-memory, per server instance; move to a shared store (e.g. Redis) before running multiple instances
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string) {
	const now = Date.now();
	const recent = (requestLog.get(ip) ?? []).filter(
		(time) => now - time < RATE_LIMIT.windowMs,
	);
	requestLog.set(ip, [...recent, now]);
	return recent.length >= RATE_LIMIT.max;
}

const jsonError = (status: number, code: string, message: string) =>
	Response.json({ stage: "error", code, message } satisfies VerifyEvent, {
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

	const body = await request.json().catch(() => null);
	const parsed = parseInput(body?.query);
	if (!parsed.ok) return jsonError(400, "invalid_input", parsed.error);

	const ip =
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
	if (isRateLimited(ip)) {
		return jsonError(
			429,
			"rate_limit",
			"Você fez muitas verificações seguidas. Aguarde alguns minutos.",
		);
	}

	const signal = AbortSignal.any([
		request.signal,
		AbortSignal.timeout(RESEARCH_TIMEOUT_MS),
	]);
	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		async start(controller) {
			const send = (event: VerifyEvent) =>
				controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
			try {
				const report = await runResearch(parsed.input, signal, send);
				send({ stage: "done", id: await saveReport(report) });
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
