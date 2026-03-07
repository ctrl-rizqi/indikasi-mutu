"use client"

import * as React from "react"
import { Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type Item } from "@/lib/db/schema"
import { updateItem, deleteItem } from "@/app/dashboard/items/actions"

interface ItemActionsProps {
  item: Item
}

export function ItemActions({ item }: ItemActionsProps) {
  const [openEdit, setOpenEdit] = React.useState(false)
  const [openDelete, setOpenDelete] = React.useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onSelect={() => setOpenEdit(true)}>
            <Pencil className="mr-2 size-4" />
            Edit Item
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => setOpenDelete(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 size-4" />
            Hapus Item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Perbarui informasi item di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <form action={async (formData) => {
            await updateItem(formData)
            setOpenEdit(false)
          }}>
            <input type="hidden" name="id" value={item.id} />
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor={`edit-nama-${item.id}`}>Nama Item</Label>
                <Input
                  id={`edit-nama-${item.id}`}
                  name="nama"
                  defaultValue={item.nama}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`edit-deskripsi-${item.id}`}>Deskripsi</Label>
                <Textarea
                  id={`edit-deskripsi-${item.id}`}
                  name="deskripsi"
                  defaultValue={item.deskripsi}
                  rows={3}
                  required
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
              Apakah Anda yakin ingin menghapus item{" "}
              <span className="font-bold">{item.nama}</span>? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <form action={async (formData) => {
              await deleteItem(formData)
              setOpenDelete(false)
            }} className="w-full flex gap-2">
              <input type="hidden" name="id" value={item.id} />
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpenDelete(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="destructive"
                className="flex-1"
              >
                Ya, Hapus
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
