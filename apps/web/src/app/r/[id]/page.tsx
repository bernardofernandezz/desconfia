import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeedbackForm } from "@/components/feedback-form";
import { ReportToolbar } from "@/components/report-toolbar";
import { ReportView } from "@/components/report-view";
import { verdictLabels } from "@/lib/report";
import { getReport } from "@/lib/reports";

export async function generateMetadata(
	props: PageProps<"/r/[id]">,
): Promise<Metadata> {
	const report = await getReport((await props.params).id);
	if (!report) return { title: "Relatório não encontrado" };

	const title = `${verdictLabels[report.verdict]}: “${report.claim}”`;
	return {
		title,
		description: report.summary,
		openGraph: { title, description: report.summary },
		robots: { index: false, follow: false },
	};
}

export default async function ReportPage(props: PageProps<"/r/[id]">) {
	const { id } = await props.params;
	const report = await getReport(id);
	if (!report) notFound();

	return (
		<div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6 sm:py-16">
			<ReportView report={report} />
			<ReportToolbar
				entry={{
					id,
					claim: report.claim,
					verdict: report.verdict,
					researchedAt: report.researchedAt,
				}}
			/>
			<FeedbackForm reportId={id} />
		</div>
	);
}
