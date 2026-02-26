"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const health = new hono_1.Hono();
health.get('/', (c) => {
    return c.json({
        message: 'OK',
        timestamp: new Date().toISOString()
    });
});
exports.default = health;
