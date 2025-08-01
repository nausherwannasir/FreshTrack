// @ts-nocheck
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Recipe Database
export const recipes = sqliteTable("recipes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  ingredients: text("ingredients", { mode: "json" }).$type<string[]>().notNull(),
  instructions: text("instructions", { mode: "json" }).$type<string[]>().notNull(),
  prepTime: integer("prep_time").notNull(),
  cookTime: integer("cook_time").notNull(),
  servings: integer("servings").notNull(),
  difficulty: text("difficulty").notNull(),
  cuisine: text("cuisine"),
  tags: text("tags", { mode: "json" }).$type<string[]>(),
  imageUrl: text("image_url"),
  nutritionInfo: text("nutrition_info", { mode: "json" }).$type<{
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }>(),
  source: text("source"),
  isPublic: integer("is_public", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// User Saved Recipes
export const userRecipes = sqliteTable("user_recipes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  recipeId: integer("recipe_id").notNull(),
  rating: integer("rating"),
  notes: text("notes"),
  isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
  lastMade: text("last_made"),
  timesCooked: integer("times_cooked").default(0),
  customizations: text("customizations", { mode: "json" }).$type<{
    modifiedIngredients?: string[];
    modifiedInstructions?: string[];
    personalNotes?: string;
  }>(),
  savedAt: text("saved_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Recipe Suggestions (AI Generated)
export const recipeSuggestions = sqliteTable("recipe_suggestions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  recipeId: integer("recipe_id").notNull(),
  matchingIngredients: text("matching_ingredients", { mode: "json" }).$type<string[]>().notNull(),
  matchScore: text("match_score").notNull(), // Using text instead of numeric
  availableIngredients: integer("available_ingredients").notNull(),
  totalIngredients: integer("total_ingredients").notNull(),
  suggestedAt: text("suggested_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  isViewed: integer("is_viewed", { mode: "boolean" }).default(false),
  isAccepted: integer("is_accepted", { mode: "boolean" }).default(false),
});

// Validation schemas
export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertUserRecipeSchema = createInsertSchema(userRecipes).omit({
  id: true,
  savedAt: true
});

export const insertRecipeSuggestionSchema = createInsertSchema(recipeSuggestions).omit({
  id: true,
  suggestedAt: true
});

// TypeScript types
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type UserRecipe = typeof userRecipes.$inferSelect;
export type InsertUserRecipe = z.infer<typeof insertUserRecipeSchema>;
export type RecipeSuggestion = typeof recipeSuggestions.$inferSelect;
export type InsertRecipeSuggestion = z.infer<typeof insertRecipeSuggestionSchema>;

export type RecipeWithUserData = Recipe & {
  userRating?: number;
  isFavorite?: boolean;
  timesCooked?: number;
  lastMade?: string;
  matchingIngredients?: string[];
  matchScore?: number;
};
