import { redisClient } from "../config/redis.ts";

const cacheMiddleware = async (req, res, next) => {
  try {
    const cacheKey = `user:${req.params.id}`;

    // Check Redis cache first
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit for key:", cacheKey);
      return res.status(200).json({
        cached: true,
        data: JSON.parse(cachedData),
      });
    }
    console.log("Cache miss for key:", cacheKey);
    next();
  } catch (err) {
    console.error("Redis error in cache middleware:", err);
    next(); // Proceed without cache if Redis fails
  }
};
