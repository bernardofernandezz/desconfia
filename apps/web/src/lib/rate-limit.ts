// shortcut: in-memory, per server instance; move to a shared store (e.g. Redis) before running multiple instances
export function createRateLimiter({
	max,
	windowMs,
}: {
	max: number;
	windowMs: number;
}) {
	const requests = new Map<string, number[]>();

	return function isLimited(key: string) {
		const now = Date.now();
		const recent = (requests.get(key) ?? []).filter(
			(time) => now - time < windowMs,
		);
		requests.set(key, [...recent, now]);
		return recent.length >= max;
	};
}

export const clientIp = (request: Request) =>
	request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
