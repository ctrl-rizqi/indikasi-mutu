"use server"

import { hash } from "bcryptjs"
import { and, eq, ne } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { roles, users } from "@/lib/db/schema"

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function getNumber(formData: FormData, key: string) {
  const value = Number(getString(formData, key))
  return Number.isInteger(value) && value > 0 ? value : null
}

export async function createUser(formData: FormData) {
  await requireRole(["admin"])

  const name = getString(formData, "name")
  const username = getString(formData, "username")
  const password = getString(formData, "password")
  const roleId = getNumber(formData, "roleId")

  if (!name || !username || !password || !roleId) {
    return
  }

  const [role] = await db.select({ id: roles.id }).from(roles).where(eq(roles.id, roleId)).limit(1)

  if (!role) {
    return
  }

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1)

  if (existingUser) {
    return
  }

  const passwordHash = await hash(password, 10)

  await db.insert(users).values({
    name,
    username,
    password: passwordHash,
    roleId,
  })

  revalidatePath("/dashboard/users")
}

export async function updateUser(formData: FormData) {
  await requireRole(["admin"])

  const userId = getNumber(formData, "id")
  const name = getString(formData, "name")
  const username = getString(formData, "username")
  const password = getString(formData, "password")
  const roleId = getNumber(formData, "roleId")

  if (!userId || !name || !username || !roleId) {
    return
  }

  const [role] = await db.select({ id: roles.id }).from(roles).where(eq(roles.id, roleId)).limit(1)

  if (!role) {
    return
  }

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.username, username), ne(users.id, userId)))
    .limit(1)

  if (existingUser) {
    return
  }

  const updateData: {
    name: string
    username: string
    roleId: number
    updatedAt: Date
    password?: string
  } = {
    name,
    username,
    roleId,
    updatedAt: new Date(),
  }

  if (password) {
    updateData.password = await hash(password, 10)
  }

  await db.update(users).set(updateData).where(eq(users.id, userId))

  revalidatePath("/dashboard/users")
}

export async function deleteUser(formData: FormData) {
  const session = await requireRole(["admin"])

  const userId = getNumber(formData, "id")

  if (!userId) {
    return
  }

  if (Number(session.user.id) === userId) {
    return
  }

  await db.delete(users).where(eq(users.id, userId))

  revalidatePath("/dashboard/users")
}
