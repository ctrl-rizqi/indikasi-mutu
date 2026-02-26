"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const db_1 = require("../db");
const laporan = new hono_1.Hono();
laporan.get('/indikator-mutu', async (c) => {
    // For now we aggregate all activity logs
    // In the future this can accept ?startDate=&endDate= &categoryId=
    const totalActivities = await db_1.prisma.activityLog.count();
    const activities = await db_1.prisma.activityLog.findMany({
        include: {
            item: {
                include: { category: true }
            }
        },
        orderBy: { createdAt: 'asc' }
    });
    // Group by category for a pie chart
    const categoryCounts = {};
    // Group by date (YYYY-MM-DD) for a run chart/trend
    const trendCounts = {};
    activities.forEach(log => {
        const cat = log.item.category.name;
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        const dateStr = log.createdAt.toISOString().split('T')[0];
        trendCounts[dateStr] = (trendCounts[dateStr] || 0) + 1;
    });
    return c.json({
        total: totalActivities,
        byCategory: Object.entries(categoryCounts).map(([label, value]) => ({ label, value })),
        trend: Object.entries(trendCounts).map(([date, count]) => ({ date, count }))
    });
});
exports.default = laporan;
