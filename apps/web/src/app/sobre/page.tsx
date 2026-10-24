import type { Metadata } from "next";
import { verdictLabels } from "@/lib/report";

export const metadata: Metadata = { title: "Sobre e metodologia" };

const verdictDescriptions = {
	supported: "As fontes recuperadas confirmam a alegação.",
	contradicted: "As fontes recuperadas desmentem a alegação.",
	misleading:
		"A alegação tem base real, mas distorce, exagera ou omite contexto essencial.",
	inconclusive:
		"As fontes não permitem concluir. Falta de evidência não significa que a alegação seja falsa.",
} as const;

export default function AboutPage() {
	return (
		<div className="mx-auto max-w-3xl space-y-12 px-4 py-16 leading-relaxed sm:px-6">
			<header className="space-y-4">
				<p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
					Sobre
				</p>
				<h1 className="text-4xl font-semibold tracking-tight">
					Como o Desconfia verifica uma alegação
				</h1>
				<p className="text-muted-foreground text-lg">
					Um projeto independente e apartidário para ajudar qualquer pessoa a
					conferir o que recebe no WhatsApp, nas redes e nos sites de notícia.
				</p>
			</header>

			<section className="space-y-3">
				<h2 className="text-xl font-semibold tracking-tight">Método</h2>
				<ol className="list-decimal space-y-2 pl-5">
					<li>
						Pesquisamos a alegação na web, com uma busca dedicada a portais
						oficiais (gov.br, leg.br, jus.br).
					</li>
					<li>
						Guardamos apenas fontes que foram de fato recuperadas, com link e
						trecho do conteúdo.
					</li>
					<li>
						Um modelo de linguagem compara a alegação com essas fontes e precisa
						ligar cada constatação a uma fonte.
					</li>
					<li>
						Uma checagem automática descarta constatações sem fonte válida. Se
						não sobra evidência suficiente, o resultado é inconclusivo.
					</li>
				</ol>
			</section>

			<section id="avaliacoes" className="scroll-mt-24 space-y-3">
				<h2 className="text-xl font-semibold tracking-tight">
					O que cada avaliação significa
				</h2>
				<dl className="divide-y rounded-xl border">
					{Object.entries(verdictDescriptions).map(([verdict, description]) => (
						<div
							key={verdict}
							className="grid gap-1 p-4 sm:grid-cols-[10rem_1fr]"
						>
							<dt className="font-medium">
								{verdictLabels[verdict as keyof typeof verdictDescriptions]}
							</dt>
							<dd className="text-muted-foreground">{description}</dd>
						</div>
					))}
				</dl>
			</section>

			<section className="space-y-3">
				<h2 className="text-xl font-semibold tracking-tight">
					Limites e privacidade
				</h2>
				<ul className="list-disc space-y-2 pl-5">
					<li>
						Os relatórios são gerados automaticamente e podem conter erros.
						Sempre confira as fontes originais.
					</li>
					<li>
						Nunca recomendamos candidatos nem tentamos inferir a opinião
						política de quem usa a ferramenta.
					</li>
					<li>
						Os relatórios não são listados publicamente nem indexados por
						buscadores. Só quem tem o link consegue abrir.
					</li>
				</ul>
			</section>
		</div>
	);
}
