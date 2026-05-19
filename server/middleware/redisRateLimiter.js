import { RedisStore } from "rate-limit-redis";
import rateLimit from "express-rate-limit";

// reusing the same Redis client instance from our config
import { redisClient } from "../config/redis.js";
import chalk from "chalk";

const log = console.log;

const redisStore = new RedisStore({
  sendCommand: (...args) => redisClient.call(...args),
});
