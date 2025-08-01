import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "../app/drizzle/config.server";

async function main() {
  console.log("⏳ Running migrations...");
  try {
    await migrate(db, { migrationsFolder: "./app/drizzle/migrations" });
    console.log("✅ Migrations completed successfully.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
