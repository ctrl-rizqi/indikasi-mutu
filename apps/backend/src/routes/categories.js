"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const db_1 = require("../db");
const categories = new hono_1.Hono();
categories.get('/', async (c) => {
    const allCategories = await db_1.prisma.category.findMany();
    return c.json(allCategories);
});
exports.default = categories;
