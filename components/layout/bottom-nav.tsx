"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Home, LayoutDashboard, Settings, UserCircle, LogOut, ShieldCheck, Package, FilePieChart } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  if (!session?.user) return null

  const role = session.user.role

  const items = [
    {
      label: "Beranda",
      icon: Home,
      href: "/",
    },
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
  ]

  if (role === "admin") {
    items.push({
      label: "Items",
      icon: Package,
      href: "/dashboard/items",
    })
    items.push({
      label: "Laporan",
      icon: FilePieChart,
      href: "/dashboard/reports",
    })
    items.push({
      label: "Users",
      icon: UserCircle,
      href: "/dashboard/users",
    })
    items.push({
      label: "Admin",
      icon: ShieldCheck,
      href: "/dashboard/admin",
    })
  } else if (role === "teknisi") {
    items.push({
      label: "Teknisi",
      icon: Settings,
      href: "/dashboard/teknisi",
    })
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center justify-center">
      <nav className="flex items-center gap-1 rounded-full border bg-background/80 p-2 shadow-lg backdrop-blur-md">
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex h-11 w-11 flex-col items-center justify-center rounded-full transition-all duration-200 hover:bg-muted md:h-12 md:w-12",
                isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground"
              )}
            >
              <item.icon className="size-5" />
              <span className="absolute -top-12 left-1/2 -translate-x-1/2 scale-0 rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background transition-all group-hover:scale-100">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary-foreground" />
              )}
            </Link>
          )
        })}
        <div className="mx-1 h-6 w-px bg-border" />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="group relative flex h-11 w-11 flex-col items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground md:h-12 md:w-12"
        >
          <LogOut className="size-5" />
          <span className="absolute -top-12 left-1/2 -translate-x-1/2 scale-0 rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background transition-all group-hover:scale-100">
            Keluar
          </span>
        </button>
      </nav>
    </div>
  )
}
