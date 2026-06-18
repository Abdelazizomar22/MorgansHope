import { Redis } from '@upstash/redis';
import { env } from '../../config/env';

let redis: Redis | null = null;

export function isRedisConfigured() {
  return Boolean(env.upstashRedisUrl && env.upstashRedisToken);
}

export function getRedis() {
  if (!isRedisConfigured()) return null;
  if (!redis) {
    redis = new Redis({
      url: env.upstashRedisUrl,
      token: env.upstashRedisToken,
      automaticDeserialization: true,
    });
  }
  return redis;
}

export async function cached<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
  const store = getRedis();
  if (!store) return loader();

  const existing = await store.get<T>(key);
  if (existing !== null && existing !== undefined) return existing;

  const value = await loader();
  await store.set(key, value, { ex: ttlSeconds });
  return value;
}

export async function invalidateCache(...keys: string[]) {
  const store = getRedis();
  if (store && keys.length) await store.del(...keys);
}
