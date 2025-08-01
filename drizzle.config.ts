// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./app/drizzle/schema/schema.server.ts",
  out:    "./app/drizzle/migrations",
  dialect: "sqlite",                     // <-- use “sqlite” here
  dbCredentials: {
    url: process.env.DATABASE_URL ||     // <-- url is correct for sqlite
         "sqlite://./app/db.sqlite",
  },
  verbose: true,
  strict:  true,
});
