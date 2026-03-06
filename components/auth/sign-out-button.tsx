"use client"

import { signOut } from "next-auth/react"

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
    >
      Keluar
    </button>
  )
}
