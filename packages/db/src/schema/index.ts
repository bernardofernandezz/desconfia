import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const reports = sqliteTable(
	"reports",
	{
		id: text().primaryKey(),
		claim: text().notNull(),
		claimHash: text().notNull(),
		inputUrl: text(),
		content: text({ mode: "json" }).notNull(),
		deleteTokenHash: text(),
		createdAt: text().notNull(),
	},
	(table) => [index("reports_claim_hash_idx").on(table.claimHash)],
);

export const reportGroups = sqliteTable("report_groups", {
	id: text().primaryKey(),
	reportIds: text({ mode: "json" }).$type<string[]>().notNull(),
	createdAt: text().notNull(),
});

export const feedback = sqliteTable("feedback", {
	id: text().primaryKey(),
	reportId: text()
		.notNull()
		.references(() => reports.id, { onDelete: "cascade" }),
	kind: text({ enum: ["wrong_verdict", "bad_source", "other"] }).notNull(),
	comment: text(),
	createdAt: text().notNull(),
});
