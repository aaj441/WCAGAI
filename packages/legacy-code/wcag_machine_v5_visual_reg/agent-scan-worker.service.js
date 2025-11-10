#!/usr/bin/env node

/*
 * Agent 2b: Scan Worker
 *
 * This worker subscribes to the tenant-specific queue:scan and runs axe-core
 * scans for each URL.  Results are persisted in Redis and optionally in
 * a relational database via lib/db.js.  It demonstrates how to use BullMQ
 * for reliable job processing with concurrency control.
 */

import { createWorker, createQueue } from './lib/queue.js';
import { prefixKey } from './lib/tenant.js';
import { scanUrl } from './lib/scan.js';
import { redis } from './lib/redis.js';
import { saveScanReport } from './lib/db.js';

const queueName = prefixKey('queue:scan');

// When a job arrives, run axe-core and save the result
const worker = createWorker(queueName, async (job) => {
  const { url } = job.data;
  if (!url) throw new Error('Job missing url');
  const report = await scanUrl(url);
  // Persist to Redis for quick retrieval
  await redis.set(prefixKey(`scan:${url}`), JSON.stringify(report));
  // Persist to database for analytics
  await saveScanReport(url, report);
  return { violations: report.violations.length };
}, 2);

// Handle errors gracefully
worker.on('failed', (job, err) => {
  // eslint-disable-next-line no-console
  console.error(`Scan job ${job.id} failed:`, err.message);
});

// Keep process alive
// eslint-disable-next-line no-empty
await new Promise(() => {});