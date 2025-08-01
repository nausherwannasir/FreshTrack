// @ts-nocheck
import { eq, desc, and, sql, inArray, ilike, or } from "drizzle-orm";
import { db } from "~/drizzle/config.server";
import { 
  type Recipe, 
  type InsertRecipe,
  type UserRecipe,
  type InsertUserRecipe,
  type RecipeSuggestion,
  type InsertRecipeSuggestion,
  type RecipeWithUserData,
  recipes,
  userRecipes,
  recipeSuggestions
} from "~/drizzle/schema/schema.server";

export interface IRecipesStorage {
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  getRecipes(limit?: number): Promise<Recipe[]>;
  getRecipeById(id: number): Promise<Recipe | undefined>;
  getUserRecipes(userId: number): Promise<RecipeWithUserData[]>;
  saveRecipe(userRecipe: InsertUserRecipe): Promise<UserRecipe>;
  rateRecipe(userId: number, recipeId: number, rating: number, notes?: string): Promise<UserRecipe | undefined>;
  generateRecipeSuggestions(userId: number, availableIngredients: string[]): Promise<RecipeSuggestion[]>;
  getRecipeSuggestions(userId: number): Promise<RecipeWithUserData[]>;
  markSuggestionViewed(suggestionId: number): Promise<boolean>;
  acceptSuggestion(suggestionId: number): Promise<boolean>;
  searchRecipes(query: string, availableIngredients?: string[]): Promise<RecipeWithUserData[]>;
  getPopularRecipes(limit?: number): Promise<RecipeWithUserData[]>;
  ensureInitialized(): Promise<void>;
}

export class RecipesStorage implements IRecipesStorage {
  private client: any;
  private initialized: boolean = false;

  constructor() {
    this.client = db;
  }

  async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log("[RecipesStorage] Starting sample data initialization...");
      
      const existingRecipes = await this.client.select().from(recipes).limit(1);
      console.log("[RecipesStorage] Found " + existingRecipes.length + " existing recipes");

      if (existingRecipes.length === 0) {
        console.log("[RecipesStorage] Creating sample recipe data...");
        
        const sampleRecipes = [
          {
            name: "Banana Spinach Smoothie",
            description: "A healthy and delicious smoothie perfect for breakfast",
            ingredients: ["2 bananas", "1 cup fresh spinach", "1 cup Greek yogurt", "2 tbsp honey", "1 cup almond milk"],
            instructions: [
              "Add spinach and almond milk to blender",
              "Add bananas and Greek yogurt",
              "Blend until smooth",
              "Add honey to taste",
              "Serve immediately"
            ],
            prepTime: 5,
            cookTime: 0,
            servings: 2,
            difficulty: "Easy",
            cuisine: "American",
            tags: ["healthy", "breakfast", "smoothie", "vegetarian"],
            imageUrl: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=800",
            source: "ai_generated",
            nutritionInfo: {
              calories: 180,
              protein: 12,
              carbs: 35,
              fat: 3
            }
          },
          {
            name: "Spinach and Yogurt Parfait",
            description: "A nutritious layered parfait with fresh ingredients",
            ingredients: ["1 cup Greek yogurt", "1 cup fresh spinach", "1/2 cup granola", "1/2 cup mixed berries", "2 tbsp honey"],
            instructions: [
              "Layer yogurt in glass",
              "Add fresh spinach leaves",
              "Sprinkle granola",
              "Top with berries",
              "Drizzle with honey"
            ],
            prepTime: 10,
            cookTime: 0,
            servings: 1,
            difficulty: "Easy",
            cuisine: "Mediterranean",
            tags: ["healthy", "breakfast", "parfait", "vegetarian"],
            imageUrl: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
            source: "ai_generated",
            nutritionInfo: {
              calories: 220,
              protein: 15,
              carbs: 30,
              fat: 6
            }
          },
          {
            name: "Quick Banana Bread",
            description: "Easy banana bread using ripe bananas",
            ingredients: ["3 ripe bananas", "1/3 cup melted butter", "3/4 cup sugar", "1 egg", "1 tsp vanilla", "1 tsp baking soda", "1 1/2 cups flour"],
            instructions: [
              "Preheat oven to 350°F",
              "Mash bananas in large bowl",
              "Mix in melted butter",
              "Add sugar, egg, and vanilla",
              "Mix in baking soda and flour",
              "Pour into greased loaf pan",
              "Bake for 60 minutes"
            ],
            prepTime: 15,
            cookTime: 60,
            servings: 8,
            difficulty: "Medium",
            cuisine: "American",
            tags: ["baking", "dessert", "banana", "bread"],
            imageUrl: "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=800",
            source: "ai_generated",
            nutritionInfo: {
              calories: 280,
              protein: 4,
              carbs: 58,
              fat: 6
            }
          }
        ];

        for (const recipe of sampleRecipes) {
          await this.createRecipe(recipe);
        }
        
        console.log("[RecipesStorage] Created " + sampleRecipes.length + " sample recipes");
      }

