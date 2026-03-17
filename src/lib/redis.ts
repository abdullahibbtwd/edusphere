// import { Redis } from '@upstash/redis';

// declare global {
//   var __redis: Redis | undefined;
// }

// const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
// const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// if (redisUrl && redisToken && !globalThis.__redis) {
//   globalThis.__redis = new Redis({
//     url: redisUrl,
//     token: redisToken,
//   });
// }

// const client = globalThis.__redis;

// const redis = {
//   async get<T = string>(key: string): Promise<T | null> {
//     if (!client) return null;
//     try {
//       return await client.get<T>(key);
//     } catch (error) {
//       console.error('Redis get error:', error);
//       return null;
//     }
//   },
//   async set(key: string, value: string, ttl?: number) {
//     if (!client) return null;
//     try {
//       if (ttl) {
//         return await client.set(key, value, { ex: ttl });
//       }

//       return await client.set(key, value);
//     } catch (error) {
//       console.error('Redis set error:', error);
//       return null;
//     }
//   },
// };

// export default redis;
/**
 * Unified Redis client
 * - Production: Upstash (REST-based) via @upstash/redis
 * - Local:      ioredis connecting to Samurai / plain Redis on localhost
 *
 * Detection order:
 *   1. UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN  → Upstash
 *   2. REDIS_URL                                           → ioredis
 *   3. Neither                                             → no-op client (warns once)
 */

import { Redis as UpstashRedis } from '@upstash/redis';
import IORedis from 'ioredis';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RedisClient {
  get<T = string>(key: string): Promise<T | null>;
  set(key: string, value: string, ttl?: number): Promise<unknown>;
  del(key: string): Promise<unknown>;
}

// ─── Singleton helpers ────────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __redisClient: RedisClient | undefined;
}

// ─── Upstash adapter ──────────────────────────────────────────────────────────

function buildUpstashClient(url: string, token: string): RedisClient {
  const upstash = new UpstashRedis({ url, token });

  return {
    async get<T = string>(key: string): Promise<T | null> {
      try {
        return await upstash.get<T>(key);
      } catch (err) {
        console.error('[redis/upstash] get error:', err);
        return null;
      }
    },

    async set(key: string, value: string, ttl?: number) {
      try {
        return ttl
          ? await upstash.set(key, value, { ex: ttl })
          : await upstash.set(key, value);
      } catch (err) {
        console.error('[redis/upstash] set error:', err);
        return null;
      }
    },

    async del(key: string) {
      try {
        return await upstash.del(key);
      } catch (err) {
        console.error('[redis/upstash] del error:', err);
        return null;
      }
    },
  };
}

// ─── ioredis adapter (local / Samurai) ────────────────────────────────────────

function buildIORedisClient(redisUrl: string): RedisClient {
  // ioredis accepts "redis://host:port" or "redis://:password@host:port"
  const io = new IORedis(redisUrl, {
    lazyConnect: true,          // don't crash at import time if Redis is down
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 200, 2000),
  });

  io.on('error', (err) => console.error('[redis/ioredis] connection error:', err));

  return {
    async get<T = string>(key: string): Promise<T | null> {
      try {
        const raw = await io.get(key);
        if (raw === null) return null;

        // Try to parse JSON so the API matches Upstash behaviour
        try {
          return JSON.parse(raw) as T;
        } catch {
          return raw as unknown as T;
        }
      } catch (err) {
        console.error('[redis/ioredis] get error:', err);
        return null;
      }
    },

    async set(key: string, value: string, ttl?: number) {
      try {
        const seconds = ttl != null ? Math.floor(Number(ttl)) : 0;
        return seconds > 0
          ? await io.set(key, value, 'EX', seconds)
          : await io.set(key, value);
      } catch (err) {
        console.error('[redis/ioredis] set error:', err);
        return null;
      }
    },

    async del(key: string) {
      try {
        return await io.del(key);
      } catch (err) {
        console.error('[redis/ioredis] del error:', err);
        return null;
      }
    },
  };
}

// ─── No-op client ─────────────────────────────────────────────────────────────

function buildNoopClient(): RedisClient {
  let warned = false;
  const warn = () => {
    if (!warned) {
      console.warn(
        '[redis] No Redis configuration found. ' +
          'Set UPSTASH_REDIS_REST_URL+TOKEN for Upstash or REDIS_URL for local Redis.',
      );
      warned = true;
    }
  };

  return {
    async get() { warn(); return null; },
    async set() { warn(); return null; },
    async del() { warn(); return null; },
  };
}

// ─── Factory ──────────────────────────────────────────────────────────────────

function createClient(): RedisClient {
  const upstashUrl   = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const redisUrl     = process.env.REDIS_URL;

  if (upstashUrl && upstashToken) {
    console.info('[redis] Using Upstash REST client');
    return buildUpstashClient(upstashUrl, upstashToken);
  }

  if (redisUrl) {
    console.info('[redis] Using ioredis client →', redisUrl);
    return buildIORedisClient(redisUrl);
  }

  return buildNoopClient();
}

// ─── Singleton (survives Next.js HMR in dev) ─────────────────────────────────

if (!globalThis.__redisClient) {
  globalThis.__redisClient = createClient();
}

const redis = globalThis.__redisClient;

export default redis;