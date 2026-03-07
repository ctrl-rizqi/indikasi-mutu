"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signup, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Daftar Akun</CardTitle>
          <CardDescription>
            Buat akun baru untuk mengakses sistem sebagai Teknisi.
          </CardDescription>
        </CardHeader>
        <form action={action}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                name="name"
                placeholder="Contoh: John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="johndoe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            {state?.error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {state.error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Mendaftarkan..." : "Daftar Sekarang"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Login di sini
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