      this.initialized = true;
      console.log("[RecipesStorage] Initialization completed successfully");
    } catch (error) {
      console.error("[RecipesStorage] Failed to initialize:", error);
      this.initialized = true;
    }
  }

  async createRecipe(recipeData: InsertRecipe): Promise<Recipe> {
    try {
      const result = await this.client.insert(recipes).values({
        ...recipeData,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      return this.convertDates(result[0]);
    } catch (error) {
      console.error("[RecipesStorage] Failed to create recipe:", error);
      throw new Error("Failed to create recipe");
    }
  }

  async getRecipes(limit = 20): Promise<Recipe[]> {
    await this.ensureInitialized();
    
    try {
      const result = await this.client
        .select()
        .from(recipes)
        .where(eq(recipes.isPublic, true))
        .orderBy(desc(recipes.createdAt))
        .limit(limit);

      return result.map(recipe => this.convertDates(recipe));
    } catch (error) {
      console.error("[RecipesStorage] Failed to get recipes:", error);
      return [];
    }
  }

  async getRecipeById(id: number): Promise<Recipe | undefined> {
    try {
      const result = await this.client
        .select()
        .from(recipes)
        .where(eq(recipes.id, id))
        .limit(1);

      return result[0] ? this.convertDates(result[0]) : undefined;
    } catch (error) {
      console.error("[RecipesStorage] Failed to get recipe by ID:", error);
      return undefined;
    }
  }

  async getUserRecipes(userId: number): Promise<RecipeWithUserData[]> {
    await this.ensureInitialized();
    
    try {
      const result = await this.client
        .select({
          id: recipes.id,
          name: recipes.name,
          description: recipes.description,
          ingredients: recipes.ingredients,
          instructions: recipes.instructions,
          prepTime: recipes.prepTime,
          cookTime: recipes.cookTime,
          servings: recipes.servings,
          difficulty: recipes.difficulty,
          cuisine: recipes.cuisine,
          tags: recipes.tags,
          imageUrl: recipes.imageUrl,
          nutritionInfo: recipes.nutritionInfo,
          source: recipes.source,
          isPublic: recipes.isPublic,
          createdAt: recipes.createdAt,
          updatedAt: recipes.updatedAt,
          userRating: userRecipes.rating,
          isFavorite: userRecipes.isFavorite,
          timesCooked: userRecipes.timesCooked,
          lastMade: userRecipes.lastMade
        })
        .from(recipes)
        .leftJoin(userRecipes, and(
          eq(userRecipes.recipeId, recipes.id),
          eq(userRecipes.userId, userId)
        ))
        .where(eq(userRecipes.userId, userId))
        .orderBy(desc(userRecipes.savedAt));

      return result.map(recipe => this.convertDates(recipe));
    } catch (error) {
      console.error("[RecipesStorage] Failed to get user recipes:", error);
      return [];
    }
  }

  async saveRecipe(userRecipeData: InsertUserRecipe): Promise<UserRecipe> {
    try {
      // Check if already saved
      const existing = await this.client
        .select()
        .from(userRecipes)
        .where(and(
          eq(userRecipes.userId, userRecipeData.userId),
          eq(userRecipes.recipeId, userRecipeData.recipeId)
        ))
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        const result = await this.client
          .update(userRecipes)
          .set({
            ...userRecipeData,
            savedAt: new Date()
          })
          .where(eq(userRecipes.id, existing[0].id))
          .returning();
        
        return this.convertDates(result[0]);
      } else {
        // Create new
        const result = await this.client.insert(userRecipes).values({
          ...userRecipeData,
          savedAt: new Date()
        }).returning();
        
        return this.convertDates(result[0]);
      }
    } catch (error) {
      console.error("[RecipesStorage] Failed to save recipe:", error);
      throw new Error("Failed to save recipe");
    }
  }

  async rateRecipe(userId: number, recipeId: number, rating: number, notes?: string): Promise<UserRecipe | undefined> {
    try {
      // Check if user recipe exists
      const existing = await this.client
        .select()
        .from(userRecipes)
        .where(and(
          eq(userRecipes.userId, userId),
          eq(userRecipes.recipeId, recipeId)
        ))
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        const result = await this.client
          .update(userRecipes)
          .set({
            rating,
            notes: notes || existing[0].notes
          })
          .where(eq(userRecipes.id, existing[0].id))
          .returning();
        
        return this.convertDates(result[0]);
      } else {
        // Create new user recipe with rating
        const result = await this.client.insert(userRecipes).values({
          userId,
          recipeId,
          rating,
          notes,
          savedAt: new Date()
        }).returning();
        
        return this.convertDates(result[0]);
      }
    } catch (error) {
      console.error("[RecipesStorage] Failed to rate recipe:", error);
      return undefined;
    }
  }

  async generateRecipeSuggestions(userId: number, availableIngredients: string[]): Promise<RecipeSuggestion[]> {
    try {
      console.log("[RecipesStorage] Generating recipe suggestions for user:", userId);
      console.log("[RecipesStorage] Available ingredients:", availableIngredients);
      
      // Get all recipes and calculate match scores
      const allRecipes = await this.getRecipes(50);
      const suggestions: RecipeSuggestion[] = [];
      
      for (const recipe of allRecipes) {
        const recipeIngredients = recipe.ingredients || [];
        const matchingIngredients = recipeIngredients.filter(ingredient =>
          availableIngredients.some(available =>
            ingredient.toLowerCase().includes(available.toLowerCase()) ||
            available.toLowerCase().includes(ingredient.toLowerCase())
          )
        );
        
        if (matchingIngredients.length > 0) {
          const matchScore = Math.round((matchingIngredients.length / recipeIngredients.length) * 100);
          
          // Only suggest recipes with at least 30% match
          if (matchScore >= 30) {
            const suggestionData: InsertRecipeSuggestion = {
              userId,
              recipeId: recipe.id,
              matchingIngredients,
              matchScore,
              availableIngredients: matchingIngredients.length,
              totalIngredients: recipeIngredients.length
            };

            const result = await this.client.insert(recipeSuggestions).values(suggestionData).returning();
            suggestions.push(this.convertDates(result[0]));
          }
        }
      }
      
      console.log("[RecipesStorage] Created", suggestions.length, "recipe suggestions");
      return suggestions;
    } catch (error) {
      console.error("[RecipesStorage] Failed to generate suggestions:", error);
      return [];
    }
  }

  async getRecipeSuggestions(userId: number): Promise<RecipeWithUserData[]> {
    await this.ensureInitialized();
    
    try {
      const result = await this.client
        .select({
          id: recipes.id,
          name: recipes.name,
          description: recipes.description,
          ingredients: recipes.ingredients,
          instructions: recipes.instructions,
          prepTime: recipes.prepTime,
          cookTime: recipes.cookTime,
          servings: recipes.servings,
          difficulty: recipes.difficulty,
          cuisine: recipes.cuisine,
          tags: recipes.tags,
          imageUrl: recipes.imageUrl,
          nutritionInfo: recipes.nutritionInfo,
          source: recipes.source,
          isPublic: recipes.isPublic,
          createdAt: recipes.createdAt,
          updatedAt: recipes.updatedAt,
          matchingIngredients: recipeSuggestions.matchingIngredients,
          matchScore: recipeSuggestions.matchScore,
          userRating: userRecipes.rating,
          isFavorite: userRecipes.isFavorite,
          timesCooked: userRecipes.timesCooked
        })
        .from(recipeSuggestions)
        .leftJoin(recipes, eq(recipes.id, recipeSuggestions.recipeId))
        .leftJoin(userRecipes, and(
          eq(userRecipes.recipeId, recipes.id),
          eq(userRecipes.userId, userId)
        ))
        .where(and(
          eq(recipeSuggestions.userId, userId),
          eq(recipeSuggestions.isViewed, false)
        ))
        .orderBy(desc(recipeSuggestions.matchScore))
        .limit(10);

      return result.map(recipe => this.convertDates(recipe));
    } catch (error) {
      console.error("[RecipesStorage] Failed to get recipe suggestions:", error);
      return [];
    }
  }

  async markSuggestionViewed(suggestionId: number): Promise<boolean> {
    try {
      const result = await this.client
        .update(recipeSuggestions)
        .set({ isViewed: true })
        .where(eq(recipeSuggestions.id, suggestionId));

      return result.rowCount > 0;
    } catch (error) {
      console.error("[RecipesStorage] Failed to mark suggestion as viewed:", error);
      return false;
    }
  }

  async acceptSuggestion(suggestionId: number): Promise<boolean> {
    try {
      const result = await this.client
        .update(recipeSuggestions)
        .set({ isAccepted: true, isViewed: true })
        .where(eq(recipeSuggestions.id, suggestionId));

      return result.rowCount > 0;
    } catch (error) {
      console.error("[RecipesStorage] Failed to accept suggestion:", error);
      return false;
    }
  }

  async searchRecipes(query: string, availableIngredients?: string[]): Promise<RecipeWithUserData[]> {
    await this.ensureInitialized();
    
    try {
      const result = await this.client
        .select()
        .from(recipes)
        .where(and(
          eq(recipes.isPublic, true),
          or(
            ilike(recipes.name, `%${query}%`),
            ilike(recipes.description, `%${query}%`),
            ilike(recipes.cuisine, `%${query}%`)
          )
        ))
        .limit(20);

      // Filter by available ingredients if provided
      let filtered = result;
      if (availableIngredients && availableIngredients.length > 0) {
        filtered = result.filter(recipe => {
          const recipeIngredients = recipe.ingredients || [];
          return recipeIngredients.some(ingredient =>
            availableIngredients.some(available =>
              ingredient.toLowerCase().includes(available.toLowerCase())
            )
          );
        });
      }

      return filtered.map(recipe => this.convertDates(recipe));
    } catch (error) {
      console.error("[RecipesStorage] Failed to search recipes:", error);
      return [];
    }
  }

  async getPopularRecipes(limit = 10): Promise<RecipeWithUserData[]> {
    await this.ensureInitialized();
    
    try {
      const result = await this.client
        .select({
          id: recipes.id,
          name: recipes.name,
          description: recipes.description,
          ingredients: recipes.ingredients,
          instructions: recipes.instructions,
          prepTime: recipes.prepTime,
          cookTime: recipes.cookTime,
          servings: recipes.servings,
          difficulty: recipes.difficulty,
          cuisine: recipes.cuisine,
          tags: recipes.tags,
          imageUrl: recipes.imageUrl,
          nutritionInfo: recipes.nutritionInfo,
          source: recipes.source,
          isPublic: recipes.isPublic,
          createdAt: recipes.createdAt,
          updatedAt: recipes.updatedAt,
          avgRating: sql<number>`AVG(${userRecipes.rating})`,
          totalRatings: sql<number>`COUNT(${userRecipes.rating})`
        })
        .from(recipes)
        .leftJoin(userRecipes, eq(userRecipes.recipeId, recipes.id))
        .where(eq(recipes.isPublic, true))
        .groupBy(recipes.id)
        .orderBy(sql`AVG(${userRecipes.rating}) DESC NULLS LAST`)
        .limit(limit);

      return result.map(recipe => this.convertDates(recipe));
    } catch (error) {
      console.error("[RecipesStorage] Failed to get popular recipes:", error);
      return [];
    }
  }

  private convertDates(item: any): any {
    if (item.createdAt && typeof item.createdAt === 'string') {
      item.createdAt = new Date(item.createdAt);
    }
    if (item.updatedAt && typeof item.updatedAt === 'string') {
      item.updatedAt = new Date(item.updatedAt);
    }
    if (item.savedAt && typeof item.savedAt === 'string') {
      item.savedAt = new Date(item.savedAt);
    }
    if (item.suggestedAt && typeof item.suggestedAt === 'string') {
      item.suggestedAt = new Date(item.suggestedAt);
    }
    return item;
  }
}

export const recipesStorage = new RecipesStorage();
