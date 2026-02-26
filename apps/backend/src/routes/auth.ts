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

    return c.json(payload)
})

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

    return c.json(payload, 201)
})

export default auth