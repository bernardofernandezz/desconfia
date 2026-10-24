CREATE TABLE `feedback` (
	`id` text PRIMARY KEY,
	`reportId` text NOT NULL,
	`kind` text NOT NULL,
	`comment` text,
	`createdAt` text NOT NULL,
	CONSTRAINT `fk_feedback_reportId_reports_id_fk` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `report_groups` (
	`id` text PRIMARY KEY,
	`reportIds` text NOT NULL,
	`createdAt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY,
	`claim` text NOT NULL,
	`claimHash` text NOT NULL,
	`inputUrl` text,
	`content` text NOT NULL,
	`deleteTokenHash` text,
	`createdAt` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reports_claim_hash_idx` ON `reports` (`claimHash`);