import type { Metadata } from "next";
import { ReportCard } from "@/components/report-card";
import { getFeaturedReports } from "@/lib/reports";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Checagens em destaque",
	description:
		"Verificações revisadas pela equipe do Desconfia, com evidências e fontes.",
};

export default async function FeaturedPage() {
	const featured = await getFeaturedReports();

	return (
		<div className="mx-auto max-w-6xl space-y-10 px-4 py-16 sm:px-6">
			<header className="max-w-2xl space-y-4">
				<p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
					Destaques
				</p>
				<h1 className="text-4xl font-semibold tracking-tight">
					Checagens em destaque
				</h1>
				<p className="text-muted-foreground text-lg">
					Relatórios revisados e escolhidos pela equipe. As verificações feitas
					por quem usa o Desconfia nunca aparecem aqui automaticamente.
				</p>
			</header>

			{featured.length > 0 ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{featured.map(({ id, report }) => (
						<ReportCard key={id} href={`/r/${id}`} report={report} />
					))}
				</div>
			) : (
				<p className="text-muted-foreground rounded-xl border border-dashed p-8 text-center">
					Ainda não há checagens em destaque. Enquanto isso, veja os{" "}
					<a href="/#exemplos" className="underline">
						relatórios de exemplo
					</a>
					.
				</p>
			)}
		</div>
	);
}
