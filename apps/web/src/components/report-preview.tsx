import { ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import type { Report } from "@/lib/report";
import { VerdictBadge } from "./verdict-badge";

export function ReportPreview({
	slug,
	report,
}: {
	slug: string;
	report: Report;
}) {
	return (
		<div className="relative">
			<div
				aria-hidden
				className="bg-card/60 absolute inset-0 translate-x-6 -translate-y-4 rotate-3 rounded-2xl border"
			/>
			<div
				aria-hidden
				className="bg-card/60 absolute inset-0 -translate-x-5 translate-y-3 -rotate-2 rounded-2xl border"
			/>
			<div className="bg-card shadow-foreground/5 relative space-y-4 rounded-2xl border p-6 shadow-xl">
				<p className="text-muted-foreground text-xs">Exemplo de relatório</p>
				<VerdictBadge verdict={report.verdict} />
				<p className="text-lg leading-snug font-semibold tracking-tight">
					“{report.claim}”
				</p>
				<p className="text-muted-foreground text-sm leading-relaxed">
					{report.summary}
				</p>
				<div className="space-y-2 border-t pt-4">
					<p className="text-sm font-medium">Principais evidências</p>
					{report.sources.map((source) => (
						<p
							key={source.id}
							className="text-muted-foreground flex items-start gap-2 text-xs"
						>
							<FileText className="mt-0.5 size-3.5 shrink-0" aria-hidden />
							{source.title}
						</p>
					))}
				</div>
				<Link
					href={`/exemplos/${slug}`}
					className="inline-flex items-center gap-1 border-t pt-4 text-sm font-medium hover:underline"
				>
					Ver relatório completo <ArrowRight className="size-3.5" aria-hidden />
				</Link>
			</div>
		</div>
	);
}
