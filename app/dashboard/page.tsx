import Link from "next/link"

import { SignOutButton } from "@/components/auth/sign-out-button"
import { requireSession } from "@/lib/auth/guards"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ forbidden?: string }>
}) {
  const session = await requireSession()
  const params = await searchParams

  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 px-6 py-10">
      <header className="flex items-center justify-between rounded-xl border bg-card p-5">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Login sebagai <span className="font-medium">{session.user.name}</span> dengan role{" "}
            <span className="font-medium">{session.user.role}</span>
          </p>
        </div>
        <SignOutButton />
      </header>

      {params.forbidden ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          Anda tidak punya akses untuk halaman tersebut.
        </p>
      ) : null}

      <section className="rounded-xl border bg-card p-5">
        <h2 className="text-base font-semibold">Akses Berdasarkan Role</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {session.user.role === "admin" ? (
            <li>
              <Link href="/dashboard/users" className="text-primary underline-offset-2 hover:underline">
                Manajemen User
              </Link>
            </li>
          ) : null}
          <li>
            <Link href="/dashboard/admin" className="text-primary underline-offset-2 hover:underline">
              Halaman Admin
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/teknisi"
              className="text-primary underline-offset-2 hover:underline"
            >
              Halaman Teknisi
            </Link>
          </li>
        </ul>
      </section>
    </main>
  )
}
