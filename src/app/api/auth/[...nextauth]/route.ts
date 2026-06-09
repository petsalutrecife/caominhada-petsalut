import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const institution = await prisma.institution.findUnique({
          where: { email: credentials.email },
        });
        if (!institution) return null;
        const isValid = await compare(credentials.password, institution.passwordHash);
        if (!isValid) return null;
        // Return user object
        return { id: institution.id, email: institution.email, role: "institution" };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      // Attach role to session
      if (token?.role) {
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.role = (user as any).role;
      }
      return token;
    },
  },
};

export const GET = NextAuth(authOptions).handlers.get;
export const POST = NextAuth(authOptions).handlers.post;
