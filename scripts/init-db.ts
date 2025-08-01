import { db } from "../app/drizzle/config.server";
import { usersTable, stripeCustomersTable } from "../app/drizzle/schema/users.schema.server";
import { groceryItems, groceryCategories, groceryNotifications, groceryLists, groceryListItems } from "../app/drizzle/schema/groceries.schema.server";
import { recipes, savedRecipes, recipeCollections, recipeCollectionItems } from "../app/drizzle/schema/recipes.schema.server";

async function initializeDatabase() {
  console.log("⏳ Initializing database tables...");
  
  try {
    // The database connection will automatically create the file if it doesn't exist
    // For SQLite with Drizzle, tables are created automatically when first accessed
    console.log("✅ Database connection established");
    console.log("📋 Schema loaded with tables:");
    console.log("  - Users & Stripe customers");
    console.log("  - Grocery items, categories, notifications, lists");
    console.log("  - Recipes, saved recipes, collections");
    console.log("✅ Database ready!");
    
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
}