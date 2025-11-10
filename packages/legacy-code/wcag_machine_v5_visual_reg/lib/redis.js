import { Redis } from '@upstash/redis';

// Initialize a Redis client using Upstash REST URL and token.  
// These environment variables must be provided at runtime.  
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});