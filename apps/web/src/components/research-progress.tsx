import { Check, Loader2 } from "lucide-react";
import type { VerifyEvent } from "@/app/api/verify/route";

type Step = { stage: VerifyEvent["stage"]; label: string };

export function ResearchProgress({
	events,
	isUrl,
}: {
	events: VerifyEvent[];
	isUrl: boolean;
}) {
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
		<section aria-live="polite" className="bg-card rounded-xl border p-5">
			<h2 className="text-sm font-medium">Pesquisa em andamento</h2>
			{searching ? (
				<p className="text-muted-foreground mt-1 text-sm">
					Alegação: <span className="text-foreground">“{searching.claim}”</span>
				</p>
			) : null}
			<ol className="mt-4 space-y-3">
				{steps.map((step, index) => {
					const isDone =
						index < activeIndex || (step.stage === "sources" && Boolean(found));
					const isActive = !isDone && index === activeIndex;
					return (
						<li key={step.stage} className="flex items-center gap-3 text-sm">
							<span className="grid size-5 place-items-center rounded-full border">
								{isDone ? <Check className="size-3" aria-hidden /> : null}
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
				Uma verificação costuma levar entre 20 e 60 segundos.
			</p>
		</section>
	);
}
