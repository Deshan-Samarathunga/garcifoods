import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  var __garciPrisma__: PrismaClient | undefined;
}

const createPrismaClient = () => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

export const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

export const getPrismaClient = () => {
  if (!hasDatabaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!globalThis.__garciPrisma__) {
    globalThis.__garciPrisma__ = createPrismaClient();
  }

  return globalThis.__garciPrisma__;
};
