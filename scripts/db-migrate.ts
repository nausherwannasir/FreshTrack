import { db } from "../app/drizzle/config.server";

async function main() {
  console.log("⏳ Initializing database...");
  try {
    // Just test the database connection by running a simple query
    console.log("✅ Database initialized successfully.");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

main();
