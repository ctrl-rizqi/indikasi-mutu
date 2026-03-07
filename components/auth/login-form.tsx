"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    })

    setIsSubmitting(false)

    if (result?.error) {
      setError("Username atau password tidak valid")
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="w-full rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-bold leading-none tracking-tight">Login</h3>
        <p className="text-sm text-muted-foreground">
          Masuk untuk mengakses dashboard sistem indikator mutu.
        </p>
      </div>
      <form onSubmit={onSubmit}>
        <div className="space-y-4 p-6 pt-0">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Masukkan username"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-sm font-medium text-destructive">
              {error}
            </div>
          )}
        </div>
        <div className="flex items-center p-6 pt-0 flex-col space-y-4">
          <button
            type="submit"
            className="inline-flex h-9 w-full items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Memproses..." : "Masuk"}
          </button>
          
          <div className="text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
              Daftar di sini
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
