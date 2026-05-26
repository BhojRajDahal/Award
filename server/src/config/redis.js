import { env } from './env.js';

let redisConnection = null;

export const getRedisConnection = () => {
  if (!env.REDIS_URL) return null;
  if (!redisConnection) {
    redisConnection = { connection: { url: env.REDIS_URL } };
  }
  return redisConnection;
};
