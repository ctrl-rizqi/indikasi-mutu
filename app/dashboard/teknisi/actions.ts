"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { activities } from "@/lib/db/schema"

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function getNumber(formData: FormData, key: string) {
  const value = Number(getString(formData, key))
  return Number.isInteger(value) && value > 0 ? value : null
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on"
}

export async function createActivity(formData: FormData) {
  const session = await requireRole(["teknisi", "admin"])

  const itemId = getNumber(formData, "itemId")
  const check1 = getBoolean(formData, "check1")
  const check2 = getBoolean(formData, "check2")
  const keterangan = getString(formData, "keterangan")

  if (!itemId) {
    return
  }

  await db.insert(activities).values({
    userId: Number(session.user.id),
    itemId,
    check1,
    check2,
    keterangan,
  })

  revalidatePath("/dashboard/teknisi")
}

export async function updateActivity(formData: FormData) {
  await requireRole(["teknisi", "admin"])

  const id = getNumber(formData, "id")
  const itemId = getNumber(formData, "itemId")
  const check1 = getBoolean(formData, "check1")
  const check2 = getBoolean(formData, "check2")
  const keterangan = getString(formData, "keterangan")

  if (!id || !itemId) {
    return
  }

  await db
    .update(activities)
    .set({
      itemId,
      check1,
      check2,
      keterangan,
      updatedAt: new Date(),
    })
    .where(eq(activities.id, id))

  revalidatePath("/dashboard/teknisi")
}

export async function deleteActivity(formData: FormData) {
  await requireRole(["teknisi", "admin"])

  const id = getNumber(formData, "id")

  if (!id) {
    return
  }

  await db.delete(activities).where(eq(activities.id, id))

  revalidatePath("/dashboard/teknisi")
}
