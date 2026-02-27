import { Hono } from "hono";
import { prisma } from "../db";

const laporan = new Hono();

// Helper to calculate statistics and aggregate data
async function getLaporanData(itemId?: string, startDate?: string, endDate?: string) {
  const where: any = {};
  if (itemId) where.itemId = itemId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) {
      // Set to end of day if only date is provided
      const end = new Date(endDate);
      if (endDate.length <= 10) {
        end.setHours(23, 59, 59, 999);
      }
      where.createdAt.lte = end;
    }
  }

  const activities = await prisma.activityLog.findMany({
    where,
    include: {
      item: { include: { category: true } },
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalActivities = activities.length;
  const uniqueItems = new Set(activities.map((a) => a.itemId)).size;
  const uniqueCategories = new Set(activities.map((a) => a.item.categoryId)).size;

  const categoryMap: Record<string, { id: string; name: string; count: number }> = {};
  const conditionMap: Record<string, number> = {};
  const trendMap: Record<string, number> = {};

  activities.forEach((a) => {
    // Category Breakdown
    const cat = a.item.category;
    if (!categoryMap[cat.id]) {
      categoryMap[cat.id] = { id: cat.id, name: cat.name, count: 0 };
    }
    categoryMap[cat.id].count++;

    // Condition Breakdown (Extracting from Json checklist)
    const checklist = a.checklist as any;
    // Try common keys for condition, default to "Normal"
    const condition =
      checklist.kondisi ||
      checklist.status ||
      (checklist.baik === true ? "Baik" : checklist.baik === false ? "Rusak" : "Normal");
    conditionMap[condition] = (conditionMap[condition] || 0) + 1;

    // Daily Trend
    const date = a.createdAt.toISOString().split("T")[0];
    trendMap[date] = (trendMap[date] || 0) + 1;
  });

  return {
    meta: {
      contractVersion: 2,
      generatedAt: new Date().toISOString(),
      filters: { itemId: itemId || null },
    },
    summary: {
      totalActivities,
      uniqueItems,
      uniqueCategories,
    },
    breakdowns: {
      byCategory: Object.values(categoryMap).map((c) => ({
        categoryId: c.id,
        categoryName: c.name,
        count: c.count,
      })),
      byCondition: Object.entries(conditionMap).map(([condition, count]) => ({
        condition,
        count,
      })),
    },
    trend: {
      daily: Object.entries(trendMap)
        .map(([date, count]) => ({
          date,
          count,
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    },
    history: activities.map((a) => ({
      id: a.id,
      itemId: a.itemId,
      itemName: a.item.name,
      categoryName: a.item.category.name,
      checkedAt: a.createdAt.toISOString(),
      condition:
        (a.checklist as any).kondisi || (a.checklist as any).status || "Normal",
      note: a.note || null,
      photo: a.photo || null,
    })),
  };
}

// 1. Unified Laporan Endpoint (compatible with frontend)
// Supports ?itemId=...&startDate=...&endDate=...
laporan.get("/indikator-mutu", async (c) => {
  const itemId = c.req.query("itemId");
  const startDate = c.req.query("startDate");
  const endDate = c.req.query("endDate");

  const data = await getLaporanData(itemId, startDate, endDate);
  return c.json(data);
});

// 2. Report per Item (Summary list of all items with their activity status)
laporan.get("/items", async (c) => {
  const itemsWithSummary = await prisma.item.findMany({
    include: {
      category: true,
      _count: {
        select: { activities: true },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return c.json(itemsWithSummary);
});

// 3. Overall Activity Log (Simple list)
laporan.get("/activities", async (c) => {
  const startDate = c.req.query("startDate");
  const endDate = c.req.query("endDate");

  const where: any = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      if (endDate.length <= 10) end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  const allActivities = await prisma.activityLog.findMany({
    where,
    include: {
      user: { select: { name: true, username: true } },
      item: { include: { category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return c.json(allActivities);
});

// 4. Detailed history for a specific item (can also use /indikator-mutu?itemId=...)
laporan.get("/item/:id/history", async (c) => {
  const itemId = c.req.param("id");
  const startDate = c.req.query("startDate");
  const endDate = c.req.query("endDate");

  const data = await getLaporanData(itemId, startDate, endDate);
  return c.json(data.history);
});

export default laporan;
