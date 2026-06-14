/**
 * Redis pub/sub client factory.
 *
 * ioredis requires a dedicated connection for SUBSCRIBE mode — a subscribed
 * client cannot run regular commands. We create a publisher/subscriber pair
 * via `duplicate()` so they share connection config but operate independently.
 */

import type Redis from "ioredis";
import redisClient from "../config/redis.ts";
import chalk from "chalk";

const log = console.log;

export interface RedisPubSubClients {
  publisher: Redis;
  subscriber: Redis;
}

let pubSubClients: RedisPubSubClients | null = null;

/**
 * Returns (or lazily creates) the shared publisher/subscriber pair.
 * Both are duplicates of the main redis client configured in config/redis.ts.
 */
export function getRedisPubSubClients(): RedisPubSubClients {
  if (!pubSubClients) {
    const publisher = redisClient.duplicate();
    const subscriber = redisClient.duplicate();

    publisher.on("error", (err) => {
      log(chalk.red("[Redis Pub] Publisher error:"), err.message);
    });

    subscriber.on("error", (err) => {
      log(chalk.red("[Redis Sub] Subscriber error:"), err.message);
    });

    pubSubClients = { publisher, subscriber };
    log(chalk.cyan("[Redis Pub/Sub] Publisher and subscriber clients ready"));
  }

  return pubSubClients;
}

/**
 * Gracefully disconnect pub/sub clients (e.g. on server shutdown).
 */
export async function disconnectRedisPubSub(): Promise<void> {
  if (!pubSubClients) return;

  await Promise.allSettled([
    pubSubClients.publisher.quit(),
    pubSubClients.subscriber.quit(),
  ]);

  pubSubClients = null;
  log(chalk.yellow("[Redis Pub/Sub] Clients disconnected"));
}
