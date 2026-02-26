"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const db_1 = require("../db");
const activities = new hono_1.Hono();
activities.get('/', async (c) => {
    const logs = await db_1.prisma.activityLog.findMany({
        include: { user: { select: { name: true } }, item: true },
        orderBy: { createdAt: 'desc' }
    });
    return c.json(logs);
});
activities.post('/', async (c) => {
    const { itemId, userId, checklist, note, photo } = await c.req.json();
    const newActivity = await db_1.prisma.activityLog.create({
        data: {
            itemId,
            userId,
            checklist,
            note,
            photo
        }
    });
    return c.json(newActivity, 201);
});
exports.default = activities;
