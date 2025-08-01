// @ts-nocheck
import { pgTable, text, serial, integer, boolean, timestamp, json, jsonb, varchar, char, numeric, time, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// MANDATORY CORE TABLES - Always include these
export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text().notNull().unique(),
  password: text().notNull(),
  displayName: text("display_name"),
  avatar: text(),
  preferences: json().$type<{
    notifications: boolean;
    expiryAlerts: boolean;
    alertDays: number;
    theme: 'light' | 'dark';
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const stripeCustomersTable = pgTable("stripe_customers", {
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
