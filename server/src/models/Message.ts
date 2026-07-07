/**
 * Message model — Prisma edition.
 *
 * Replaces the Mongoose model. Re-exports the prisma client and generated
 * Message type so existing import paths continue to work.
 */
export { prisma as default } from "../config/prisma.ts";
export type { Message } from "../generated/prisma/client.ts";
