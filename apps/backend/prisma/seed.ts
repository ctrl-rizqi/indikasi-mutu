import { PrismaClient, Role } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in environment variables.")
}

const connectionString = process.env.DATABASE_URL.replace(/^mysql:\/\//, 'mariadb://')
const adapter = new PrismaMariaDb(connectionString)

const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Start seeding...')

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: 'password123', // Demo password
            name: 'Super Administrator',
            role: Role.ADMIN,
        },
    })

    // Create User
    const user1 = await prisma.user.upsert({
        where: { username: 'teknisi1' },
        update: {},
        create: {
            username: 'teknisi1',
            password: 'password123',
            name: 'Budi Santoso',
            role: Role.USER,
        },
    })

    // Create Categories
    const categoryAC = await prisma.category.upsert({
        where: { name: 'AC' },
        update: {},
        create: { name: 'AC' }
    })

    const categoryAPAR = await prisma.category.upsert({
        where: { name: 'APAR' },
        update: {},
        create: { name: 'APAR' }
    })

    const categoryHydrant = await prisma.category.upsert({
        where: { name: 'HYDRANT' },
        update: {},
        create: { name: 'HYDRANT' }
    })

    // Create Items / Alat
    await prisma.item.upsert({
        where: { code: 'AC-001' },
        update: {},
        create: {
            name: 'AC Daikin 2PK',
            code: 'AC-001',
            location: 'Ruang UGD',
            categoryId: categoryAC.id
        }
    })

    await prisma.item.upsert({
        where: { code: 'APR-001' },
        update: {},
        create: {
            name: 'APAR 3Kg (ABC)',
            code: 'APR-001',
            location: 'Lorong Farmasi',
            categoryId: categoryAPAR.id
        }
    })

    await prisma.item.upsert({
        where: { code: 'HYD-001' },
        update: {},
        create: {
            name: 'Hydrant Indoor',
            code: 'HYD-001',
            location: 'Lantai 2 Sayap Kiri',
            categoryId: categoryHydrant.id
        }
    })

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
