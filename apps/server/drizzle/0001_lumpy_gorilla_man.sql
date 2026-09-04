PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`deck_id` text NOT NULL,
	`position` integer NOT NULL,
	`front_text` text NOT NULL,
	`back_text` text NOT NULL,
	`front_image_id` text,
	`back_image_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`deck_id`) REFERENCES `decks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_cards`("id", "deck_id", "position", "front_text", "back_text", "front_image_id", "back_image_id", "created_at", "updated_at") SELECT "id", "deck_id", "position", "front_text", "back_text", "front_image_id", "back_image_id", "created_at", "updated_at" FROM `cards`;--> statement-breakpoint
DROP TABLE `cards`;--> statement-breakpoint
ALTER TABLE `__new_cards` RENAME TO `cards`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_decks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_decks`("id", "name", "description", "created_at", "updated_at", "version") SELECT "id", "name", "description", "created_at", "updated_at", "version" FROM `decks`;--> statement-breakpoint
DROP TABLE `decks`;--> statement-breakpoint
ALTER TABLE `__new_decks` RENAME TO `decks`;