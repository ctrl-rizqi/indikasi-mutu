"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authMiddleware = void 0;
const factory_1 = require("hono/factory");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
exports.authMiddleware = (0, factory_1.createMiddleware)(async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized: No token provided' }, 401);
    }
    const token = authHeader.split(' ')[1];
    try {
        if (!process.env.JWT_SECRET) {
            return c.json({ error: 'Server configuration error' }, 500);
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await db_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, username: true, name: true, role: true }
        });
        if (!user) {
            return c.json({ error: 'Unauthorized: Invalid token' }, 401);
        }
        c.set('user', user);
        await next();
    }
    catch (error) {
        return c.json({ error: 'Unauthorized: Invalid or expired token' }, 401);
    }
});
const requireRole = (requiredRole) => {
    return (0, factory_1.createMiddleware)(async (c, next) => {
        const user = c.get('user');
        if (user.role !== requiredRole) {
            return c.json({ error: 'Forbidden: Insufficient permissions' }, 403);
        }
        await next();
    });
};
exports.requireRole = requireRole;
