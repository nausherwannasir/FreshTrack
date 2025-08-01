// @ts-nocheck
import { pgTable, text, serial, integer, boolean, timestamp, json, jsonb, varchar, char, numeric, time, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Grocery Items
export const groceryItems = pgTable("grocery_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text().notNull(),
  category: text().notNull(),
  expiryDate: date("expiry_date").notNull(),
  quantity: integer().notNull(),
  unit: text().notNull(),
  location: text().notNull(),
  imageUrl: text("image_url"),
  barcode: text(),
  addedDate: date("added_date").defaultNow().notNull(),
  isConsumed: boolean("is_consumed").default(false),
  aiConfidence: numeric("ai_confidence", { precision: 5, scale: 2 }),
  metadata: json().$type<{
    brand?: string;
    nutritionInfo?: any;
    purchasePrice?: number;
    store?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Expiry Notifications
export const expiryNotifications = pgTable("expiry_notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  groceryItemId: integer("grocery_item_id").notNull(),
  type: text().notNull(),
  title: text().notNull(),
  message: text().notNull(),
  priority: text().notNull(),
  isRead: boolean("is_read").default(false),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI Scan History
export const scanHistory = pgTable("scan_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  imageUrl: text("image_url"),
  recognizedItems: json("recognized_items").$type<Array<{
    name: string;
    confidence: number;
    category: string;
    estimatedExpiry?: string;
  }>>(),
  scanDate: timestamp("scan_date").defaultNow().notNull(),
  processingTime: integer("processing_time"),
  success: boolean().default(true),
  errorMessage: text("error_message"),
});

// Validation schemas
export const insertGroceryItemSchema = createInsertSchema(groceryItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertNotificationSchema = createInsertSchema(expiryNotifications).omit({
  id: true,
  createdAt: true
});

export const insertScanHistorySchema = createInsertSchema(scanHistory).omit({
  id: true,
  scanDate: true
});

// TypeScript types
export type GroceryItem = typeof groceryItems.$inferSelect;
export type InsertGroceryItem = z.infer<typeof insertGroceryItemSchema>;
export type ExpiryNotification = typeof expiryNotifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type ScanHistory = typeof scanHistory.$inferSelect;
export type InsertScanHistory = z.infer<typeof insertScanHistorySchema>;
