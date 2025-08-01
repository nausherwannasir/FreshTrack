import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { db } from "../app/drizzle/config.server";
import { sql } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

function runCommand(command) {
  try {
    const output = execSync(command, {
      cwd: projectRoot,
      stdio: "pipe",
      encoding: "utf8",
    });
    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      output: error.stdout?.toString() || error.message,
    };
  }
}

async function main() {
  console.log("Running initial database migration...");

  try {
    await reset();
  } catch (error) {
    console.error("❌ Reset failed");
    console.error(error);
  }

  const firstAttempt = runCommand("pnpm drizzle-kit push");

  if (
    !firstAttempt.success ||
    firstAttempt.output.includes("ASSERTIONS") ||
    firstAttempt.output.includes("created or renamed")
  ) {
    console.log(
      "Migration failed or contains assertions error. Cleaning up and retrying..."
    );
    
    try {
      await reset();
    } catch (error) {
      console.error("❌ Reset failed second time");
      console.error(error);
    }

    console.log("Running migration again...");

    const secondAttempt = runCommand("pnpm drizzle-kit push");

    if (!secondAttempt.success) {
      console.error("Migration failed after cleanup:", secondAttempt.output);
      process.exit(1);
    }
  }

  console.log("Database migration completed");
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});

async function reset() {
  console.log("⏳ Resetting database...");

  const start = Date.now();

  // For SQLite, we'll just delete the database file and let it be recreated
  const fs = await import("fs");
  const path = await import("path");
  
  const dbPath = path.join(projectRoot, "app", "db.sqlite");
  
  try {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log("✅ Database file deleted");
    }
  } catch (error) {
    console.error("Failed to delete database file:", error);
  }

  const end = Date.now();
  console.log(`✅ Reset end & took ${end - start}ms`);
  console.log("");
}
