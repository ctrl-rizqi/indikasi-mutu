"use server"

import { hash } from "bcryptjs"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { roles, users } from "@/lib/db/schema"

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

export async function signup(prevState: any, formData: FormData) {
  const name = getString(formData, "name")
  const username = getString(formData, "username")
  const password = getString(formData, "password")

  if (!name || !username || !password) {
    return { error: "Semua field harus diisi." }
  }

  // Find "teknisi" role ID
  const [teknisiRole] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, "teknisi"))
    .limit(1)

  if (!teknisiRole) {
    return { error: "Role teknisi tidak ditemukan. Hubungi admin." }
  }

  // Check if username already exists
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1)

  if (existingUser) {
    return { error: "Username sudah digunakan." }
  }

  // Hash password
  const passwordHash = await hash(password, 10)

  // Insert user
  try {
    await db.insert(users).values({
      name,
      username,
      password: passwordHash,
      roleId: teknisiRole.id,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return { error: "Terjadi kesalahan saat pendaftaran." }
  }

  redirect("/login?signup=success")
}
