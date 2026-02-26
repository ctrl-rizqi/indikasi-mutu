import { Hono } from 'hono'
import { prisma } from '../db'
import type { Role } from '@repo/resource'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const auth = new Hono()

const LoginBodySchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6)
})

type LoginResponse = {
    token: string
    role: Role
    userId: string
    name: string
}

auth.post('/login', async (c) => {
    const parsed = LoginBodySchema.safeParse(await c.req.json())
    if (!parsed.success) {
        return c.json({ error: 'Invalid request body', details: parsed.error }, 400)
    }
    const { username, password } = parsed.data

    const user = await prisma.user.findUnique({
        where: { username }
    })

    if (!user) {
        return c.json({ error: 'Invalid credentials' }, 401)
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
        return c.json({ error: 'Invalid credentials' }, 401)
    }

    if (!process.env.JWT_SECRET) {
        return c.json({ error: 'Server configuration error' }, 500)
    }

    const token = jwt.sign(
        {
            userId: user.id,
            role: user.role,
            username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    )

    const payload: LoginResponse = {
        token,
        role: user.role,
        userId: user.id,
        name: user.name
    }

    // Generate refresh token
    const refreshToken = await generateRefreshToken(user.id);
    return c.json({
        ...payload,
        refreshToken: refreshToken.token
    });

// Generate refresh token
function generateRefreshToken(userId: string): Promise<RefreshToken> {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

  return prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt
    }
  });
}

// Revoke all refresh tokens for a user
async function revokeUserRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });
}

// Refresh access token endpoint
auth.post('/refresh', async (c) => {
  const { refreshToken } = await c.req.json();
  if (!refreshToken) {
    return c.json({ error: 'Refresh token required' }, 400);
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken }
  });

  if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
    return c.json({ error: 'Invalid or expired refresh token' }, 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: storedToken.userId }
  });

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  // Generate new access token
  if (!process.env.JWT_SECRET) {
    return c.json({ error: 'Server configuration error' }, 500);
  }

  const newAccessToken = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      username: user.username
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Rotate refresh token: invalidate old one and issue new
  await revokeUserRefreshTokens(user.id);
  const newRefreshToken = await generateRefreshToken(user.id);

  return c.json({
    token: newAccessToken,
    refreshToken: newRefreshToken.token,
    user: { id: user.id, username: user.username, name: user.name, role: user.role }
  });
});

// Logout endpoint
auth.post('/logout', async (c) => {
  const { refreshToken } = await c.req.json();
  if (refreshToken) {
    await prisma.refreshToken.update({
      where: { token: refreshToken },
      data: { revokedAt: new Date() }
    });
  }
  return c.json({ message: 'Logged out successfully' });
});

const SignupBodySchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
    name: z.string().min(1),
    role: z.enum(['ADMIN', 'USER']).default('USER')
})

auth.post('/signup', async (c) => {
    const parsed = SignupBodySchema.safeParse(await c.req.json())
    if (!parsed.success) {
        return c.json({ error: 'Invalid request body', details: parsed.error }, 400)
    }
    const { username, password, name, role } = parsed.data

    const existingUser = await prisma.user.findUnique({
        where: { username }
    })
    if (existingUser) {
        return c.json({ error: 'Username already taken' }, 409)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            name,
            role
        }
    })

    if (!process.env.JWT_SECRET) {
        return c.json({ error: 'Server configuration error' }, 500)
    }

    const token = jwt.sign(
        {
            userId: user.id,
            role: user.role,
            username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    )

    const payload: LoginResponse = {
        token,
        role: user.role,
        userId: user.id,
        name: user.name
    }

    // Generate refresh token
    const refreshToken = await generateRefreshToken(user.id);
    return c.json({
        ...payload,
        refreshToken: refreshToken.token
    }, 201);

export default auth