import { RedisStore } from "rate-limit-redis";
import rateLimit from "express-rate-limit";

// reusing the same Redis client instance from our config
import { redisClient } from "../config/redis";
import chalk from "chalk";

const log = console.log;

const redisStore = new RedisStore({
  sendCommand: (...args: string[]) =>
    redisClient.call(...(args as [string, ...string[]])) as Promise<any>,
});
