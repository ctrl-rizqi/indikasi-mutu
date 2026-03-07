import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DataTableShellProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  children: React.ReactNode
}

export function DataTableShell({
  title,
  description,
  children,
  className,
  ...props
}: DataTableShellProps) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardHeader className="px-6">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {children}
      </CardContent>
    </Card>
  )
}
