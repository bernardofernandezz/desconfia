import { createHash, timingSafeEqual } from "node:crypto";
import { feedback, reportGroups, reports } from "@desconfia/db/schema/index";
import { and, desc, eq, gt } from "drizzle-orm";
import { customAlphabet, nanoid } from "nanoid";
import { db } from "@/services";
import type { Report } from "./report";
import { normalizeClaim } from "./research/input";

const createId = customAlphabet("23456789abcdefghijkmnpqrstuvwxyz", 14);
const CACHE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const sha256 = (value: string) =>
	createHash("sha256").update(value).digest("hex");

export const hashClaim = (claim: string) => sha256(normalizeClaim(claim));
export const createDeleteToken = () => nanoid(32);

export async function saveReport(report: Report, deleteToken: string) {
	const id = createId();
	await db.insert(reports).values({
		id,
		claim: report.claim,
		claimHash: hashClaim(report.claim),
		inputUrl: report.inputUrl,
		content: report,
		deleteTokenHash: sha256(deleteToken),
		createdAt: report.researchedAt,
	});
	return id;
}

export async function getReport(id: string) {
	const [row] = await db
		.select({ content: reports.content })
		.from(reports)
		.where(eq(reports.id, id))
		.limit(1);
	return row ? (row.content as Report) : null;
}

export async function findRecentReportId(claim: string) {
	const since = new Date(Date.now() - CACHE_WINDOW_MS).toISOString();
	const [row] = await db
		.select({ id: reports.id })
		.from(reports)
		.where(
			and(
				eq(reports.claimHash, hashClaim(claim)),
				gt(reports.createdAt, since),
			),
		)
		.orderBy(desc(reports.createdAt))
		.limit(1);
	return row?.id ?? null;
}

export async function deleteReport(id: string, deleteToken: string) {
	const [row] = await db
		.select({ deleteTokenHash: reports.deleteTokenHash })
		.from(reports)
		.where(eq(reports.id, id))
		.limit(1);
	if (!row?.deleteTokenHash) return false;

	const expected = Buffer.from(row.deleteTokenHash, "hex");
	const received = Buffer.from(sha256(deleteToken), "hex");
	if (!timingSafeEqual(expected, received)) return false;

	await db.transaction(async (tx) => {
		await tx.delete(feedback).where(eq(feedback.reportId, id));
		await tx.delete(reports).where(eq(reports.id, id));
	});
	return true;
}

export async function saveGroup(reportIds: string[]) {
	const id = createId();
	await db
		.insert(reportGroups)
		.values({ id, reportIds, createdAt: new Date().toISOString() });
	return id;
}

export async function getGroupReports(id: string) {
	const [group] = await db
		.select({ reportIds: reportGroups.reportIds })
		.from(reportGroups)
		.where(eq(reportGroups.id, id))
		.limit(1);
	if (!group) return null;

	const found = await Promise.all(
		group.reportIds.map(async (reportId) => ({
			id: reportId,
			report: await getReport(reportId),
		})),
	);
	return found.filter(
		(entry): entry is { id: string; report: Report } => entry.report !== null,
	);
}

export async function saveFeedback(
	reportId: string,
	kind: (typeof feedback.$inferInsert)["kind"],
	comment: string | null,
) {
	await db.insert(feedback).values({
		id: createId(),
		reportId,
		kind,
		comment,
		createdAt: new Date().toISOString(),
	});
}
