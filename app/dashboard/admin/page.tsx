import { requireRole } from "@/lib/auth/guards"

export default async function AdminPage() {
  const session = await requireRole(["admin"])

  return (
    <main className="mx-auto w-full max-w-3xl space-y-2 px-6 py-10">
      <h1 className="text-xl font-semibold">Area Admin</h1>
      <p className="text-sm text-muted-foreground">
        Halo {session.user.name}, Anda memiliki akses admin.
      </p>
    </main>
  )
}
