import { compare } from "bcryptjs";
import { UserRole } from "@prisma/client";
import { getServerSession, type NextAuthOptions, type Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { redirect } from "next/navigation";

import { env } from "@/lib/env";
import { getPrismaClient, hasDatabaseUrl } from "@/lib/db";
import { hasAdminRole } from "@/lib/auth-guards";
import { verifyTurnstileToken } from "@/lib/services/turnstile";
import { adminLoginSchema } from "@/lib/validations/auth";

export const authOptions: NextAuthOptions = {
  secret: env.nextAuthSecret,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        turnstileToken: { label: "Turnstile Token", type: "text" },
      },
      authorize: async (credentials) => {
        const parsed = adminLoginSchema.safeParse(credentials);

        if (!parsed.success || !hasDatabaseUrl) {
          return null;
        }

        const turnstile = await verifyTurnstileToken(parsed.data.turnstileToken);

        if (!turnstile.success) {
          return null;
        }

        const prisma = getPrismaClient();
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });

        if (!user || user.role !== UserRole.ADMIN) {
          return null;
        }

        const passwordMatches = await compare(parsed.data.password, user.passwordHash);

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as UserRole | undefined) ?? UserRole.ADMIN;
      }

      return session;
    },
  },
};

export const getAuthSession = async () => {
  return getServerSession(authOptions);
};

export const requireAdminPageSession = async (): Promise<Session> => {
  const session = await getAuthSession();

  if (!session || !hasAdminRole(session)) {
    redirect("/admin/login");
  }

  return session as Session;
};

export const requireAdminApiSession = async () => {
  const session = await getAuthSession();

  if (!hasAdminRole(session)) {
    return null;
  }

  return session;
};
