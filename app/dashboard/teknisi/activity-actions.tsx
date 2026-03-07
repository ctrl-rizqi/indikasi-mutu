"use client";

import * as React from "react";
import { Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateActivity, deleteActivity } from "./actions";
import { type Activity, type Item } from "@/lib/db/schema";

interface ActivityActionsProps {
  activity: Activity & { item: Item };
  itemList: Item[];
}

export function ActivityActions({ activity, itemList }: ActivityActionsProps) {
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={() => setOpenEdit(true)}>
            <Pencil className="mr-2 size-4" />
            Edit Aktivitas
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => setOpenDelete(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 size-4" />
            Hapus Aktivitas
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Edit Aktivitas</DialogTitle>
            <DialogDescription>
              Perbarui data aktivitas teknisi di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <form
            action={async (formData) => {
              await updateActivity(formData);
              setOpenEdit(false);
            }}
          >
            <input type="hidden" name="id" value={activity.id} />
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor={`edit-item-${activity.id}`}>Item</Label>
                <select
                  id={`edit-item-${activity.id}`}
                  name="itemId"
                  defaultValue={activity.itemId}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                >
                  {itemList.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                      defaultValue={activity.itemId}
                    >
                      {item.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`edit-check1-${activity.id}`}
                  name="check1"
                  defaultChecked={activity.check1}
                  className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor={`edit-check1-${activity.id}`}>
                  Indikator 1 (Checklist 1)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`edit-check2-${activity.id}`}
                  name="check2"
                  defaultChecked={activity.check2}
                  className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor={`edit-check2-${activity.id}`}>
                  Indikator 2 (Checklist 2)
                </Label>
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`edit-keterangan-${activity.id}`}>
                  Keterangan
                </Label>
                <Textarea
                  id={`edit-keterangan-${activity.id}`}
                  name="keterangan"
                  defaultValue={activity.keterangan || ""}
                  placeholder="Ketikkan keterangan jika diperlukan..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus aktivitas ini? Tindakan ini
              tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <form
              action={async (formData) => {
                await deleteActivity(formData);
                setOpenDelete(false);
              }}
              className="w-full flex gap-2"
            >
              <input type="hidden" name="id" value={activity.id} />
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpenDelete(false)}
              >
                Batal
              </Button>
              <Button type="submit" variant="destructive" className="flex-1">
                Ya, Hapus
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
