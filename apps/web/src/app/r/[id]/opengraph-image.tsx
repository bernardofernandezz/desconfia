import { renderReportImage, reportImageSize } from "@/lib/report-image";
import { getReport } from "@/lib/reports";

export const alt = "Avaliação e alegação verificadas pelo Desconfia";
export const size = reportImageSize;
export const contentType = "image/png";

export default async function Image({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const report = await getReport((await params).id);
	return renderReportImage(report ?? undefined);
}
