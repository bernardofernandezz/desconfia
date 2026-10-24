import {
	FileSearch,
	FileText,
	Link2,
	Search,
	Share2,
	ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { ClaimForm } from "@/components/claim-form";
import { RecentReports } from "@/components/recent-reports";
import { ReportCard } from "@/components/report-card";
import { ReportPreview } from "@/components/report-preview";
import { examples } from "@/lib/examples";
import { claimTransitionName } from "@/lib/report";

const principles = [
	{
		icon: Search,
		title: "Fontes verificáveis",
		text: "Priorizamos leis, decisões judiciais, dados oficiais e reportagens que você pode conferir.",
	},
	{
		icon: FileText,
		title: "Evidência ligada a cada frase",
		text: "Toda constatação aponta para a fonte que a sustenta. Sem fonte, não há conclusão.",
	},
	{
		icon: ShieldCheck,
		title: "Incerteza transparente",
		text: "Mostramos o nível de confiança e as limitações. Quando faltam provas, dizemos que é inconclusivo.",
	},
	{
		icon: Share2,
		title: "Fácil de compartilhar",
		text: "Cada relatório tem um link próprio para enviar no WhatsApp ou nas redes.",
	},
];

const steps = [
	{
		icon: Link2,
		title: "Envie a alegação",
		text: "Cole o texto que você recebeu ou o link da notícia.",
	},
	{
		icon: Search,
		title: "Pesquisamos as fontes",
		text: "Buscamos em portais oficiais e veículos de imprensa.",
	},
	{
		icon: FileSearch,
		title: "Analisamos as evidências",
		text: "Comparamos o que cada fonte diz e separamos fato, contexto e dúvida.",
	},
	{
		icon: ShieldCheck,
		title: "Você recebe o relatório",
		text: "Avaliação, confiança, evidências e links para conferir.",
	},
];

function Eyebrow({ children }: { children: React.ReactNode }) {
	return (
		<p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
			{children}
		</p>
	);
}

export default function Home() {
	const preview = examples[1] ?? examples[0];

	return (
		<>
			<section className="mx-auto grid max-w-6xl items-center gap-16 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.15fr_1fr]">
				<div className="space-y-8">
					<div className="space-y-5">
						<Eyebrow>Verificação de alegações políticas</Eyebrow>
						<h1 className="text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
							Cheque o que você vê.{" "}
							<span className="text-muted-foreground">
								Com base em evidências.
							</span>
						</h1>
						<p className="text-muted-foreground max-w-xl text-lg leading-relaxed text-pretty">
							Cole uma alegação que está circulando ou o link de uma notícia. O
							Desconfia pesquisa fontes oficiais e veículos de imprensa e mostra
							o que é fato, o que é enganoso e o que ainda não pode ser
							comprovado.
						</p>
					</div>
					<ClaimForm />
					<RecentReports />
				</div>
				{preview ? (
					<div className="hidden px-8 lg:block">
						<ReportPreview slug={preview.slug} report={preview.report} />
					</div>
				) : null}
			</section>

			<section aria-labelledby="principios" className="bg-card border-y">
				<h2 id="principios" className="sr-only">
					Princípios
				</h2>
				<div className="bg-border mx-auto grid max-w-6xl gap-px px-0 sm:grid-cols-2 lg:grid-cols-4">
					{principles.map(({ icon: Icon, title, text }) => (
						<div key={title} className="bg-card space-y-3 px-6 py-10">
							<Icon className="size-6" aria-hidden />
							<h3 className="font-semibold">{title}</h3>
							<p className="text-muted-foreground text-sm leading-relaxed">
								{text}
							</p>
						</div>
					))}
				</div>
			</section>

			<section
				id="como-funciona"
				className="mx-auto max-w-6xl scroll-mt-16 space-y-10 px-4 py-20 sm:px-6"
			>
				<div className="space-y-3">
					<Eyebrow>Como funciona</Eyebrow>
					<h2 className="text-3xl font-semibold tracking-tight">
						Da alegação ao relatório, em poucos passos.
					</h2>
				</div>
				<ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
					{steps.map(({ icon: Icon, title, text }, index) => (
						<li key={title} className="space-y-3">
							<div className="flex items-center gap-3">
								<span className="bg-muted grid size-7 place-items-center rounded-full text-xs font-medium">
									{index + 1}
								</span>
								<Icon className="size-5" aria-hidden />
							</div>
							<h3 className="font-semibold">{title}</h3>
							<p className="text-muted-foreground text-sm leading-relaxed">
								{text}
							</p>
						</li>
					))}
				</ol>
			</section>

			<section className="bg-foreground text-background">
				<div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
					<div className="space-y-4">
						<p className="text-background/60 text-xs font-medium tracking-[0.18em] uppercase">
							Nossa missão
						</p>
						<h2 className="text-3xl font-semibold tracking-tight">
							Mais informação. Menos manipulação.
						</h2>
						<p className="text-background/75 max-w-xl leading-relaxed">
							O Desconfia é um projeto independente e apartidário. Não
							recomendamos candidatos nem inferimos preferências políticas:
							mostramos as evidências para que você tire suas próprias
							conclusões.
						</p>
					</div>
					<blockquote className="border-background/30 text-background/85 border-l-2 pl-6 text-lg leading-relaxed">
						“Verificar uma informação não é sobre concordar ou discordar. É
						sobre entender a realidade com clareza.”
					</blockquote>
				</div>
			</section>

			<section
				id="exemplos"
				className="mx-auto max-w-6xl scroll-mt-16 space-y-10 px-4 py-20 sm:px-6"
			>
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div className="space-y-3">
						<Eyebrow>Exemplos ilustrativos</Eyebrow>
						<h2 className="text-3xl font-semibold tracking-tight">
							Veja como funcionam os relatórios
						</h2>
					</div>
					<Link
						href="/sobre"
						className="text-muted-foreground hover:text-foreground text-sm"
					>
						Conheça a metodologia →
					</Link>
				</div>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{examples.map((example) => (
						<ReportCard
							key={example.slug}
							href={`/exemplos/${example.slug}`}
							report={example.report}
							transitionName={claimTransitionName(example.slug)}
						/>
					))}
				</div>
				<p className="text-muted-foreground text-xs">
					Exemplos escritos manualmente para demonstrar o formato. Não são
					resultados de pesquisas ao vivo.
				</p>
			</section>
		</>
	);
}
