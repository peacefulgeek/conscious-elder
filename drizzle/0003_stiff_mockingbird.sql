CREATE TABLE `quiz_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`quizId` varchar(64) NOT NULL,
	`domain` varchar(128) NOT NULL,
	`score` int NOT NULL,
	`maxScore` int NOT NULL,
	`tier` enum('thriving','growing','needs-attention') NOT NULL,
	`answers` text DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_results_id` PRIMARY KEY(`id`)
);
