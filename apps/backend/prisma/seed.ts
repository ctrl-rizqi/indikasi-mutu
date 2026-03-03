import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

declare const process: {
  env: Record<string, string | undefined>;
  exit(code?: number): never;
};

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables.");
}

const connectionString = process.env.DATABASE_URL.replace(
  /^mysql:\/\//,
  "mariadb://",
);
const adapter = new PrismaMariaDb(connectionString);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Start seeding...");

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: "password123", // Demo password - should be hashed in production
      name: "Super Administrator",
      role: Role.ADMIN,
    },
  });
  console.log("Created admin user:", admin.username);

  // Create User
  const user1 = await prisma.user.upsert({
    where: { username: "teknisi1" },
    update: {},
    create: {
      username: "teknisi1",
      password: "password123",
      name: "Budi Santoso",
      role: Role.USER,
    },
  });
  console.log("Created user:", user1.username);

  // Create Categories
  const categoryAC = await prisma.category.upsert({
    where: { name: "AC" },
    update: {},
    create: { name: "AC" },
  });
  console.log("Created category:", categoryAC.name);

  const categoryAPAR = await prisma.category.upsert({
    where: { name: "APAR" },
    update: {},
    create: { name: "APAR" },
  });
  console.log("Created category:", categoryAPAR.name);

  const categoryHydrant = await prisma.category.upsert({
    where: { name: "HYDRANT" },
    update: {},
    create: { name: "HYDRANT" },
  });
  console.log("Created category:", categoryHydrant.name);

  // Create Items / Alat
  const item1 = await prisma.item.upsert({
    where: { code: "AC-001" },
    update: {},
    create: {
      name: "AC Daikin 2PK",
      code: "AC-001",
      location: "Ruang UGD",
      categoryId: categoryAC.id,
    },
  });
  console.log("Created item:", item1.name);

  const item2 = await prisma.item.upsert({
    where: { code: "APR-001" },
    update: {},
    create: {
      name: "APAR 3Kg (ABC)",
      code: "APR-001",
      location: "Lorong Farmasi",
      categoryId: categoryAPAR.id,
    },
  });
  console.log("Created item:", item2.name);

  const item3 = await prisma.item.upsert({
    where: { code: "HYD-001" },
    update: {},
    create: {
      name: "Hydrant Indoor",
      code: "HYD-001",
      location: "Lantai 2 Sayap Kiri",
      categoryId: categoryHydrant.id,
    },
  });
  console.log("Created item:", item3.name);

  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
