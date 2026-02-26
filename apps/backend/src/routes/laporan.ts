import { Hono } from 'hono'
import { prisma } from '../db'

const laporan = new Hono()

laporan.get('/indikator-mutu', async (c) => {
    // For now we aggregate all activity logs
    // In the future this can accept ?startDate=&endDate= &categoryId=

    const totalActivities = await prisma.activityLog.count()

    const activities = await prisma.activityLog.findMany({
        include: {
            item: {
                include: { category: true }
            }
        },
        orderBy: { createdAt: 'asc' }
    })

    // Group by category for a pie chart
    const categoryCounts: Record<string, number> = {}

    // Group by date (YYYY-MM-DD) for a run chart/trend
    const trendCounts: Record<string, number> = {}

    activities.forEach(log => {
        const cat = log.item.category.name
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1

        const dateStr = log.createdAt.toISOString().split('T')[0]
        trendCounts[dateStr] = (trendCounts[dateStr] || 0) + 1
    })

    return c.json({
        total: totalActivities,
        byCategory: Object.entries(categoryCounts).map(([label, value]) => ({ label, value })),
        trend: Object.entries(trendCounts).map(([date, count]) => ({ date, count }))
    })
})

export default laporan
