import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const reports = sqliteTable(
	"reports",
	{
		id: text().primaryKey(),
		claim: text().notNull(),
		claimHash: text().notNull(),
		inputUrl: text(),
		content: text({ mode: "json" }).notNull(),
		deleteTokenHash: text(),
		featuredAt: text(),
		createdAt: text().notNull(),
	},
	(table) => [
		index("reports_claim_hash_idx").on(table.claimHash),
		index("reports_featured_idx").on(table.featuredAt),
	],
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

export const rateLimitHits = sqliteTable(
	"rate_limit_hits",
	{
		id: integer().primaryKey({ autoIncrement: true }),
		keyHash: text().notNull(),
		createdAt: integer().notNull(),
	},
	(table) => [
		index("rate_limit_hits_key_idx").on(table.keyHash, table.createdAt),
	],
);
