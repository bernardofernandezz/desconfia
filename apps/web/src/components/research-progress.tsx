import { Button } from "@desconfia/ui/components/button";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFocusOnMount } from "@/hooks/use-focus-on-mount";
import type { VerificationEvent } from "@/lib/verification";

type ClaimStatus =
	| { kind: "waiting" }
	| { kind: "searching"; sources?: number }
	| { kind: "analyzing" }
	| { kind: "done" }
	| { kind: "cached" };

const readingLabels = {
	url: "Lendo o conteúdo do link",
	image: "Lendo o texto da imagem",
	text: "Separando as alegações do texto",
} as const;

function useElapsedSeconds() {
	const [elapsed, setElapsed] = useState(0);

	useEffect(() => {
		const startedAt = Date.now();
		const timer = setInterval(
			() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)),
			1000,
		);
		return () => clearInterval(timer);
	}, []);

	return elapsed;
}

function claimStatuses(events: VerificationEvent[], count: number) {
	const statuses: ClaimStatus[] = Array.from({ length: count }, () => ({
		kind: "waiting",
	}));

	for (const event of events) {
		if (!("claim" in event)) continue;
		for (let earlier = 0; earlier < event.claim; earlier++) {
			if (statuses[earlier]?.kind !== "cached")
				statuses[earlier] = { kind: "done" };
		}
		if (event.stage === "searching")
			statuses[event.claim] = { kind: "searching" };
		if (event.stage === "sources")
			statuses[event.claim] = { kind: "searching", sources: event.count };
		if (event.stage === "analyzing")
			statuses[event.claim] = { kind: "analyzing" };
		if (event.stage === "cached") statuses[event.claim] = { kind: "cached" };
	}
	return statuses;
}

function statusLabel(status: ClaimStatus) {
	switch (status.kind) {
		case "waiting":
			return "Na fila";
		case "searching":
			return status.sources === undefined
				? "Pesquisando fontes oficiais e na imprensa"
				: `${status.sources} fontes recuperadas`;
		case "analyzing":
			return "Analisando as evidências";
		case "done":
			return "Concluída";
		case "cached":
			return "Já verificada nos últimos 7 dias";
	}
}

function StepIcon({ state }: { state: "active" | "done" | "pending" }) {
	return (
		<span
			className={`grid size-5 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${state === "done" ? "border-foreground bg-foreground text-background" : ""}`}
		>
			{state === "done" ? (
				<Check
					className="motion-safe:animate-in motion-safe:zoom-in-50 size-3 duration-200"
					aria-hidden
				/>
			) : null}
			{state === "active" ? (
				<Loader2 className="size-3 animate-spin" aria-hidden />
			) : null}
		</span>
	);
}

const iconState = (status: ClaimStatus) =>
	status.kind === "done" || status.kind === "cached"
		? "done"
		: status.kind === "waiting"
			? "pending"
			: "active";

type ResearchProgressProps = {
	events: VerificationEvent[];
	onCancel: () => void;
};

export function ResearchProgress({ events, onCancel }: ResearchProgressProps) {
	const ref = useFocusOnMount<HTMLElement>();
	const elapsed = useElapsedSeconds();

	const reading = events.find((event) => event.stage === "reading");
	const claims =
		events.find((event) => event.stage === "claims")?.claims ?? null;
	const statuses = claims ? claimStatuses(events, claims.length) : [];

	return (
		<section
			ref={ref}
			tabIndex={-1}
			className="bg-card motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 rounded-xl border p-5 text-left duration-300 outline-none"
		>
			<div className="flex items-center justify-between gap-4">
				<h2 className="text-sm font-medium">Pesquisa em andamento</h2>
				<Button variant="ghost" size="sm" onClick={onCancel}>
					Cancelar
				</Button>
			</div>

			<ol aria-live="polite" className="mt-4 space-y-4">
				{reading ? (
					<li className="flex items-center gap-3 text-sm">
						<StepIcon state={claims ? "done" : "active"} />
						{claims
							? `Conteúdo lido · ${claims.length} ${claims.length === 1 ? "alegação encontrada" : "alegações encontradas"}`
							: readingLabels[reading.from]}
					</li>
				) : null}
				{!reading && !claims ? (
					<li className="flex items-center gap-3 text-sm">
						<StepIcon state="active" />
						Preparando a pesquisa
					</li>
				) : null}
				{claims?.map((claim, index) => {
					const status = statuses[index] ?? { kind: "waiting" };
					return (
						<li key={claim} className="flex gap-3 text-sm">
							<StepIcon state={iconState(status)} />
							<div className="min-w-0 space-y-0.5">
								<p className="line-clamp-2 font-medium">“{claim}”</p>
								<p className="text-muted-foreground text-xs">
									{statusLabel(status)}
								</p>
							</div>
						</li>
					);
				})}
			</ol>

			<p className="text-muted-foreground mt-4 text-xs">
				<span className="text-foreground tabular-nums">{elapsed} s</span>{" "}
				decorridos · cada alegação costuma levar entre 20 e 60 segundos.
			</p>
		</section>
	);
}
