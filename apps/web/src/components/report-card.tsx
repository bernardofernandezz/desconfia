import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import type { Report } from "@/lib/report";
import { VerdictBadge } from "./verdict-badge";

type ReportCardProps<T extends string> = {
	href: Route<T>;
	report: Report;
	transitionName?: string;
};

export function ReportCard<T extends string>({
	href,
	report,
	transitionName,
}: ReportCardProps<T>) {
	const claim = <p className="leading-snug font-medium">“{report.claim}”</p>;

	return (
		<Link
			href={href}
			className="group bg-card hover:border-foreground/25 focus-visible:outline-ring flex h-full flex-col gap-3 rounded-xl border p-5 transition-[border-color,box-shadow,translate] duration-200 hover:shadow-md focus-visible:outline-2 motion-safe:hover:-translate-y-0.5"
		>
			<VerdictBadge verdict={report.verdict} />
			{transitionName ? (
				<ViewTransition name={transitionName}>{claim}</ViewTransition>
			) : (
				claim
			)}
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
