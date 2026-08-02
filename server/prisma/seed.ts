/**
 * One-time bootstrap: promote an existing user to `role: admin`.
 *
 * Usage:
 *   npm run db:seed-admin -- someone@example.com
 *
 * Needed because /api/admin/createAccount now requires an existing admin's
 * JWT — this script is how the very first admin gets created.
 */
import { prisma } from "../src/config/prisma.ts";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npm run db:seed-admin -- <email>");
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: "admin" },
    select: { id: true, username: true, email: true, role: true },
  });

  console.log(`Promoted ${user.username} <${user.email}> to role: ${user.role}`);
}

main()
  .catch((error) => {
    console.error("[seed-admin] Failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
