import { Button } from "@desconfia/ui/components/button";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { VerifyEvent } from "@/app/api/verify/route";
import { useFocusOnMount } from "@/hooks/use-focus-on-mount";

type Step = { stage: VerifyEvent["stage"]; label: string };

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

type ResearchProgressProps = {
	events: VerifyEvent[];
	isUrl: boolean;
	onCancel: () => void;
};

export function ResearchProgress({
	events,
	isUrl,
	onCancel,
}: ResearchProgressProps) {
	const ref = useFocusOnMount<HTMLElement>();
	const elapsed = useElapsedSeconds();
	const found = events.find((event) => event.stage === "sources");
	const searching = events.find((event) => event.stage === "searching");

	const steps: Step[] = [
		...(isUrl
			? [{ stage: "reading_url" as const, label: "Lendo o conteúdo do link" }]
			: []),
		{ stage: "searching", label: "Pesquisando fontes oficiais e na imprensa" },
		{
			stage: "sources",
			label: found ? `${found.count} fontes recuperadas` : "Recuperando fontes",
		},
		{ stage: "analyzing", label: "Analisando as evidências" },
	];
	const lastStage = events.at(-1)?.stage;
	const activeIndex = Math.max(
		0,
		steps.findIndex((step) => step.stage === lastStage),
	);

	return (
		<section
			ref={ref}
			tabIndex={-1}
			className="bg-card motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 rounded-xl border p-5 duration-300 outline-none"
		>
			<div className="flex items-center justify-between gap-4">
				<h2 className="text-sm font-medium">Pesquisa em andamento</h2>
				<Button variant="ghost" size="sm" onClick={onCancel}>
					Cancelar
				</Button>
			</div>
			{searching ? (
				<p className="text-muted-foreground mt-1 text-sm">
					Alegação: <span className="text-foreground">“{searching.claim}”</span>
				</p>
			) : null}
			<ol aria-live="polite" className="mt-4 space-y-3">
				{steps.map((step, index) => {
					const isDone =
						index < activeIndex || (step.stage === "sources" && Boolean(found));
					const isActive = !isDone && index === activeIndex;
					return (
						<li key={step.stage} className="flex items-center gap-3 text-sm">
							<span
								className={`grid size-5 place-items-center rounded-full border transition-colors duration-300 ${isDone ? "border-foreground bg-foreground text-background" : ""}`}
							>
								{isDone ? (
									<Check
										className="motion-safe:animate-in motion-safe:zoom-in-50 size-3 duration-200"
										aria-hidden
									/>
								) : null}
								{isActive ? (
									<Loader2 className="size-3 animate-spin" aria-hidden />
								) : null}
							</span>
							<span
								className={
									isDone || isActive
										? "text-foreground"
										: "text-muted-foreground"
								}
							>
								{step.label}
								<span className="sr-only">
									{isDone
										? " (concluído)"
										: isActive
											? " (em andamento)"
											: " (pendente)"}
								</span>
							</span>
						</li>
					);
				})}
			</ol>
			<p className="text-muted-foreground mt-4 text-xs">
				<span className="text-foreground tabular-nums">{elapsed} s</span>{" "}
				decorridos · uma verificação costuma levar entre 20 e 60 segundos.
			</p>
		</section>
	);
}
