import { redirect } from "next/navigation"

import { auth } from "@/auth"

export async function requireSession() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return session
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireSession()

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/dashboard?forbidden=1")
  }

  return session
}
