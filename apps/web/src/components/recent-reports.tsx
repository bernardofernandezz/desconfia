"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
	clearRecentReports,
	getRecentReports,
	type RecentReport,
} from "@/lib/local-reports";
import { VerdictBadge } from "./verdict-badge";

const VISIBLE_REPORTS = 4;

export function RecentReports() {
	const [reports, setReports] = useState<RecentReport[]>([]);

	useEffect(() => setReports(getRecentReports()), []);

	if (reports.length === 0) return null;

	function clear() {
		clearRecentReports();
		setReports([]);
	}

	return (
		<section aria-labelledby="recentes" className="space-y-3">
			<div className="flex items-center justify-between gap-4">
				<h2 id="recentes" className="text-sm font-medium">
					Vistos recentemente neste aparelho
				</h2>
				<button
					type="button"
					onClick={clear}
					className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2"
				>
					Limpar histórico
				</button>
			</div>
			<ul className="divide-y rounded-xl border">
				{reports.slice(0, VISIBLE_REPORTS).map((report) => (
					<li key={report.id}>
						<Link
							href={`/r/${report.id}`}
							className="hover:bg-muted/50 flex items-center gap-3 px-4 py-3 text-sm"
						>
							<VerdictBadge verdict={report.verdict} />
							<span className="truncate">{report.claim}</span>
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
