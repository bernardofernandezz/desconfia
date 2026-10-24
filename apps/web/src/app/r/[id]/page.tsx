import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportView } from "@/components/report-view";
import { verdictLabels } from "@/lib/report";
import { getReport } from "@/lib/reports";

export async function generateMetadata(
	props: PageProps<"/r/[id]">,
): Promise<Metadata> {
	const report = await getReport((await props.params).id);
	return {
		title: report
			? `${verdictLabels[report.verdict]} — relatório de verificação`
			: "Relatório não encontrado",
		robots: { index: false, follow: false },
	};
}

export default async function ReportPage(props: PageProps<"/r/[id]">) {
	const report = await getReport((await props.params).id);
	if (!report) notFound();

	return (
		<div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
			<ReportView report={report} />
		</div>
	);
}
