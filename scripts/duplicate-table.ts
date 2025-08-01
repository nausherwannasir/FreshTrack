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

  const query = `
      -- SQLite doesn't have enums, so we can skip enum cleanup
      -- This script is now adapted for SQLite
      `;

  // For SQLite, we can just run a simple command or skip this step entirely
  console.log("✅ Database cleanup skipped (SQLite doesn't require enum cleanup)");

  const end = Date.now();
  console.log(`✅ Reset end & took ${end - start}ms`);
  console.log("");
}
