import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./app/drizzle/schema/schema.server.ts",
  out: "./app/drizzle/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "./app/db.sqlite",
  },
  verbose: true,
  strict: true,
});
