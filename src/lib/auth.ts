import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user?.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          bankName: user.bankName,
          accountNumber: user.accountNumber,
          accountHolder: user.accountHolder,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // FORCE CLEAR image and picture from token to prevent 494 REQUEST_HEADER_TOO_LARGE
      // Vercel has a hard limit on cookie size, and base64 images will crash the app.
      if (token.image) delete token.image;
      if (token.picture) delete token.picture;

      if (user) {
        const u = user as any;
        token.role = u.role;
        token.id = u.id;
        token.bankName = u.bankName;
        token.accountNumber = u.accountNumber;
        token.accountHolder = u.accountHolder;
      }
      if (trigger === "update" && session) {
        token.name = session.name;
        token.bankName = session.bankName;
        token.accountNumber = session.accountNumber;
        token.accountHolder = session.accountHolder;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        const u = session.user as any;
        u.bankName = token.bankName as string;
        u.accountNumber = token.accountNumber as string;
        u.accountHolder = token.accountHolder as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "supersecret",
};
