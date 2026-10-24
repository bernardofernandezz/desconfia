ALTER TABLE `reports` ADD `featuredAt` text;--> statement-breakpoint
CREATE INDEX `reports_featured_idx` ON `reports` (`featuredAt`);