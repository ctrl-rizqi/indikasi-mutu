"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

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
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Login</h1>
        <p className="text-sm text-muted-foreground">Masuk untuk mengakses dashboard.</p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Username</span>
        <input
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Password</span>
        <input
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Memproses..." : "Masuk"}
      </button>
    </form>
  )
}
