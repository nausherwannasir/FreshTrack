import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema/schema.server";
import dotenv from "dotenv";

dotenv.config();

let dbInstance: ReturnType<typeof drizzle>;

export function getDbInstance() {
  if (!dbInstance) {
    try {
      const sqlite = new Database("app/db.sqlite");
      dbInstance = drizzle(sqlite, { schema });
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }
  return dbInstance;
}

export const db = getDbInstance();
export type Schema = typeof schema;
