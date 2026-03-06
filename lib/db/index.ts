import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "./schema"

const connectionUrl = process.env.DATABASE_URL

if (!connectionUrl) {
  throw new Error("Set DATABASE_URL to initialize Drizzle client")
}

declare global {
  var __drizzleClient: ReturnType<typeof postgres> | undefined
}

const client =
  global.__drizzleClient ??
  postgres(connectionUrl, {
    prepare: false,
    ssl: "require",
  })

if (process.env.NODE_ENV !== "production") {
  global.__drizzleClient = client
}

export const db = drizzle(client, { schema })
