import pg from "pg";

declare global {
  var __garciPool__: pg.Pool | undefined;
}

export enum UserRole {
  ADMIN = "ADMIN"
}

export const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

export const getDbPool = (): pg.Pool => {
  if (!hasDatabaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!globalThis.__garciPool__) {
    globalThis.__garciPool__ = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
    });
  }

  return globalThis.__garciPool__;
};
