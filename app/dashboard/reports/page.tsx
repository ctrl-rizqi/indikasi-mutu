import Link from "next/link"
import { desc, and, gte, lte } from "drizzle-orm"
import { ArrowLeft, FileText, CheckCircle2, ListFilter, TrendingUp } from "lucide-react"

import { requireRole } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { activities } from "@/lib/db/schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/dashboard/page-header"
import { DataTableShell } from "@/components/dashboard/data-table-shell"
import { StatCard } from "@/components/dashboard/stat-card"

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  await requireRole(["admin"])
  const params = await searchParams

  const fromDate = params.from ? new Date(params.from) : new Date(new Date().setDate(new Date().getDate() - 30))
  const toDate = params.to ? new Date(params.to) : new Date()
  
  toDate.setHours(23, 59, 59, 999)
  fromDate.setHours(0, 0, 0, 0)

  const activityList = await db.query.activities.findMany({
    where: and(
      gte(activities.createdAt, fromDate),
      lte(activities.createdAt, toDate)
    ),
    with: {
      item: true,
      user: true,
    },
    orderBy: [desc(activities.createdAt)],
  })

  const enumerator = activityList.length
  const denumerator = activityList.filter(a => a.check1 && a.check2).length
  const capaian = denumerator > 0 ? (enumerator / denumerator) * 100 : 0
  
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10 pb-20">
      <PageHeader
        title="Laporan Capaian"
        description="Rekapitulasi indikator mutu berdasarkan periode waktu."
      >
        <Button variant="outline" asChild size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 size-4" />
            Kembali
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListFilter className="size-5" />
            Filter Periode
          </CardTitle>
          <CardDescription>
            Tentukan rentang tanggal laporan yang ingin ditampilkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="grid gap-2">
              <label htmlFor="from" className="text-sm font-medium">Dari Tanggal</label>
              <input
                type="date"
                id="from"
                name="from"
                defaultValue={fromDate.toISOString().split('T')[0]}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="to" className="text-sm font-medium">Sampai Tanggal</label>
              <input
                type="date"
                id="to"
                name="to"
                defaultValue={toDate.toISOString().split('T')[0]}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Button type="submit">Terapkan Filter</Button>
            <Button variant="ghost" asChild>
              <Link href="/dashboard/reports">Reset</Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Enumerator (Total)"
          value={enumerator}
          description="Total seluruh aktivitas pengecekan"
          icon={FileText}
        />
        <StatCard
          title="Denumerator (Sesuai)"
          value={denumerator}
          description="Aktivitas dengan kedua indikator True"
          icon={CheckCircle2}
        />
        <StatCard
          title="Capaian"
          value={`${capaian.toFixed(2)}%`}
          description="(Enumerator / Denumerator) * 100"
          icon={TrendingUp}
          className="bg-primary/5 border-primary/20"
        />
      </div>

      <DataTableShell
        title="Rincian Aktivitas"
        description={`Menampilkan ${activityList.length} data dalam periode terpilih.`}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40 pl-6">Tanggal</TableHead>
              <TableHead>Teknisi</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-center">C1</TableHead>
              <TableHead className="text-center">C2</TableHead>
              <TableHead className="text-right pr-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activityList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Tidak ada data untuk periode ini.
                </TableCell>
              </TableRow>
            ) : (
              activityList.map((activity) => {
                const isSuccess = activity.check1 && activity.check2
                return (
                  <TableRow key={activity.id}>
                    <TableCell className="pl-6 text-xs text-muted-foreground">
                      {activity.createdAt.toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="font-medium text-xs">
                      {activity.user.name}
                    </TableCell>
                    <TableCell className="text-xs">
                      {activity.item.nama}
                    </TableCell>
                    <TableCell className="text-center">
                      {activity.check1 ? <span className="text-emerald-600">✓</span> : <span className="text-rose-600">✗</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {activity.check2 ? <span className="text-emerald-600">✓</span> : <span className="text-rose-600">✗</span>}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge variant={isSuccess ? "default" : "secondary"} className={isSuccess ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                        {isSuccess ? "Sesuai" : "Tidak Sesuai"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </DataTableShell>
    </main>
  )
}
