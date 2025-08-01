// @ts-nocheck
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Recipe Database
export const recipes = sqliteTable("recipes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text(),
  ingredients: text({ mode: 'json' }).$type<string[]>().notNull(),
  instructions: text({ mode: 'json' }).$type<string[]>().notNull(),
  prepTime: integer("prep_time").notNull(),
  cookTime: integer("cook_time").notNull(),
  servings: integer().notNull(),
  difficulty: text().notNull(),
  cuisine: text(),
  tags: text({ mode: 'json' }).$type<string[]>(),
  imageUrl: text("image_url"),
  nutritionInfo: text("nutrition_info", { mode: 'json' }).$type<{
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }>(),
  source: text(),
  isPublic: integer("is_public", { mode: 'boolean' }).default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// User's Saved Recipes (favorites/bookmarks)
export const savedRecipes = sqliteTable("saved_recipes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  recipeId: integer("recipe_id").notNull(),
  isFavorite: integer("is_favorite", { mode: 'boolean' }).default(false),
  personalNotes: text("personal_notes"),
  personalRating: integer("personal_rating"), // 1-5 stars
  lastCooked: text("last_cooked"),
  timesCooked: integer("times_cooked").default(0),
  modifications: text({ mode: 'json' }).$type<{
    ingredientChanges?: string[];
    instructionChanges?: string[];
    servingAdjustment?: number;
  }>(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Recipe Collections/Meal Plans
export const recipeCollections = sqliteTable("recipe_collections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  name: text().notNull(),
  description: text(),
  type: text().notNull(), // 'meal_plan', 'favorites', 'custom'
  isPublic: integer("is_public", { mode: 'boolean' }).default(false),
  metadata: text({ mode: 'json' }).$type<{
    weekStart?: string;
    budget?: number;
    dietaryRestrictions?: string[];
  }>(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Junction table for recipes in collections
export const recipeCollectionItems = sqliteTable("recipe_collection_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  collectionId: integer("collection_id").notNull(),
  recipeId: integer("recipe_id").notNull(),
  position: integer().default(0),
  scheduledFor: text("scheduled_for"), // For meal planning
  mealType: text("meal_type"), // 'breakfast', 'lunch', 'dinner', 'snack'
  servingAdjustment: real("serving_adjustment").default(1.0),
  notes: text(),
  createdAt: text("created_at").notNull(),
});

// Zod schemas for validation
export const insertRecipeSchema = createInsertSchema(recipes);
export const insertSavedRecipeSchema = createInsertSchema(savedRecipes);
export const insertRecipeCollectionSchema = createInsertSchema(recipeCollections);
export const insertRecipeCollectionItemSchema = createInsertSchema(recipeCollectionItems);

export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;
export type SavedRecipe = typeof savedRecipes.$inferSelect;
export type NewSavedRecipe = typeof savedRecipes.$inferInsert;
export type RecipeCollection = typeof recipeCollections.$inferSelect;
export type NewRecipeCollection = typeof recipeCollections.$inferInsert;
