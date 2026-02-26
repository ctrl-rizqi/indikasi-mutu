"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const db_1 = require("../db");
const items = new hono_1.Hono();
items.get('/', async (c) => {
    // include category info
    const allItems = await db_1.prisma.item.findMany({
        include: { category: true }
    });
    return c.json(allItems);
});
items.post('/', async (c) => {
    const { name, code, location, categoryId, spec } = await c.req.json();
    const newItem = await db_1.prisma.item.create({
        data: { name, code, location, categoryId, spec }
    });
    return c.json(newItem, 201);
});
exports.default = items;
