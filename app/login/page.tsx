import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage() {
  const session = await auth()

  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-md items-center px-6">
      <LoginForm />
    </main>
  )
}
