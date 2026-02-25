import { Hono } from 'hono'
import { prisma } from '../db'
import type { Jadwal } from '@repo/resource'

const jadwal = new Hono()

type CreateJadwalBody = Pick<Jadwal, 'assetId' | 'petugasId'> & {
    plannedDate: string
}

jadwal.get('/', async (c) => {
    // Can filter by petugasId from query or auth token context
    const { petugasId } = c.req.query()

    const jadwals = await prisma.jadwal.findMany({
        where: petugasId ? { petugasId } : undefined,
        include: {
            asset: true,
            transaksi: true
        }
    })
    return c.json(jadwals)
})

jadwal.post('/', async (c) => {
    const { assetId, petugasId, plannedDate } = await c.req.json<CreateJadwalBody>()

    const schedule = await prisma.jadwal.create({
        data: {
            assetId,
            petugasId,
            plannedDate: new Date(plannedDate)
        }
    })

    return c.json(schedule, 201)
})

export default jadwal
