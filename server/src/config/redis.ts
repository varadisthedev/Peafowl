// redis connections are expensive, so we create a single shared instance
// that can be imported and used across the app
import Redis from "ioredis";
import chalk from "chalk";
import { env } from "./env.ts";

const log = console.log;

const redisClient = new Redis(env.REDIS_URL, {
  // If Redis is down, don't crash the app just log and move on
  lazyConnect: false, // connects to redis after 1st request only 


  // callback function by ioredis
  // ioredis increment times variable each time it tries to reconnect, so we can use that to limit retries
  // expects a number (ms to wait before next retry) or null to stop retrying
  retryStrategy(times) {
    if (times > 3) {
      log(chalk.red("Redis: max retries reached. Giving up."));
      return null; // stop retrying
    }
    return Math.min(times * 200, 2000); // wait 200ms, 400ms, 600ms...
  },

  // How long to wait for a command before timing out (ms)
  commandTimeout: 8000,
});

redisClient.on("connect", () => {
  log(chalk.green("[Redis] Connected successfully!"));
});

// below logging is imp in prodduction, it doesnt crash reddis but logs errors
// in short, they are event listeners
redisClient.on("error", (err) => {
  log(chalk.red("### Redis error:"), err.message);
});

redisClient.on("reconnecting", () => {
  log(chalk.yellow("### Redis reconnecting..."));
});

export { redisClient };
export default redisClient;
