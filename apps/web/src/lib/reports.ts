import { reports } from "@desconfia/db/schema/index";
import { eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { db } from "@/services";
import type { Report } from "./report";

const createId = customAlphabet("23456789abcdefghijkmnpqrstuvwxyz", 14);

export async function saveReport(report: Report) {
	const id = createId();
	await db.insert(reports).values({
		id,
		claim: report.claim,
		inputUrl: report.inputUrl,
		content: report,
		createdAt: report.researchedAt,
	});
	return id;
}

export async function getReport(id: string) {
	const [row] = await db
		.select()
		.from(reports)
		.where(eq(reports.id, id))
		.limit(1);
	return row ? (row.content as Report) : null;
}
