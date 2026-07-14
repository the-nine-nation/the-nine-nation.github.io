PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`user_email` text NOT NULL,
	`assessment_key` text NOT NULL,
	`mbti` text NOT NULL,
	`archetype` text NOT NULL,
	`completed_round` integer DEFAULT 1 NOT NULL,
	`answered_count` integer DEFAULT 10 NOT NULL,
	`answers_json` text NOT NULL,
	`report_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_reports`("id", "user_email", "assessment_key", "mbti", "archetype", "completed_round", "answered_count", "answers_json", "report_json", "created_at") SELECT "id", "user_email", "assessment_key", "mbti", "archetype", "completed_round", "answered_count", "answers_json", "report_json", "created_at" FROM `reports`;--> statement-breakpoint
DROP TABLE `reports`;--> statement-breakpoint
ALTER TABLE `__new_reports` RENAME TO `reports`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `reports_user_email_idx` ON `reports` (`user_email`);--> statement-breakpoint
CREATE INDEX `reports_created_at_idx` ON `reports` (`created_at`);