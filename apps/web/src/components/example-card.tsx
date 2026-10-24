import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ViewTransition } from "react";
import { claimTransitionName, type Report } from "@/lib/report";
import { VerdictBadge } from "./verdict-badge";

export function ExampleCard({
	slug,
	report,
}: {
	slug: string;
	report: Report;
}) {
	return (
		<Link
			href={`/exemplos/${slug}`}
			className="group bg-card hover:border-foreground/25 focus-visible:outline-ring flex h-full flex-col gap-3 rounded-xl border p-5 transition-[border-color,box-shadow,translate] duration-200 hover:shadow-md focus-visible:outline-2 motion-safe:hover:-translate-y-0.5"
		>
			<VerdictBadge verdict={report.verdict} />
			<ViewTransition name={claimTransitionName(slug)}>
				<p className="leading-snug font-medium">“{report.claim}”</p>
			</ViewTransition>
			<p className="text-muted-foreground line-clamp-3 flex-1 text-sm leading-relaxed">
				{report.summary}
			</p>
			<span className="inline-flex items-center gap-1 text-sm font-medium">
				Ver relatório
				<ArrowRight
					className="size-3.5 transition-transform group-hover:translate-x-0.5"
					aria-hidden
				/>
			</span>
		</Link>
	);
}
