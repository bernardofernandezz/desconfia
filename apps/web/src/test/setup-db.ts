import { mock } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDb } from "@desconfia/db";
import { migrate } from "drizzle-orm/libsql/migrator";

// Every test file shares one migrated SQLite database in a temp folder.
const directory = mkdtempSync(join(tmpdir(), "desconfia-test-"));
const db = createDb({ DATABASE_URL: `file:${join(directory, "test.db")}` });

await migrate(db, {
	migrationsFolder: join(
		import.meta.dir,
		"../../../../packages/db/src/migrations",
	),
});
mock.module("@/services", () => ({ db }));
process.on("exit", () => rmSync(directory, { recursive: true, force: true }));
