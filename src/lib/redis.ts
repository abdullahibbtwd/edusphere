import Redis from 'ioredis';

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

// Use a global variable so the connection survives HMR in dev.
// The `??=` assignment is synchronous, so there is no race between
// simultaneously-compiled routes.
globalThis.__redis ??= new Redis(process.env.REDIS_URL!, { lazyConnect: false });

globalThis.__redis.on('error', (err) => console.error('Redis error:', err));

// Only log on the first genuine connect, not on every reconnect
globalThis.__redis.once('connect', () => console.log('Redis connected ✓'));

const redis = globalThis.__redis;

export default redis;
