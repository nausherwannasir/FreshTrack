// @ts-nocheck
import { sqliteTable, text, integer, blob, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Grocery Items
export const groceryItems = sqliteTable("grocery_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  expiryDate: text("expiry_date").notNull(), // Using text for dates in SQLite
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  barcode: text("barcode"),
  addedDate: text("added_date").notNull(),
  isConsumed: integer("is_consumed", { mode: "boolean" }).default(false),
  aiConfidence: text("ai_confidence"), // Using text instead of numeric for simplicity
  metadata: text("metadata", { mode: "json" }).$type<{
    brand?: string;
    nutritionInfo?: any;
    purchasePrice?: number;
    store?: string;
  }>(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Expiry Notifications
export const expiryNotifications = sqliteTable("expiry_notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  groceryItemId: integer("grocery_item_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  priority: text("priority").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).default(false),
  scheduledFor: text("scheduled_for"),
  sentAt: text("sent_at"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// AI Scan History
export const scanHistory = sqliteTable("scan_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  imageUrl: text("image_url"),
  recognizedItems: text("recognized_items", { mode: "json" }).$type<Array<{
    name: string;
    confidence: number;
    category: string;
    estimatedExpiry?: string;
  }>>(),
  scanDate: text("scan_date").default(sql`CURRENT_TIMESTAMP`).notNull(),
  processingTime: integer("processing_time"),
  success: integer("success", { mode: "boolean" }).default(true),
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
