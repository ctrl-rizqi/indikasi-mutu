import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables.");
}

const connectionString = process.env.DATABASE_URL.replace(
  /^mysql:\/\//,
  "mariadb://",
);
const adapter = new PrismaMariaDb(connectionString);

export const prisma = new PrismaClient({ adapter });
export * from "@prisma/client";
