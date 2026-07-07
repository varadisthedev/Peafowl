/**
 * User model — Prisma edition.
 *
 * The Mongoose model is gone. This file re-exports the Prisma client and
 * the generated User type so existing import paths (`../models/User.ts`)
 * continue to work without touching every file that imports from here.
 */
export { prisma as default } from "../config/prisma.ts";
export type { User } from "../generated/prisma/client.ts";
