import Redis from "ioredis";

import { cacheOptions } from "@config/cache";

import { ICacheSet } from "@shared/container/providers/CacheProvider/ICacheProvider";

const redisRateLimiterClient = new Redis(
  cacheOptions[process.env.NODE_ENV || "prod"],
);

async function redisRateLimiterSet({
  key,
  value,
  expiresInSeconds,
}: ICacheSet) {
  return await redisRateLimiterClient.set(key, value, "EX", expiresInSeconds);
}

async function redisRateLimiterGet(key: string) {
  return await redisRateLimiterClient.get(key);
}

export { redisRateLimiterSet, redisRateLimiterGet, redisRateLimiterClient };
