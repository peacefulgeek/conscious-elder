ALTER TABLE `articles` MODIFY COLUMN `status` enum('draft','queued','published','archived') NOT NULL DEFAULT 'published';--> statement-breakpoint
ALTER TABLE `articles` MODIFY COLUMN `publishedAt` timestamp;--> statement-breakpoint
ALTER TABLE `articles` ADD `queuedAt` timestamp;