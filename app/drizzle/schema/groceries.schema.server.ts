// @ts-nocheck
import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Grocery Items
export const groceryItems = sqliteTable("grocery_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  name: text().notNull(),
  category: text().notNull(),
  expiryDate: text("expiry_date").notNull(), // SQLite doesn't have native date type
  quantity: integer().notNull(),
  unit: text().notNull(),
  location: text().notNull(),
  imageUrl: text("image_url"),
  barcode: text(),
  addedDate: text("added_date").notNull(),
  isConsumed: integer("is_consumed", { mode: 'boolean' }).default(false),
  aiConfidence: real("ai_confidence"),
  metadata: text({ mode: 'json' }).$type<{
    brand?: string;
    nutritionInfo?: any;
    purchasePrice?: number;
    store?: string;
  }>(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Grocery Categories
export const groceryCategories = sqliteTable("grocery_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  icon: text(),
  color: text(),
  description: text(),
  createdAt: text("created_at").notNull(),
});

// Grocery Notifications
export const groceryNotifications = sqliteTable("grocery_notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  groceryItemId: integer("grocery_item_id").notNull(),
  type: text().notNull(), // 'expiring', 'expired', 'low_stock', 'restocking_suggestion'
  title: text().notNull(),
  message: text().notNull(),
  isRead: integer("is_read", { mode: 'boolean' }).default(false),
  scheduledFor: text("scheduled_for"),
  metadata: text({ mode: 'json' }).$type<{
    daysUntilExpiry?: number;
    suggestedActions?: string[];
    relatedItems?: number[];
  }>(),
  createdAt: text("created_at").notNull(),
});

// Grocery Lists
export const groceryLists = sqliteTable("grocery_lists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  name: text().notNull(),
  description: text(),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  metadata: text({ mode: 'json' }).$type<{
    budget?: number;
    store?: string;
    plannedDate?: string;
  }>(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Grocery List Items
export const groceryListItems = sqliteTable("grocery_list_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  listId: integer("list_id").notNull(),
  name: text().notNull(),
  quantity: integer().notNull().default(1),
  unit: text(),
  category: text(),
  isCompleted: integer("is_completed", { mode: 'boolean' }).default(false),
  estimatedPrice: real("estimated_price"),
  actualPrice: real("actual_price"),
  notes: text(),
  createdAt: text("created_at").notNull(),
  completedAt: text("completed_at"),
});

// Zod schemas for validation
export const insertGroceryItemSchema = createInsertSchema(groceryItems);
export const insertGroceryNotificationSchema = createInsertSchema(groceryNotifications);
export const insertGroceryListSchema = createInsertSchema(groceryLists);
export const insertGroceryListItemSchema = createInsertSchema(groceryListItems);

export type GroceryItem = typeof groceryItems.$inferSelect;
export type NewGroceryItem = typeof groceryItems.$inferInsert;
export type GroceryNotification = typeof groceryNotifications.$inferSelect;
export type NewGroceryNotification = typeof groceryNotifications.$inferInsert;
