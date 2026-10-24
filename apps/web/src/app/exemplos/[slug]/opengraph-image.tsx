import { findExample } from "@/lib/examples";
import { renderReportImage, reportImageSize } from "@/lib/report-image";

export const alt = "Relatório de exemplo do Desconfia";
export const size = reportImageSize;
export const contentType = "image/png";

export default async function Image({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	return renderReportImage(findExample((await params).slug)?.report);
}
