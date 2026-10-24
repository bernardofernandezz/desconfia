import { ENV } from "@/env.server";
import type { SourceCandidate } from "../report";

const API_URL = "https://factchecktools.googleapis.com/v1alpha1/claims:search";
const MAX_FACT_CHECKS = 3;

type ClaimReview = {
	publisher?: { name?: string; site?: string };
	url?: string;
	title?: string;
	textualRating?: string;
};

export type FactCheckClaim = { text?: string; claimReview?: ClaimReview[] };

export function toFactCheckSources(
	claims: FactCheckClaim[],
): SourceCandidate[] {
	const sources = claims.flatMap((claim) =>
		(claim.claimReview ?? []).flatMap((review) => {
			if (!review.url || !/^https?:\/\//.test(review.url)) return [];
			const domain = new URL(review.url).hostname.replace(/^www\./, "");
			const publisher = review.publisher?.name ?? domain;
			return {
				url: review.url,
				title: `${publisher}: ${review.title ?? claim.text ?? "checagem"}`,
				domain,
				kind: "factcheck" as const,
				excerpt: [
					claim.text && `Alegação checada: “${claim.text}”.`,
					review.textualRating && `Classificação: ${review.textualRating}.`,
				]
					.filter(Boolean)
					.join(" "),
			};
		}),
	);
	const unique = new Map(sources.map((source) => [source.url, source]));
	return [...unique.values()].slice(0, MAX_FACT_CHECKS);
}

// Optional source: without a key, or if the API fails, research continues with web results only.
export async function findFactChecks(
	claim: string,
	signal: AbortSignal,
): Promise<SourceCandidate[]> {
	if (!ENV.GOOGLE_FACT_CHECK_API_KEY) return [];

	const params = new URLSearchParams({
		query: claim.slice(0, 300),
		languageCode: "pt-BR",
		pageSize: "10",
		key: ENV.GOOGLE_FACT_CHECK_API_KEY,
	});
	try {
		const response = await fetch(`${API_URL}?${params}`, { signal });
		if (!response.ok) return [];
		const data = (await response.json()) as { claims?: FactCheckClaim[] };
		return toFactCheckSources(data.claims ?? []);
	} catch (error) {
		if (signal.aborted) throw error;
		return [];
	}
}
