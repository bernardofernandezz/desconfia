export const DEFAULT_SITE_URL = "http://localhost:3001";
const MAX_CLAIM_CHARS = 1000;

export function isSiteUrl(value) {
	try {
		const { protocol } = new URL(value);
		return protocol === "https:" || protocol === "http:";
	} catch {
		return false;
	}
}

export function buildVerifyUrl(siteUrl, selectedText) {
	const url = new URL("/", isSiteUrl(siteUrl) ? siteUrl : DEFAULT_SITE_URL);
	url.searchParams.set("q", selectedText.trim().slice(0, MAX_CLAIM_CHARS));
	return url.toString();
}
