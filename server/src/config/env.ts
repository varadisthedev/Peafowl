// Single source of truth for environment variables.
// Every other file should `import { env } from "./config/env.ts"` (or a relative
// path to it) instead of touching `process.env` directly, so that .env parsing,
// defaulting and validation only happens once, in one place.
import dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();

const log = console.log;

// ─── Required — the app cannot function without these ───────────────────────
const required = ["DATABASE_URL", "JWT_SECRET", "CLIENT_URL", "RESEND_API_KEY"] as const;

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(chalk.red(`[env] Missing required environment variables: ${missing.join(", ")}`));
  process.exit(1);
}

if (process.env.CLIENT_URL!.endsWith("/")) {
  throw new Error("add CLIENT_URL in env without the trailing slash");
}

// ─── Optional — fall back to sane defaults ───────────────────────────────────
let nodeEnv = process.env.NODE_ENV;
if (!nodeEnv) {
  log(chalk.yellow("[env] NODE_ENV not set, defaulting to 'development'"));
  nodeEnv = "development";
}

let redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  log(chalk.yellow("[env] REDIS_URL not set, defaulting to 'redis://localhost:6379'"));
  redisUrl = "redis://localhost:6379";
}

export const env = Object.freeze({
  NODE_ENV: nodeEnv,
  IS_PRODUCTION: nodeEnv === "production",
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  CLIENT_URL: process.env.CLIENT_URL!,
  REDIS_URL: redisUrl,
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
});
