import { compare } from "bcryptjs"
import { eq } from "drizzle-orm"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { db } from "@/lib/db"
import { roles, users } from "@/lib/db/schema"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (
          typeof credentials?.username !== "string" ||
          typeof credentials?.password !== "string" ||
          !credentials.username ||
          !credentials.password
        ) {
          return null
        }

        const [account] = await db
          .select({
            id: users.id,
            name: users.name,
            username: users.username,
            password: users.password,
            role: roles.name,
          })
          .from(users)
          .innerJoin(roles, eq(users.roleId, roles.id))
          .where(eq(users.username, credentials.username))
          .limit(1)

        if (!account) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, account.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: String(account.id),
          name: account.name,
          email: account.username,
          role: account.role,
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.role) {
        token.role = user.role
      }

      return token
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub ?? ""
        session.user.role = typeof token.role === "string" ? token.role : "teknisi"
      }

      return session
    },
  },
})
