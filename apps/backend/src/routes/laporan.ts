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

  const categoryMap: Record<string, { id: string; name: string; count: number; enumerator: number; denumerator: number }> = {};
  const conditionMap: Record<string, number> = {};
  const trendMap: Record<string, { count: number; enumerator: number; denumerator: number }> = {};

  let totalEnumerator = 0;
  let totalDenumerator = 0;

  const history = activities.map((a) => {
    // Condition Breakdown (Extracting from Json checklist)
    const checklist = a.checklist as any;
    // Try common keys for condition, default to "Normal"
    const condition =
      checklist.kondisi ||
      checklist.status ||
      (checklist.baik === true ? "Baik" : checklist.baik === false ? "Rusak" : "Normal");
    
    // Logic for enumerator (numerator) and denumerator (denominator)
    // numerator: meets standard/good condition
    // denominator: total checked
    const isCompliant = 
      checklist.baik === true || 
      ["Baik", "Normal", "Active", "Sesuai", "Lengkap"].includes(condition);
    
    const enumerator = isCompliant ? 1 : 0;
    const denumerator = 1;

    totalEnumerator += enumerator;
    totalDenumerator += denumerator;

    // Category Breakdown
    const cat = a.item.category;
    if (!categoryMap[cat.id]) {
      categoryMap[cat.id] = { id: cat.id, name: cat.name, count: 0, enumerator: 0, denumerator: 0 };
    }
    categoryMap[cat.id].count++;
    categoryMap[cat.id].enumerator += enumerator;
    categoryMap[cat.id].denumerator += denumerator;

    // Condition Map
    conditionMap[condition] = (conditionMap[condition] || 0) + 1;

    // Daily Trend
    const date = a.createdAt.toISOString().split("T")[0];
    if (!trendMap[date]) {
      trendMap[date] = { count: 0, enumerator: 0, denumerator: 0 };
    }
    trendMap[date].count++;
    trendMap[date].enumerator += enumerator;
    trendMap[date].denumerator += denumerator;

    return {
      id: a.id,
      itemId: a.itemId,
      itemName: a.item.name,
      categoryName: a.item.category.name,
      checkedAt: a.createdAt.toISOString(),
      condition,
      isCompliant,
      enumerator,
      denumerator,
      note: a.note || null,
      photo: a.photo || null,
    };
  });

  return {
    meta: {
      contractVersion: 3,
      generatedAt: new Date().toISOString(),
      filters: { itemId: itemId || null },
    },
    summary: {
      totalActivities,
      uniqueItems,
      uniqueCategories,
      enumerator: totalEnumerator,
      denumerator: totalDenumerator,
      complianceRate: totalDenumerator > 0 ? (totalEnumerator / totalDenumerator) * 100 : 0,
    },
    breakdowns: {
      byCategory: Object.values(categoryMap).map((c) => ({
        categoryId: c.id,
        categoryName: c.name,
        count: c.count,
        enumerator: c.enumerator,
        denumerator: c.denumerator,
        percentage: c.denumerator > 0 ? (c.enumerator / c.denumerator) * 100 : 0,
      })),
      byCondition: Object.entries(conditionMap).map(([condition, count]) => ({
        condition,
        count,
      })),
    },
    trend: {
      daily: Object.entries(trendMap)
        .map(([date, data]) => ({
          date,
          count: data.count,
          enumerator: data.enumerator,
          denumerator: data.denumerator,
          percentage: data.denumerator > 0 ? (data.enumerator / data.denumerator) * 100 : 0,
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    },
    history,
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
