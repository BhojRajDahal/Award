import Redis from 'ioredis';
import { env } from '../config/env.js';

const redis = env.REDIS_URL ? new Redis(env.REDIS_URL, { maxRetriesPerRequest: 2 }) : null;

export const cacheKey = (...parts) => `nast:${parts.join(':')}`;

export const getCachedJson = async (key) => {
  if (!redis) return null;
  const raw = await redis.get(key);
  return raw ? JSON.parse(raw) : null;
};

export const setCachedJson = async (key, value, ttlSeconds = 60) => {
  if (!redis) return;
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
};

export const deleteCached = async (key) => {
  if (!redis) return;
  await redis.del(key);
};

export const redisClient = redis;
