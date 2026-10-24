import { Badge } from "@desconfia/ui/components/badge";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import {
	type Finding,
	formatDate,
	formatShareText,
	type Report,
	sourceKindLabels,
	verdictLabels,
} from "@/lib/report";
import { ShareActions } from "./share-actions";
import { VerdictBadge } from "./verdict-badge";

const evidenceTypeLabels: Record<Finding["evidenceType"], string> = {
	direct: "Evidência direta",
	secondary: "Reportagem",
	inference: "Inferência da análise",
};

const findingGroups: { stance: Finding["stance"]; title: string }[] = [
	{ stance: "supports", title: "O que sustenta a alegação" },
	{ stance: "contradicts", title: "O que contradiz a alegação" },
	{ stance: "context", title: "Contexto" },
];

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="space-y-3">
			<h2 className="text-lg font-semibold tracking-tight">{title}</h2>
			{children}
		</section>
	);
}

function FindingItem({ finding }: { finding: Finding }) {
	return (
		<li className="border-l-2 py-1 pl-4">
			<p className="leading-relaxed text-pretty">
				{finding.text}{" "}
				{finding.sourceIds.map((id) => (
					<a
						key={id}
						href={`#fonte-${id}`}
						className="hover:text-foreground ml-0.5 rounded-sm text-xs font-medium underline underline-offset-2"
						aria-label={`Ver fonte ${id}`}
					>
						[{id}]
					</a>
				))}
			</p>
			<p className="text-muted-foreground mt-1 text-xs">
				{evidenceTypeLabels[finding.evidenceType]}
			</p>
		</li>
	);
}

export function ReportView({
	report,
	isExample = false,
}: {
	report: Report;
	isExample?: boolean;
}) {
	const groups = findingGroups
		.map((group) => ({
			...group,
			findings: report.findings.filter(
				(finding) => finding.stance === group.stance,
			),
		}))
		.filter((group) => group.findings.length > 0);

	return (
		<article className="space-y-10">
			{isExample ? (
				<p
					role="note"
					className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm"
				>
					<strong className="text-foreground">Exemplo ilustrativo.</strong> Este
					relatório foi escrito manualmente para demonstrar o formato e não é
					resultado de uma pesquisa ao vivo. As fontes citadas são reais.
				</p>
			) : null}
			<header className="space-y-6">
				<p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
					Relatório de verificação
				</p>
				<blockquote className="text-2xl leading-snug font-semibold tracking-tight text-balance sm:text-3xl">
					“{report.claim}”
				</blockquote>
				{report.inputUrl ? (
					<p className="text-muted-foreground text-sm">
						Alegação extraída de{" "}
						<a
							href={report.inputUrl}
							target="_blank"
							rel="noopener noreferrer nofollow"
							className="break-all underline"
						>
							{report.inputUrl}
						</a>
					</p>
				) : null}
				<div className="space-y-4 border-y py-4">
					<dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
						<div className="flex items-center gap-2">
							<dt className="sr-only">Avaliação</dt>
							<dd>
								<VerdictBadge
									verdict={report.verdict}
									className="h-7 px-3 text-sm"
								/>
							</dd>
							<Link
								href="/sobre#avaliacoes"
								className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2 print:hidden"
							>
								O que significa?
							</Link>
						</div>
						<div className="flex gap-1.5">
							<dt className="text-muted-foreground">Confiança:</dt>
							<dd className="font-medium capitalize">{report.confidence}</dd>
						</div>
						<div className="flex gap-1.5">
							<dt className="text-muted-foreground">Pesquisado em</dt>
							<dd>
								<time dateTime={report.researchedAt}>
									{formatDate(report.researchedAt)}
								</time>
							</dd>
						</div>
					</dl>
					<ShareActions
						title={`${verdictLabels[report.verdict]}: ${report.claim}`}
						text={formatShareText(report)}
					/>
				</div>
				<p className="text-lg leading-relaxed text-pretty">{report.summary}</p>
			</header>

			<aside className="bg-muted/60 rounded-xl p-5 text-sm leading-relaxed">
				<h2 className="font-semibold">Limitações desta análise</h2>
				<p className="text-muted-foreground mt-1">{report.limitations}</p>
			</aside>

			{groups.length > 0 ? (
				groups.map((group) => (
					<Section key={group.stance} title={group.title}>
						<ul className="space-y-4">
							{group.findings.map((finding) => (
								<FindingItem key={finding.text} finding={finding} />
							))}
						</ul>
					</Section>
				))
			) : (
				<Section title="Evidências">
					<p className="text-muted-foreground">
						Nenhuma evidência verificável foi encontrada nas fontes recuperadas.
						Isso não significa que a alegação seja falsa.
					</p>
				</Section>
			)}

			{report.caveats.length > 0 ? (
				<Section title="Ressalvas">
					<ul className="list-disc space-y-2 pl-5 leading-relaxed">
						{report.caveats.map((caveat) => (
							<li key={caveat}>{caveat}</li>
						))}
					</ul>
				</Section>
			) : null}

			{report.openQuestions.length > 0 ? (
				<Section title="Perguntas em aberto">
					<ul className="list-disc space-y-2 pl-5 leading-relaxed">
						{report.openQuestions.map((question) => (
							<li key={question}>{question}</li>
						))}
					</ul>
				</Section>
			) : null}

			<Section title="Fontes consultadas">
				{report.sources.length > 0 ? (
					<ol className="divide-y rounded-xl border">
						{report.sources.map((source) => (
							<li
								key={source.id}
								id={`fonte-${source.id}`}
								className="target:bg-muted/60 scroll-mt-24 space-y-2 p-4"
							>
								<div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
									<span className="text-foreground font-mono font-medium">
										{source.id}
									</span>
									<span>{source.domain}</span>
									<Badge variant="outline">
										{sourceKindLabels[source.kind]}
									</Badge>
								</div>
								<a
									href={source.url}
									target="_blank"
									rel="noopener noreferrer nofollow"
									className="inline-flex items-start gap-1.5 font-medium underline-offset-2 hover:underline"
								>
									{source.title}
									<ExternalLink
										className="mt-1 size-3.5 shrink-0"
										aria-hidden
									/>
									<span className="sr-only">(abre em nova aba)</span>
								</a>
								<p className="hidden text-xs break-all print:block">
									{source.url}
								</p>
								{source.excerpt ? (
									<p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
										{source.excerpt}
									</p>
								) : null}
							</li>
						))}
					</ol>
				) : (
					<p className="text-muted-foreground">
						Nenhuma fonte pôde ser citada nesta análise.
					</p>
				)}
			</Section>

			<p className="text-muted-foreground border-t pt-6 text-xs leading-relaxed">
				{isExample
					? "Exemplo criado para demonstrar o formato dos relatórios do Desconfia."
					: "Este relatório foi gerado automaticamente a partir das fontes listadas acima e pode conter erros. Confira sempre as fontes originais antes de compartilhar."}
			</p>
		</article>
	);
}
