"use client";

import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@desconfia/ui/components/alert";
import { Button } from "@desconfia/ui/components/button";
import { AlertCircle, ArrowRight, Link2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { VerifyEvent } from "@/app/api/verify/route";
import { useFocusOnMount } from "@/hooks/use-focus-on-mount";
import { parseInput } from "@/lib/research/input";
import { ResearchProgress } from "./research-progress";

const exampleClaims = [
	"O governo criou um imposto sobre o PIX",
	"O Bolsa Família paga R$ 600 para qualquer pessoa",
	"O presidente pode se reeleger quantas vezes quiser",
];

type Failure = { code: string; message: string };

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
		for (const line of lines)
			if (line.trim()) yield JSON.parse(line) as VerifyEvent;
	}
}

export function ClaimForm() {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [fieldError, setFieldError] = useState<string | null>(null);
	const [failure, setFailure] = useState<Failure | null>(null);
	const [events, setEvents] = useState<VerifyEvent[] | null>(null);
	const requestRef = useRef<AbortController | null>(null);

	const isRunning = events !== null && !failure;

	async function verify() {
		const parsed = parseInput(query);
		if (!parsed.ok) {
			setFieldError(parsed.error);
			return;
		}

		setFieldError(null);
		setFailure(null);
		setEvents([]);

		const request = new AbortController();
		requestRef.current = request;

		try {
			const response = await fetch("/api/verify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query }),
				signal: request.signal,
			});

			if (!response.ok) {
				setFailure(await response.json());
				return;
			}

			for await (const event of readEvents(response)) {
				if (event.stage === "done") return router.push(`/r/${event.id}`);
				if (event.stage === "error") return setFailure(event);
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

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (!isRunning) verify();
	}

	return (
		<div className="space-y-4">
			<form onSubmit={handleSubmit} noValidate>
				<label htmlFor="claim" className="sr-only">
					Alegação ou link da notícia
				</label>
				<div className="bg-card focus-within:border-ring focus-within:ring-ring/30 has-aria-invalid:border-destructive flex flex-col gap-2 rounded-xl border p-2 shadow-sm transition-shadow focus-within:ring-2 sm:flex-row sm:items-start">
					<div className="flex flex-1 items-start gap-3 px-2 pt-2.5">
						<Link2
							className="text-muted-foreground mt-0.5 size-4 shrink-0"
							aria-hidden
						/>
						<textarea
							id="claim"
							name="claim"
							rows={1}
							value={query}
							disabled={isRunning}
							maxLength={1000}
							onChange={(event) => setQuery(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter" && !event.shiftKey)
									handleSubmit(event);
							}}
							placeholder="Cole o link da notícia ou digite a alegação…"
							aria-invalid={fieldError ? true : undefined}
							aria-describedby={fieldError ? "claim-error" : undefined}
							className="placeholder:text-muted-foreground field-sizing-content max-h-48 min-h-6 w-full resize-none bg-transparent text-base outline-none disabled:opacity-60"
						/>
					</div>
					<Button
						type="submit"
						size="lg"
						disabled={isRunning}
						className="h-11 rounded-lg px-5 text-sm"
					>
						{isRunning ? (
							<Loader2 className="animate-spin" aria-hidden />
						) : null}
						{isRunning ? "Verificando" : "Verificar"}
						{isRunning ? null : <ArrowRight aria-hidden />}
					</Button>
				</div>
				{fieldError ? (
					<p id="claim-error" className="text-destructive mt-2 text-sm">
						{fieldError}
					</p>
				) : null}
			</form>

			{!events ? (
				<div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
					<span>Exemplos:</span>
					{exampleClaims.map((claim) => (
						<button
							key={claim}
							type="button"
							onClick={() => setQuery(claim)}
							className="bg-card hover:border-foreground/30 hover:text-foreground focus-visible:outline-ring rounded-full border px-3 py-1 focus-visible:outline-2"
						>
							“{claim}”
						</button>
					))}
				</div>
			) : null}

			{isRunning ? (
				<ResearchProgress
					events={events}
					isUrl={/^https?:\/\//i.test(query.trim())}
					onCancel={cancel}
				/>
			) : null}

			{failure ? <FailureAlert failure={failure} onRetry={verify} /> : null}
		</div>
	);
}

function FailureAlert({
	failure,
	onRetry,
}: {
	failure: Failure;
	onRetry: () => void;
}) {
	const ref = useFocusOnMount<HTMLDivElement>();

	if (failure.code === "demo_mode") {
		return (
			<Alert ref={ref} tabIndex={-1} className="p-4 text-sm outline-none">
				<AlertCircle aria-hidden />
				<AlertTitle>Modo demonstração</AlertTitle>
				<AlertDescription className="text-sm">
					A pesquisa ao vivo não está configurada neste ambiente, então nenhuma
					verificação real foi feita. Veja os{" "}
					<Link href="/#exemplos">relatórios de exemplo</Link> para conhecer o
					formato.
				</AlertDescription>
			</Alert>
		);
	}

	const canRetry = failure.code !== "invalid_input";
	return (
		<Alert
			ref={ref}
			tabIndex={-1}
			variant="destructive"
			className="p-4 text-sm outline-none"
		>
			<AlertCircle aria-hidden />
			<AlertTitle>Não foi possível concluir a verificação</AlertTitle>
			<AlertDescription className="space-y-3 text-sm">
				<p>{failure.message}</p>
				{canRetry ? (
					<Button variant="outline" size="sm" onClick={onRetry}>
						Tentar novamente
					</Button>
				) : null}
			</AlertDescription>
		</Alert>
	);
}
