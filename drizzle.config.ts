import { existsSync } from "node:fs"

import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

if (existsSync(".env.local")) {
  config({ path: ".env.local" })
} else {
  config()
}

const connectionUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL

if (!connectionUrl) {
  throw new Error("Set DIRECT_URL or DATABASE_URL before using drizzle-kit")
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionUrl,
  },
  verbose: true,
  strict: true,
})
