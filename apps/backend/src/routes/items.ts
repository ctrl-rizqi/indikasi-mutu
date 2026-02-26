import { Hono } from 'hono'
import { prisma } from '../db'
import type { Item } from '@repo/resource'

const items = new Hono()

type CreateItemBody = Pick<Item, 'name' | 'code' | 'location' | 'categoryId'> & {
    spec?: string
}

items.get('/', async (c) => {
    // include category info
    const allItems = await prisma.item.findMany({
        include: { category: true }
    })
    return c.json(allItems)
})

items.post('/', async (c) => {
    const { name, code, location, categoryId, spec } = await c.req.json<CreateItemBody>()

    const newItem = await prisma.item.create({
        data: { name, code, location, categoryId, spec }
    })

    return c.json(newItem, 201)
})

export default items
