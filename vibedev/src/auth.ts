import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // 🔐 CRITICAL FOR VERCEL EDGE RUNTIME
  trustHost: true,
  
  // 📦 Put the database adapter directly here so it ONLY loads on Node.js API routes, 
  // keeping it completely out of your Edge Middleware execution paths!
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  ...authConfig,
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});