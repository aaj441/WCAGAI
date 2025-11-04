#!/usr/bin/env node

/*
 * Agent 1: Keyword → URLs
 *
 * Given a search keyword, this script uses the SerpAPI client to fetch the top search results
 * and pushes the resulting URLs into a Redis list (`url_queue`).
 * The number of URLs returned and the list itself are emitted as JSON on stdout.
 */

import { redis } from './lib/redis.js';
import { getSerpUrls } from './lib/serp.js';
import { createQueue } from './lib/queue.js';
import { prefixKey } from './lib/tenant.js';

const keyword = process.argv[2];
if (!keyword) {
  console.error('❌ keyword needed');
  process.exit(1);
}

try {
  const urls = await getSerpUrls(keyword, 100);
  if (!Array.isArray(urls) || urls.length === 0) {
    console.error('❌ no URLs returned');
    process.exit(1);
  }
  // If USE_BULLMQ=true then push jobs onto a BullMQ queue.  Otherwise fall
  // back to a simple Redis list for backward compatibility.
  const useBull = process.env.USE_BULLMQ === 'true';
  const queueName = prefixKey('queue:scan');
  if (useBull) {
    const queue = createQueue(queueName);
    // Create a job for each URL; jobId includes tenant prefix to avoid duplication
    for (const url of urls) {
      const jobId = `${queueName}:${url}`;
      await queue.add('scan', { url }, { jobId });
    }
  } else {
    // Legacy Redis list; may lose messages on failure
    await redis.lpush(queueName, ...urls);
  }
  console.log(JSON.stringify({ ok: true, count: urls.length, urls }));
} catch (err) {
  console.error('❌ failed to fetch SERP results:', err);
  process.exit(1);
}