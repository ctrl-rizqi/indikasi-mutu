import { Hono } from 'hono'
import { prisma } from '../db'
import type { Role } from '@repo/resource'

const auth = new Hono()

type LoginBody = {
    username: string
    password: string
}

type LoginResponse = {
    token: string
    role: Role
    userId: string
}

auth.post('/login', async (c) => {
    const { username, password } = await c.req.json<LoginBody>()

    const user = await prisma.user.findUnique({
        where: { username }
    })

    if (!user || user.password !== password) { // Note: Password should be hashed in production
        return c.json({ error: 'Invalid credentials' }, 401)
    }

    // Simplified token generation for demo
    const payload: LoginResponse = {
        token: `fake-jwt-token-${user.id}`,
        role: user.role,
        userId: user.id
    }

    return c.json(payload)
})

export default auth
