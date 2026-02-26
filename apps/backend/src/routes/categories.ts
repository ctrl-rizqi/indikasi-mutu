import { Hono } from 'hono'
import { prisma } from '../db'
import type { Category } from '@repo/resource'

const categories = new Hono()

categories.get('/', async (c) => {
    const allCategories = await prisma.category.findMany()
    return c.json(allCategories)
})

export default categories
