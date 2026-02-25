import { Hono } from 'hono'
import { prisma } from '../db'
import { STATUS_PELAKSANAAN } from '@repo/resource'

const laporan = new Hono()

laporan.get('/indikator-mutu', async (c) => {
    c.req.query()
    // Filter theoretically by month/year here, for now calculating overall

    const totalRencana = await prisma.jadwal.count()

    // Numerator: transaksis completed strictly on or before time
    const tepatWaktuCount = await prisma.transaksi.count({
        where: {
            status: STATUS_PELAKSANAAN.TEPAT_WAKTU
        }
    })

    const denominaton = totalRencana
    const numerator = tepatWaktuCount

    const percentage = denominaton > 0 ? (numerator / denominaton) * 100 : 0

    return c.json({
        numerator,
        denominator: denominaton,
        percentage: percentage.toFixed(2) + '%',
        visualData: {
            label: 'Kepatuhan Pemeliharaan Rutin Aset',
            value: percentage
        }
    })
})

export default laporan
