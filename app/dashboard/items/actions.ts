"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { items } from "@/lib/db/schema"

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function getNumber(formData: FormData, key: string) {
  const value = Number(getString(formData, key))
  return Number.isInteger(value) && value > 0 ? value : null
}

export async function createItem(formData: FormData) {
  await requireRole(["admin"])

  const nama = getString(formData, "nama")
  const deskripsi = getString(formData, "deskripsi")

  if (!nama || !deskripsi) {
    return
  }

  await db.insert(items).values({
    nama,
    deskripsi,
  })

  revalidatePath("/dashboard/items")
}

export async function updateItem(formData: FormData) {
  await requireRole(["admin"])

  const id = getNumber(formData, "id")
  const nama = getString(formData, "nama")
  const deskripsi = getString(formData, "deskripsi")

  if (!id || !nama || !deskripsi) {
    return
  }

  await db
    .update(items)
    .set({
      nama,
      deskripsi,
      updatedAt: new Date(),
    })
    .where(eq(items.id, id))

  revalidatePath("/dashboard/items")
}

export async function deleteItem(formData: FormData) {
  await requireRole(["admin"])

  const id = getNumber(formData, "id")

  if (!id) {
    return
  }

  await db.delete(items).where(eq(items.id, id))

  revalidatePath("/dashboard/items")
}
