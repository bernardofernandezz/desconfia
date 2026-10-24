import { ENV } from "@/env.server";
import type { Source } from "../report";
import { ResearchError } from "./errors";

const API_URL = "https://api.tavily.com";
const MAX_SOURCES = 8;
const MAX_EXCERPT = 2500;

const primaryDomains = ["gov.br", "leg.br", "jus.br", "mp.br", "def.br"];
const pressDomains = [
	"g1.globo.com",
	"folha.uol.com.br",
	"estadao.com.br",
	"uol.com.br",
	"cnnbrasil.com.br",
	"bbc.com",
	"agenciabrasil.ebc.com.br",
	"poder360.com.br",
	"valor.globo.com",
	"oglobo.globo.com",
	"aosfatos.org",
	"lupa.uol.com.br",
	"piaui.folha.uol.com.br",
];

type TavilyResult = { url: string; title: string; content: string };

const matchesDomain = (domain: string, list: string[]) =>
	list.some((item) => domain === item || domain.endsWith(`.${item}`));

function classify(domain: string): Source["kind"] {
	if (matchesDomain(domain, primaryDomains)) return "primary";
	if (matchesDomain(domain, pressDomains)) return "press";
	return "other";
}

async function post<T>(
	path: string,
	body: object,
	signal: AbortSignal,
): Promise<T> {
	const response = await fetch(`${API_URL}${path}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${ENV.TAVILY_API_KEY}`,
		},
		body: JSON.stringify(body),
		signal,
	});

	if (response.status === 429 || response.status === 432) {
		throw new ResearchError(
			"rate_limit",
			"O limite de pesquisas foi atingido.",
		);
	}
	if (!response.ok)
		throw new ResearchError(
			"provider",
			"O serviço de pesquisa retornou um erro.",
		);
	return response.json() as Promise<T>;
}

export async function extractArticle(url: string, signal: AbortSignal) {
	const data = await post<{ results: { raw_content: string }[] }>(
		"/extract",
		{ urls: [url] },
		signal,
	);
	const content = data.results[0]?.raw_content?.trim();
	if (!content)
		throw new ResearchError(
			"no_content",
			"Não foi possível ler o conteúdo desse link.",
		);
	return content.slice(0, 8000);
}

function search(query: string, signal: AbortSignal, includeDomains?: string[]) {
	return post<{ results: TavilyResult[] }>(
		"/search",
		{
			query: query.slice(0, 380),
			search_depth: "advanced",
			chunks_per_source: 3,
			max_results: 6,
			country: "brazil",
			include_domains: includeDomains,
		},
		signal,
	);
}

export async function findSources(
	claim: string,
	signal: AbortSignal,
): Promise<Source[]> {
	const [general, official] = await Promise.all([
		search(claim, signal),
		search(claim, signal, primaryDomains),
	]);

	const unique = new Map<string, TavilyResult>();
	for (const result of [...official.results, ...general.results]) {
		const usable = /^https?:\/\//.test(result.url) && result.content?.trim();
		if (usable && !unique.has(result.url)) unique.set(result.url, result);
	}

	return [...unique.values()].slice(0, MAX_SOURCES).map((result, index) => {
		const domain = new URL(result.url).hostname.replace(/^www\./, "");
		return {
			id: `S${index + 1}`,
			url: result.url,
			title: result.title || domain,
			domain,
			kind: classify(domain),
			excerpt: result.content.slice(0, MAX_EXCERPT),
		};
	});
}
