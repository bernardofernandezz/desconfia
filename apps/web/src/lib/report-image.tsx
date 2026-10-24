import { ImageResponse } from "next/og";
import { type Report, type Verdict, verdictLabels } from "./report";

export const reportImageSize = { width: 1200, height: 630 };

// Satori does not understand oklch, so the verdict tokens are mirrored here as hex.
const verdictColors: Record<Verdict, { text: string; background: string }> = {
	supported: { text: "#1f7a4d", background: "#e3f2ea" },
	contradicted: { text: "#b4322a", background: "#fbe5e3" },
	misleading: { text: "#8a5a12", background: "#f8ecd8" },
	inconclusive: { text: "#4b5563", background: "#eceef1" },
};

const truncate = (text: string, max: number) =>
	text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

export function renderReportImage(report: Report | undefined) {
	const colors = report ? verdictColors[report.verdict] : null;

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: 72,
				background: "#fbfbfd",
				color: "#111111",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
				<div
					style={{
						width: 48,
						height: 48,
						borderRadius: 10,
						background: "#111111",
						color: "#ffffff",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<svg
						width="28"
						height="28"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden
					>
						<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
						<path d="m9 12 2 2 4-4" />
					</svg>
				</div>
				<div style={{ fontSize: 34, fontWeight: 600 }}>Desconfia</div>
			</div>

			{report && colors ? (
				<div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
					<div
						style={{
							display: "flex",
							alignSelf: "flex-start",
							padding: "8px 22px",
							borderRadius: 999,
							fontSize: 30,
							fontWeight: 600,
							color: colors.text,
							background: colors.background,
						}}
					>
						{verdictLabels[report.verdict]}
					</div>
					<div style={{ fontSize: 54, fontWeight: 600, lineHeight: 1.15 }}>
						{`“${truncate(report.claim, 120)}”`}
					</div>
				</div>
			) : (
				<div style={{ fontSize: 60, fontWeight: 600, lineHeight: 1.1 }}>
					Cheque o que você vê. Com base em evidências.
				</div>
			)}

			<div style={{ fontSize: 26, color: "#6b7280" }}>
				Relatório de verificação com fontes e nível de confiança
			</div>
		</div>,
		reportImageSize,
	);
}
