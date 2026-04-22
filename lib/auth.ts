import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { isSuperAdminEmail } from "@/lib/admin";

const providers = [];

// Conditionally add Google provider only when env vars are present
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const Google = require("next-auth/providers/google").default;
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

providers.push(
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = await db.user.findUnique({
        where: { email: credentials.email as string },
      });

      if (!user || !user.password) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password as string,
        user.password,
      );

      if (!isPasswordValid) {
        return null;
      }

      if (user.status === "BANNED") {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      };
    },
  }),
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async signIn({ user }) {
      const email = user?.email ?? null;
      if (!email) return true;

      // Super-admin bootstrap: always keep this email as ADMIN and never banned.
      if (isSuperAdminEmail(email)) {
        await db.user.updateMany({
          where: { email },
          data: { role: "ADMIN", status: "ACTIVE" },
        });
      }

      // Block banned users (covers OAuth path which skips authorize()).
      const dbUser = await db.user.findUnique({
        where: { email },
        select: { status: true },
      });
      if (dbUser?.status === "BANNED") return false;

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const dbUser = await db.user.findUnique({
          where: { id: user.id as string },
          select: { role: true, email: true },
        });
        token.role = dbUser?.role ?? "BUYER";
        token.email = dbUser?.email ?? user.email ?? null;

        if (isSuperAdminEmail(token.email as string | null)) {
          token.role = "ADMIN";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = (token.email as string | null) ?? session.user.email;
      }
      return session;
    },
  },
});
