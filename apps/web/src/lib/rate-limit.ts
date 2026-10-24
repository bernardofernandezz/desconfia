import { createHash } from "node:crypto";
import { rateLimitHits } from "@desconfia/db/schema/index";
import { and, count, eq, lt } from "drizzle-orm";
import { db } from "@/services";

const limits = {
	verify: { max: 5, windowMs: 10 * 60_000 },
	feedback: { max: 10, windowMs: 60 * 60_000 },
	whatsapp: { max: 10, windowMs: 60 * 60_000 },
} as const;

export type RateLimitBucket = keyof typeof limits;

export const clientIp = (request: Request) =>
	request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

// Stored in the database so the limit holds across server instances; keys (IPs, phone numbers) are kept only as hashes.
export async function isRateLimited(bucket: RateLimitBucket, key: string) {
	const { max, windowMs } = limits[bucket];
	const keyHash = createHash("sha256").update(`${bucket}:${key}`).digest("hex");
	const now = Date.now();
	const ownHits = eq(rateLimitHits.keyHash, keyHash);

	await db
		.delete(rateLimitHits)
		.where(and(ownHits, lt(rateLimitHits.createdAt, now - windowMs)));
	const [hits] = await db
		.select({ total: count() })
		.from(rateLimitHits)
		.where(ownHits);
	if ((hits?.total ?? 0) >= max) return true;

	await db.insert(rateLimitHits).values({ keyHash, createdAt: now });
	return false;
}
