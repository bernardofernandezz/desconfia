import type { MetadataRoute } from "next";
import { examples } from "@/lib/examples";
import { getFeaturedReports } from "@/lib/reports";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

// Lists public pages and editorial picks only; user reports stay unlisted.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = siteUrl();
	const featured = await getFeaturedReports();

	return [
		...["/", "/sobre", "/destaques"].map((path) => ({ url: `${base}${path}` })),
		...examples.map(({ slug }) => ({ url: `${base}/exemplos/${slug}` })),
		...featured.map(({ id, report }) => ({
			url: `${base}/r/${id}`,
			lastModified: report.researchedAt,
		})),
	];
}
