import { Redis } from '@upstash/redis';

declare global {
  var __redis: Redis | undefined;
}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken && !globalThis.__redis) {
  globalThis.__redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });
}

const client = globalThis.__redis;

const redis = {
  async get<T = string>(key: string): Promise<T | null> {
    if (!client) return null;
    try {
      return await client.get<T>(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },
  async set(key: string, value: string, ttl?: number) {
    if (!client) return null;
    try {
      if (ttl) {
        return await client.set(key, value, { ex: ttl });
      }

      return await client.set(key, value);
    } catch (error) {
      console.error('Redis set error:', error);
      return null;
    }
  },
};

export default redis;
