// Singleton Prisma client — import this everywhere instead of creating new instances
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import chalk from "chalk";
// may remove dotenv entirely as node 18+ supports .env files natively, but for now keeping it for compatibility with older versions of node and for clarity
dotenv.config();
// this file exports a named export as well as a default export for convenience, so you can import it like:
// import { prisma } from "./config/prisma.ts";
// or
// import prisma from "./config/prisma.ts";
const log = console.log;

if (!process.env.DATABASE_URL) {
  console.error(chalk.red("[Postgres] DATABASE_URL is not defined in environment variables"));
  process.exit(1);
}

// Prevent multiple instances during hot-reload in development
// part of singleton design pattern to avoid exhausting database connections
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * In Prisma v7, the datasource URL is no longer passed via the PrismaClient constructor.
 * Instead, a driver adapter must be provided. We use @prisma/adapter-pg (backed by pg.Pool).
 */
function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
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
