import Link from "next/link"
import { asc } from "drizzle-orm"
import { Plus, ArrowLeft } from "lucide-react"

import { createItem } from "@/app/dashboard/items/actions"
import { requireRole } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { items, type Item } from "@/lib/db/schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/dashboard/page-header"
import { DataTableShell } from "@/components/dashboard/data-table-shell"
import { ItemActions } from "./item-actions"

export default async function ItemsPage() {
  await requireRole(["admin"])

  let itemList: Item[] = []
  let migrationHint = ""

  try {
    itemList = await db
      .select({
        id: items.id,
        nama: items.nama,
        deskripsi: items.deskripsi,
        createdAt: items.createdAt,
        updatedAt: items.updatedAt,
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
      <PageHeader 
        title="Manajemen Item" 
        description="Kelola daftar item yang tersedia dalam sistem."
      >
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
                  <Textarea
                    id="deskripsi"
                    name="deskripsi"
                    placeholder="Ketikkan deskripsi item di sini..."
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
      </PageHeader>

      <DataTableShell 
        title="Daftar Item" 
        description={`Terdapat ${itemList.length} item yang terdaftar dalam sistem.`}
      >
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
      </DataTableShell>
    </main>
  )
}
