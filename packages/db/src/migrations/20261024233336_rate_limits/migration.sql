CREATE TABLE `rate_limit_hits` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`keyHash` text NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rate_limit_hits_key_idx` ON `rate_limit_hits` (`keyHash`,`createdAt`);