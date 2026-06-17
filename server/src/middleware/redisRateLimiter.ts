import { redisClient } from "../config/redis.ts";
import type { Request, Response, NextFunction } from "express";

interface Options {
  windowMs: number;
  max: number;
  keyPrefix?: string;
  keyGenerator?: (req: Request) => string;
}

export default function slidingWindowRateLimiter(opts: Options) {
  const { windowMs, max, keyPrefix = "rl:", keyGenerator = (req) => req.ip } = opts;

  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const key = `${keyPrefix}${keyGenerator(req)}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Pipeline: remove old entries, add this request, get count, set expiry
      const member = `${now}-${Math.random().toString(36).slice(2)}`;
      const p = redisClient.pipeline();
      p.zremrangebyscore(key, 0, windowStart);
      p.zadd(key, now, member);
      p.zcard(key);
      p.expire(key, Math.ceil(windowMs / 1000) + 1);
      const [, , countReply] = await p.exec();
      const current = typeof countReply === "object" && "ok" in countReply ? Number(countReply[1]) : Number(countReply);

      const remaining = Math.max(0, max - current);
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(remaining));

      if (current > max) {
        const retryAfter = Math.ceil(windowMs / 1000);
        res.setHeader("Retry-After", String(retryAfter));
        return res.status(429).json({ message: "Too many requests. Try again later." });
      }

      return next();
    } catch (err) {
      // On Redis errors, allow traffic (fail-open) but log
      console.error("Rate limiter error:", err);
      return next();
    }
  };
}