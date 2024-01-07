import Redis from "ioredis";

import { ICacheProvider, ICacheSet } from "../ICacheProvider";

class RedisCacheProvider implements ICacheProvider {
  private redisClient = new Redis({
    host: process.env.REDIS_CACHE_HOST,
    port: Number(process.env.REDIS_CACHE_PORT),
    password: process.env.REDIS_CACHE_PASSWORD,
    username: process.env.REDIS_CACHE_USER,
  });

  async cacheSet({ key, value, expiresInSeconds }: ICacheSet): Promise<void> {
    await this.redisClient.set(key, value, "EX", expiresInSeconds);
  }

  async cacheGet(key: string): Promise<string | null> {
    const value = await this.redisClient.get(key);

    return value;
  }

  async cacheDel(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async cacheFlushAll(): Promise<void> {
    await this.redisClient.flushall();
  }

  async cacheMultipleSet(refreshTokens: ICacheSet[]): Promise<void> {
    const pipeline = this.redisClient.pipeline();

    refreshTokens.forEach((refreshToken) => {
      const { key, value, expiresInSeconds } = refreshToken;

      pipeline.set(key, value, "EX", expiresInSeconds);
    });

    await pipeline.exec();
  }

  async cacheDeleteAllByPrefix(prefix: string): Promise<void> {
    const keys = await this.redisClient.keys(`${prefix}*`);

    const pipeline = this.redisClient.pipeline();

    keys.forEach((key) => {
      pipeline.del(key);
    });

    await pipeline.exec();
  }

  async cacheGetAllByPrefix(prefix: string): Promise<string[]> {
    const keys = await this.redisClient.keys(`${prefix}*`);

    const pipeline = this.redisClient.pipeline();

    keys.forEach((key) => {
      pipeline.get(key);
    });

    const values = await pipeline.exec();

    const results: string[] = [];

    values?.forEach((value) => {
      if (value[1]) {
        results.push(value[1].toString());
      }
    });

    return results;
  }

  async cacheDeleteAllBySuffix(suffix: string): Promise<void> {
    const keys = await this.redisClient.keys(`*${suffix}`);

    const pipeline = this.redisClient.pipeline();

    keys.forEach((key) => {
      pipeline.del(key);
    });

    await pipeline.exec();
  }
}

export { RedisCacheProvider };
