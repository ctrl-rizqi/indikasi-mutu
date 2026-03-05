import { Hono } from 'hono'
import { prisma } from '../db'
import type { Category } from '@repo/resource'

const categories = new Hono()

type CategoryPayload = Pick<Category, 'name'>

const normalizeName = (value: unknown) =>
  typeof value === 'string' ? value.trim() : ''

const isUniqueConstraintError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false
  }

  return error.message.includes('Unique constraint failed')
}

const isForeignKeyConstraintError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false
  }

  return error.message.includes('Foreign key constraint violated')
}

categories.get('/', async (c) => {
  const allCategories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return c.json(allCategories)
})

categories.get('/:id', async (c) => {
  const id = c.req.param('id')

  const category = await prisma.category.findUnique({
    where: { id },
  })

  if (!category) {
    return c.json({ message: 'Kategori tidak ditemukan' }, 404)
  }

  return c.json(category)
})

categories.post('/', async (c) => {
  const body = await c.req.json<CategoryPayload>()
  const name = normalizeName(body.name)

  if (!name) {
    return c.json({ message: 'Nama kategori wajib diisi' }, 400)
  }

  try {
    const newCategory = await prisma.category.create({
      data: { name },
    })

    return c.json(newCategory, 201)
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return c.json({ message: 'Nama kategori sudah digunakan' }, 409)
    }

    throw error
  }
})

categories.put('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<CategoryPayload>()
  const name = normalizeName(body.name)

  if (!name) {
    return c.json({ message: 'Nama kategori wajib diisi' }, 400)
  }

  const existingCategory = await prisma.category.findUnique({
    where: { id },
  })

  if (!existingCategory) {
    return c.json({ message: 'Kategori tidak ditemukan' }, 404)
  }

  try {
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name },
    })

    return c.json(updatedCategory)
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return c.json({ message: 'Nama kategori sudah digunakan' }, 409)
    }

    throw error
  }
})

categories.delete('/:id', async (c) => {
  const id = c.req.param('id')

  const existingCategory = await prisma.category.findUnique({
    where: { id },
  })

  if (!existingCategory) {
    return c.json({ message: 'Kategori tidak ditemukan' }, 404)
  }

  try {
    await prisma.category.delete({
      where: { id },
    })

    return c.body(null, 204)
  } catch (error) {
    if (isForeignKeyConstraintError(error)) {
      return c.json(
        { message: 'Kategori masih digunakan oleh item, tidak dapat dihapus' },
        409,
      )
    }

    throw error
  }
})

export default categories
