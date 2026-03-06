import Link from "next/link"
import { asc } from "drizzle-orm"
import { Plus, ArrowLeft } from "lucide-react"

import { createItem } from "@/app/dashboard/items/actions"
import { requireRole } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { items } from "@/lib/db/schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ItemActions } from "./item-actions"

export default async function ItemsPage() {
  await requireRole(["admin"])

  let itemList: Array<{ id: number; nama: string; deskripsi: string }> = []
  let migrationHint = ""

  try {
    itemList = await db
      .select({
        id: items.id,
        nama: items.nama,
        deskripsi: items.deskripsi,
      })
      .from(items)
      .orderBy(asc(items.id))
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "42P01"
    ) {
      migrationHint =
        "Tabel items belum ada di database aktif. Jalankan pnpm db:migrate, lalu refresh halaman ini."
    } else {
      throw error
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Item</h1>
          <p className="text-muted-foreground">
            Kelola daftar item yang tersedia dalam sistem.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 size-4" />
              Kembali
            </Link>
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                Tambah Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Tambah Item Baru</DialogTitle>
                <DialogDescription>
                  Lengkapi data di bawah ini untuk menambahkan item baru.
                </DialogDescription>
              </DialogHeader>
              <form action={createItem}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nama">Nama Item</Label>
                    <Input
                      id="nama"
                      name="nama"
                      placeholder="Contoh: Item A"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deskripsi">Deskripsi</Label>
                    <textarea
                      id="deskripsi"
                      name="deskripsi"
                      placeholder="Ketikkan deskripsi item di sini..."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      rows={3}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full">
                    Simpan Item
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="px-6">
          <CardTitle>Daftar Item</CardTitle>
          <CardDescription>
            Terdapat {itemList.length} item yang terdaftar dalam sistem.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {migrationHint ? (
            <div className="mx-6 mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {migrationHint}
            </div>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20 pl-6">ID</TableHead>
                <TableHead>Nama Item</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Belum ada data item.
                  </TableCell>
                </TableRow>
              ) : (
                itemList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs pl-6">
                      #{item.id}
                    </TableCell>
                    <TableCell className="font-medium">{item.nama}</TableCell>
                    <TableCell className="max-w-md truncate text-muted-foreground">
                      {item.deskripsi}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <ItemActions item={item} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
}
