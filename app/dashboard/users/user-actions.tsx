"use client"

import * as React from "react"
import { Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updateUser, deleteUser } from "@/app/dashboard/users/actions"

interface UserActionsProps {
  user: {
    id: number
    name: string
    username: string
    roleId: number
    roleName: string
  }
  roleList: { id: number; name: string }[]
  isCurrentUser: boolean
}

export function UserActions({ user, roleList, isCurrentUser }: UserActionsProps) {
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
            Edit Data
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => setOpenDelete(true)}
            className="text-destructive focus:text-destructive"
            disabled={isCurrentUser}
          >
            <Trash2 className="mr-2 size-4" />
            Hapus User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User: {user.name}</DialogTitle>
            <DialogDescription>
              Perbarui informasi pengguna atau ganti hak akses.
            </DialogDescription>
          </DialogHeader>
          <form action={async (formData) => {
            await updateUser(formData)
            setOpenEdit(false)
          }}>
            <input type="hidden" name="id" value={user.id} />
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor={`edit-name-${user.id}`}>Nama Lengkap</Label>
                <Input
                  id={`edit-name-${user.id}`}
                  name="name"
                  defaultValue={user.name}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`edit-username-${user.id}`}>Username</Label>
                <Input
                  id={`edit-username-${user.id}`}
                  name="username"
                  defaultValue={user.username}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`edit-password-${user.id}`}>
                  Password Baru
                </Label>
                <Input
                  id={`edit-password-${user.id}`}
                  name="password"
                  type="password"
                  placeholder="Kosongkan jika tidak ganti"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`edit-roleId-${user.id}`}>
                  Role / Hak Akses
                </Label>
                <select
                  id={`edit-roleId-${user.id}`}
                  name="roleId"
                  defaultValue={user.roleId}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                >
                  {roleList.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">
                Update Data
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
              Apakah Anda yakin ingin menghapus user{" "}
              <span className="font-bold">{user.name}</span>? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <form action={async (formData) => {
              await deleteUser(formData)
              setOpenDelete(false)
            }} className="w-full flex gap-2">
              <input type="hidden" name="id" value={user.id} />
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
