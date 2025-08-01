import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./app/drizzle/schema/schema.server.ts",
  out: "./app/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/freshtrack",
  },
  verbose: true,
  strict: true,
});
