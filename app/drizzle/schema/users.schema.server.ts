// @ts-nocheck
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// MANDATORY CORE TABLES - Always include these
export const usersTable = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  avatar: text("avatar"),
  preferences: text("preferences", { mode: "json" }).$type<{
    notifications: boolean;
    expiryAlerts: boolean;
    alertDays: number;
    theme: 'light' | 'dark';
  }>(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const stripeCustomersTable = sqliteTable("stripe_customers", {
  userId: integer("user_id").primaryKey(),
  customerId: text("customer_id").notNull(),
});

// Validation schemas
export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// TypeScript types
export type User = typeof usersTable.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
