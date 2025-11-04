import { Queue, Worker } from 'bullmq';

/**
 * Helper to create a BullMQ queue.  BullMQ expects a Redis connection which
 * defaults to localhost:6379.  You can configure host/port/password via
 * REDIS_HOST, REDIS_PORT and REDIS_PASSWORD.  For Upstash or other managed
 * providers you may need to provide an ioredis-compatible client; see
 * the README for details.
 *
 * Namespaced queues (t:<tenantId>:queue:<name>) should be passed in after
 * calling prefixKey() from lib/tenant.js.
 */
const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

export function createQueue(name) {
  return new Queue(name, { connection: redisConfig });
}

export function createWorker(name, processor, concurrency = 1) {
  return new Worker(name, processor, { connection: redisConfig, concurrency });
}

export { Queue, Worker };