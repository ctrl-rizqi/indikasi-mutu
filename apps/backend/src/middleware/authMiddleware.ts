import { createMiddleware } from 'hono/factory';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import type { Role } from '@repo/resource';

export interface AuthUser {
    id: string;
    username: string;
    name: string;
    role: Role;
}

declare module 'hono' {
    interface Context {
        user: AuthUser;
    }
}

export const authMiddleware = createMiddleware(async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized: No token provided' }, 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        if (!process.env.JWT_SECRET) {
            return c.json({ error: 'Server configuration error' }, 500);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
            userId: string;
            role: Role;
            username: string;
        };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, username: true, name: true, role: true }
        });

        if (!user) {
            return c.json({ error: 'Unauthorized: Invalid token' }, 401);
        }

        c.set('user', user);
        await next();
    } catch (error) {
        return c.json({ error: 'Unauthorized: Invalid or expired token' }, 401);
    }
});

export const requireRole = (requiredRole: Role) => {
    return createMiddleware(async (c, next) => {
        const user = c.get('user');
        if (user.role !== requiredRole) {
            return c.json({ error: 'Forbidden: Insufficient permissions' }, 403);
        }
        await next();
    });
};