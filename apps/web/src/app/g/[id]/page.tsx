import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareActions } from "@/components/share-actions";
import { VerdictBadge } from "@/components/verdict-badge";
import { verdictLabels } from "@/lib/report";
import { getGroupReports } from "@/lib/reports";

export const metadata: Metadata = {
	title: "Verificação de várias alegações",
	robots: { index: false, follow: false },
};

export default async function GroupPage(props: PageProps<"/g/[id]">) {
	const entries = await getGroupReports((await props.params).id);
	if (!entries?.length) notFound();

	const shareText = [
		`*${entries.length} alegações* verificadas pelo Desconfia`,
		...entries.map(
			({ report }) => `${verdictLabels[report.verdict]}: “${report.claim}”`,
		),
	].join("\n\n");

	return (
		<div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6 sm:py-16">
			<header className="space-y-4">
				<p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
					Verificação de mensagem
				</p>
				<h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
					Encontramos {entries.length} alegações nesta mensagem
				</h1>
				<p className="text-muted-foreground">
					Cada alegação foi pesquisada separadamente. Abra o relatório completo
					para ver as evidências e as fontes.
				</p>
				<ShareActions title="Verificação do Desconfia" text={shareText} />
			</header>

			<ol className="space-y-4">
				{entries.map(({ id, report }, index) => (
					<li
						key={id}
						className="bg-card motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 fill-mode-both space-y-3 rounded-xl border p-5 duration-500"
						style={{ animationDelay: `${index * 80}ms` }}
					>
						<div className="flex items-center gap-3">
							<span className="text-muted-foreground font-mono text-xs">
								{index + 1}
							</span>
							<VerdictBadge verdict={report.verdict} />
							<span className="text-muted-foreground text-xs">
								Confiança {report.confidence}
							</span>
						</div>
						<p className="font-medium">“{report.claim}”</p>
						<p className="text-muted-foreground text-sm leading-relaxed">
							{report.summary}
						</p>
						<Link
							href={`/r/${id}`}
							className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
						>
							Ver relatório completo
							<ArrowRight className="size-3.5" aria-hidden />
						</Link>
					</li>
				))}
			</ol>
		</div>
	);
}
