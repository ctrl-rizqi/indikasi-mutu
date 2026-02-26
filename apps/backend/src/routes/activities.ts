import { Hono } from 'hono'
import { prisma } from '../db'
import type { ActivityLog, ActivityChecklist } from '@repo/resource'
const activities = new Hono()

type CreateActivityBody = {
    itemId: string
    userId: string
    checklist: ActivityChecklist
    note?: string
    photo?: string
}

activities.get('/', async (c) => {
    const logs = await prisma.activityLog.findMany({
        include: { user: { select: { name: true } }, item: true },
        orderBy: { createdAt: 'desc' }
    })
    return c.json(logs)
})

activities.post('/', async (c) => {
    const { itemId, userId, checklist, note, photo } = await c.req.json<CreateActivityBody>()

    const newActivity = await prisma.activityLog.create({
        data: {
            itemId,
            userId,
            checklist,
            note,
            photo
        }
    })

    return c.json(newActivity, 201)
})

export default activities
