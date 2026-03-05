import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

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
