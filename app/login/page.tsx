import { redirect } from "next/navigation"
import { Activity } from "lucide-react"

import { auth } from "@/auth"
import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage() {
  const session = await auth()

  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity className="size-4" />
          </div>
          Indikator Mutu RS
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
