import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const reports = sqliteTable("reports", {
	id: text().primaryKey(),
	claim: text().notNull(),
	inputUrl: text(),
	content: text({ mode: "json" }).notNull(),
	createdAt: text().notNull(),
});
