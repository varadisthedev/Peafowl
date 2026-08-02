// Singleton Prisma client — import this everywhere instead of creating new instances
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import chalk from "chalk";
import { env } from "./env.ts";
// this file exports a named export as well as a default export for convenience, so you can import it like:
// import { prisma } from "./config/prisma.ts";
// or
// import prisma from "./config/prisma.ts";
const log = console.log;

// Prevent multiple instances during hot-reload in development
// part of singleton design pattern to avoid exhausting database connections
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * In Prisma v7, the datasource URL is no longer passed via the PrismaClient constructor.
 * Instead, a driver adapter must be provided. We use @prisma/adapter-pg (backed by pg.Pool).
 */
function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (!env.IS_PRODUCTION) {
  globalForPrisma.prisma = prisma;
}

/**
 * Call once at app startup to verify the DB connection is alive.
 * Exits on failure so docker restart policy kicks in.
 */
export const connectPrisma = async (): Promise<void> => {
  try {
    await prisma.$connect(); // $ means it's a special Prisma method, not a model
    log(chalk.green("[Postgres] Connected successfully via Prisma!"));
  } catch (error: unknown) {
    if (error instanceof Error) {
      log(chalk.red("[Postgres] Failed to connect:", error.message));
    } else {
      log(chalk.red("[Postgres] Failed to connect: Unknown error"));
    }
    process.exit(1);
  }
};

export default prisma;
