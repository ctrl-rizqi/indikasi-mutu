import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { Plus, ArrowLeft, Check, X, Calendar } from "lucide-react";

import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { activities, items } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createActivity } from "./actions";
import { ActivityActions } from "./activity-actions";

export default async function TeknisiPage() {
  const session = await requireRole(["teknisi", "admin"]);
  const userId = Number(session.user.id);
  const isAdmin = session.user.role === "admin";

  // Fetch items for the selection
  const itemList = await db.query.items.findMany({
    orderBy: [asc(items.nama)],
  });

  // Fetch activities
  // If admin, show all. If teknisi, show only theirs.
  const activityList = await db.query.activities.findMany({
    where: isAdmin ? undefined : eq(activities.userId, userId),
    with: {
      item: true,
      user: true,
    },
    orderBy: [desc(activities.createdAt)],
  });

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Area Teknisi</h1>
          <p className="text-muted-foreground">
            Kelola aktivitas pengecekan item harian Anda.
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
                Catat Aktivitas
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
              <DialogHeader>
                <DialogTitle>Catat Aktivitas Baru</DialogTitle>
                <DialogDescription>
                  Pilih item dan lakukan pengecekan indikator.
                </DialogDescription>
              </DialogHeader>
              <form action={createActivity}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="itemId">Pilih Item</Label>
                    <select
                      id="itemId"
                      name="itemId"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      required
                    >
                      <option value="" disabled selected>
                        Pilih item...
                      </option>
                      {itemList.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <input
                      type="checkbox"
                      id="check1"
                      name="check1"
                      className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="check1" className="cursor-pointer">
                      Indikator 1 (Checklist 1)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <input
                      type="checkbox"
                      id="check2"
                      name="check2"
                      className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="check2" className="cursor-pointer">
                      Indikator 2 (Checklist 2)
                    </Label>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="keterangan">Keterangan Tambahan</Label>
                    <Textarea
                      id="keterangan"
                      name="keterangan"
                      placeholder="Catatan tambahan hasil pengecekan..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full">
                    Selesai & Simpan
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="px-6">
          <CardTitle>Riwayat Aktivitas</CardTitle>
          <CardDescription>
            {isAdmin
              ? `Menampilkan semua riwayat aktivitas (${activityList.length} total).`
              : `Menampilkan riwayat aktivitas Anda (${activityList.length} total).`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40 pl-6">Tanggal</TableHead>
                {isAdmin && <TableHead>Teknisi</TableHead>}
                <TableHead>Item</TableHead>
                <TableHead className="text-center">Indikator 1</TableHead>
                <TableHead className="text-center">Indikator 2</TableHead>
                <TableHead className="text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 6 : 5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Belum ada riwayat aktivitas.
                  </TableCell>
                </TableRow>
              ) : (
                activityList.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="pl-6 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="mr-1 size-3" />
                        {activity.createdAt.toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="font-medium text-xs">
                        {activity.user.name}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {activity.item.nama}
                        </span>
                        {activity.keterangan && (
                          <span className="text-[10px] text-muted-foreground line-clamp-1">
                            {activity.keterangan}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {activity.check1 ? (
                        <Badge
                          variant="default"
                          className="bg-emerald-500 hover:bg-emerald-600"
                        >
                          <Check className="size-3" />
                        </Badge>
                      ) : (
                        <Badge
                          variant="destructive"
                          className="bg-rose-500 hover:bg-rose-600"
                        >
                          <X className="size-3" />
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {activity.check2 ? (
                        <Badge
                          variant="default"
                          className="bg-emerald-500 hover:bg-emerald-600"
                        >
                          <Check className="size-3" />
                        </Badge>
                      ) : (
                        <Badge
                          variant="destructive"
                          className="bg-rose-500 hover:bg-rose-600"
                        >
                          <X className="size-3" />
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <ActivityActions
                        activity={activity}
                        itemList={itemList}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
