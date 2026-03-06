import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { Plus, ArrowLeft } from "lucide-react";

import { createUser } from "@/app/dashboard/users/actions";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { roles, users } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserActions } from "./user-actions";

export default async function UsersManagementPage() {
  const session = await requireRole(["admin"]);

  const [roleList, userList] = await Promise.all([
    db
      .select({ id: roles.id, name: roles.name })
      .from(roles)
      .orderBy(asc(roles.id)),
    db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        roleId: users.roleId,
        roleName: roles.name,
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .orderBy(asc(users.id)),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen User</h1>
          <p className="text-muted-foreground">
            Kelola data pengguna sistem dan hak akses mereka.
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
                Tambah User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
              <DialogHeader>
                <DialogTitle>Tambah User Baru</DialogTitle>
                <DialogDescription>
                  Lengkapi data di bawah ini untuk menambahkan pengguna baru ke
                  sistem.
                </DialogDescription>
              </DialogHeader>
              <form action={createUser}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Contoh: John Doe"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="johndoe"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="roleId">Role / Hak Akses</Label>
                    <select
                      id="roleId"
                      name="roleId"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      required>
                      <option defaultValue="" disabled>
                        Pilih role...
                      </option>
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
                    Simpan User
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="px-6">
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>
            Terdapat {userList.length} pengguna terdaftar dalam sistem.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-25 pl-6">ID</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userList.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs pl-6">
                    #{user.id}
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.username}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.roleName === "admin" ? "default" : "secondary"
                      }
                      className="capitalize">
                      {user.roleName}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <UserActions
                      user={user}
                      roleList={roleList}
                      isCurrentUser={Number(session.user.id) === user.id}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
