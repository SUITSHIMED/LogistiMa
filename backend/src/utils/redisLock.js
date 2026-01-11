import redisClient from "../config/redis.js";
import crypto from "crypto";

export const acquireLock = async (key, ttl = 5000) => {
  const lockValue = crypto.randomUUID();

  const result = await redisClient.set(
    key,
    lockValue,
    {
      NX: true,
      PX: ttl
    }
  );

  if (!result) return null;

  return lockValue;
};

export const releaseLock = async (key, value) => {
  const storedValue = await redisClient.get(key);

  if (storedValue === value) {
    await redisClient.del(key);
  }
};
