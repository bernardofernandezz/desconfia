import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportView } from "@/components/report-view";
import { examples, findExample } from "@/lib/examples";

export const generateStaticParams = () =>
	examples.map(({ slug }) => ({ slug }));

export async function generateMetadata(
	props: PageProps<"/exemplos/[slug]">,
): Promise<Metadata> {
	const example = findExample((await props.params).slug);
	return {
		title: example
			? `Exemplo: ${example.report.claim}`
			: "Exemplo não encontrado",
	};
}

export default async function ExamplePage(
	props: PageProps<"/exemplos/[slug]">,
) {
	const example = findExample((await props.params).slug);
	if (!example) notFound();

	return (
		<div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
			<ReportView report={example.report} isExample />
		</div>
	);
}
