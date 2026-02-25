import { Hono } from 'hono'
import { prisma } from '../db'
import { STATUS_PELAKSANAAN } from '@repo/resource'
import type { Transaksi } from '@repo/resource'

const transaksi = new Hono()

type CreateTransaksiBody = Pick<Transaksi, 'jadwalId' | 'hasilFisik'> & {
    actualDate: string
}

transaksi.post('/', async (c) => {
    const { jadwalId, actualDate, hasilFisik } = await c.req.json<CreateTransaksiBody>()

    // Business logic: check ketepatan waktu
    const schedule = await prisma.jadwal.findUnique({
        where: { id: jadwalId }
    })

    if (!schedule) {
        return c.json({ error: 'Jadwal not found' }, 404)
    }

    const actDate = new Date(actualDate)
    // Simple check for Tepat Waktu (ignoring exact time for this demo, just comparing dates loosely)
    const isTepatWaktu = actDate.getTime() <= schedule.plannedDate.getTime()

    const status = isTepatWaktu ? STATUS_PELAKSANAAN.TEPAT_WAKTU : STATUS_PELAKSANAAN.TERLAMBAT

    const newTransaksi = await prisma.transaksi.create({
        data: {
            jadwalId,
            actualDate: actDate,
            hasilFisik,
            status
        }
    })

    return c.json({ newTransaksi, isTepatWaktu })
})

export default transaksi
