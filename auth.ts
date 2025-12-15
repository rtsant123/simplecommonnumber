import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      if (token.name && session.user) {
        session.user.name = token.name;
      }

      if (token.email && session.user) {
        session.user.email = token.email;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      try {
        const existingUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            role: true,
            name: true,
            email: true,
          },
        });

        if (!existingUser) return token;

        token.role = existingUser.role;
        token.name = existingUser.name;
        token.email = existingUser.email;
      } catch (error) {
        console.error("JWT callback error:", error);
      }

      return token;
    },
  },
  ...authConfig,
});
