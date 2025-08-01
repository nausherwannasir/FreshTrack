// @ts-nocheck
import { pgTable, text, serial, integer, boolean, timestamp, json, jsonb, varchar, char, numeric, time, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Recipe Database
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text().notNull(),
  description: text(),
  ingredients: json().$type<string[]>().notNull(),
  instructions: json().$type<string[]>().notNull(),
  prepTime: integer("prep_time").notNull(),
  cookTime: integer("cook_time").notNull(),
  servings: integer().notNull(),
  difficulty: text().notNull(),
  cuisine: text(),
  tags: json().$type<string[]>(),
  imageUrl: text("image_url"),
  nutritionInfo: json("nutrition_info").$type<{
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }>(),
  source: text(),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Saved Recipes
export const userRecipes = pgTable("user_recipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  recipeId: integer("recipe_id").notNull(),
  rating: integer(),
  notes: text(),
  isFavorite: boolean("is_favorite").default(false),
  lastMade: date("last_made"),
  timesCooked: integer("times_cooked").default(0),
  customizations: json().$type<{
    modifiedIngredients?: string[];
    modifiedInstructions?: string[];
    personalNotes?: string;
  }>(),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
});

// Recipe Suggestions (AI Generated)
export const recipeSuggestions = pgTable("recipe_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  recipeId: integer("recipe_id").notNull(),
  matchingIngredients: json("matching_ingredients").$type<string[]>().notNull(),
  matchScore: numeric("match_score", { precision: 5, scale: 2 }).notNull(),
  availableIngredients: integer("available_ingredients").notNull(),
  totalIngredients: integer("total_ingredients").notNull(),
  suggestedAt: timestamp("suggested_at").defaultNow().notNull(),
  isViewed: boolean("is_viewed").default(false),
  isAccepted: boolean("is_accepted").default(false),
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
