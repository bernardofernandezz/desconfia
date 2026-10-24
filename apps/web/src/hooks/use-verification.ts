"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { saveDeleteToken } from "@/lib/local-reports";
import type { VerificationEvent } from "@/lib/verification";

export type Failure = { code: string; message: string };

export type VerificationPayload =
	| { query: string }
	| { image: File }
	| { refreshOf: string };

async function* readEvents(response: Response) {
	const reader = response.body
		?.pipeThrough(new TextDecoderStream())
		.getReader();
	if (!reader) return;

	let buffer = "";
	while (true) {
		const { value, done } = await reader.read();
		if (done) break;
		buffer += value;
		const lines = buffer.split("\n");
		buffer = lines.pop() ?? "";
		for (const line of lines) {
			if (line.trim()) yield JSON.parse(line) as VerificationEvent;
		}
	}
}

function toRequestInit(payload: VerificationPayload, signal: AbortSignal) {
	if ("image" in payload) {
		const form = new FormData();
		form.append("image", payload.image);
		return { method: "POST", body: form, signal };
	}
	return {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
		signal,
	};
}

export function useVerification() {
	const router = useRouter();
	const [events, setEvents] = useState<VerificationEvent[] | null>(null);
	const [failure, setFailure] = useState<Failure | null>(null);
	const requestRef = useRef<AbortController | null>(null);

	const isRunning = events !== null && !failure;

	async function start(payload: VerificationPayload) {
		setFailure(null);
		setEvents([]);

		const request = new AbortController();
		requestRef.current = request;

		try {
			const response = await fetch(
				"/api/verify",
				toRequestInit(payload, request.signal),
			);
			if (!response.ok) {
				setFailure(await response.json());
				return;
			}

			for await (const event of readEvents(response)) {
				if (event.stage === "error") return setFailure(event);
				if (event.stage === "done") {
					saveDeleteToken(event.created, event.deleteToken);
					return router.push(event.href as Route);
				}
				setEvents((current) => [...(current ?? []), event]);
			}
			setFailure({
				code: "provider",
				message: "A conexão foi interrompida antes do fim da pesquisa.",
			});
		} catch {
			if (request.signal.aborted) return;
			setFailure({
				code: "network",
				message:
					"Não foi possível conectar ao servidor. Verifique sua internet.",
			});
		}
	}

	function cancel() {
		requestRef.current?.abort();
		setEvents(null);
	}

	return { events, failure, isRunning, start, cancel };
}
