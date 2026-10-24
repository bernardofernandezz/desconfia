import { ENV } from "@/env.server";

export function siteUrl() {
	if (ENV.SITE_URL) return ENV.SITE_URL.replace(/\/$/, "");
	const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
	return vercelUrl ? `https://${vercelUrl}` : "http://localhost:3001";
}
