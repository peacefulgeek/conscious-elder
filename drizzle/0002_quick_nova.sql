ALTER TABLE `articles` MODIFY COLUMN `tags` text DEFAULT ('[]');--> statement-breakpoint
ALTER TABLE `articles` MODIFY COLUMN `asinsUsed` text DEFAULT ('[]');--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `tags` text DEFAULT ('[]');