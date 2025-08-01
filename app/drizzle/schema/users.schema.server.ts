// @ts-nocheck
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// MANDATORY CORE TABLES - Always include these
export const usersTable = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  password: text().notNull(),
  displayName: text("display_name"),
  avatar: text(),
  preferences: text({ mode: 'json' }).$type<{
    notifications: boolean;
    expiryAlerts: boolean;
    alertDays: number;
    theme: 'light' | 'dark';
  }>(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const stripeCustomersTable = sqliteTable("stripe_customers", {
  userId: integer("user_id").primaryKey(),
  customerId: text("customer_id").notNull(),
});

// Validation schemas
export const insertUserSchema = createInsertSchema(usersTable);

// TypeScript types
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
