CREATE TABLE `stripe_customers` (
	`user_id` integer PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`display_name` text,
	`avatar` text,
	`preferences` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `grocery_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`icon` text,
	`color` text,
	`description` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `grocery_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`expiry_date` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit` text NOT NULL,
	`location` text NOT NULL,
	`image_url` text,
	`barcode` text,
	`added_date` text NOT NULL,
	`is_consumed` integer DEFAULT false,
	`ai_confidence` real,
	`metadata` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `grocery_list_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`list_id` integer NOT NULL,
	`name` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit` text,
	`category` text,
	`is_completed` integer DEFAULT false,
	`estimated_price` real,
	`actual_price` real,
	`notes` text,
	`created_at` text NOT NULL,
	`completed_at` text
);
--> statement-breakpoint
CREATE TABLE `grocery_lists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true,
	`metadata` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `grocery_notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`grocery_item_id` integer NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`is_read` integer DEFAULT false,
	`scheduled_for` text,
	`metadata` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recipe_collection_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`collection_id` integer NOT NULL,
	`recipe_id` integer NOT NULL,
	`position` integer DEFAULT 0,
	`scheduled_for` text,
	`meal_type` text,
	`serving_adjustment` real DEFAULT 1,
	`notes` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recipe_collections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`is_public` integer DEFAULT false,
	`metadata` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`ingredients` text NOT NULL,
	`instructions` text NOT NULL,
	`prep_time` integer NOT NULL,
	`cook_time` integer NOT NULL,
	`servings` integer NOT NULL,
	`difficulty` text NOT NULL,
	`cuisine` text,
	`tags` text,
	`image_url` text,
	`nutrition_info` text,
	`source` text,
	`is_public` integer DEFAULT true,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `saved_recipes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`recipe_id` integer NOT NULL,
	`is_favorite` integer DEFAULT false,
	`personal_notes` text,
	`personal_rating` integer,
	`last_cooked` text,
	`times_cooked` integer DEFAULT 0,
	`modifications` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
