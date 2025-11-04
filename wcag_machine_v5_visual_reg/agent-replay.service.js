#!/usr/bin/env node

/*
 * Agent 6: Replay & Remediation
 *
 * This worker closes the feedback loop by listening on queue:replay.  When a
 * site owner triggers a re-audit, the job payload must include the URL and
 * optionally the previous report.  We re-scan the page and, if the number of
 * violations falls below a configurable threshold, mint a badge and enqueue
 * it onto queue:badge for downstream processing.
 */

import { createWorker, createQueue } from './lib/queue.js';
import { prefixKey } from './lib/tenant.js';
import { scanUrl } from './lib/scan.js';
import { redis } from './lib/redis.js';
import { mintBadge } from './lib/badge.js';
import { saveBadge, saveScanReport } from './lib/db.js';

const replayQueueName = prefixKey('queue:replay');
const badgeQueueName = prefixKey('queue:badge');
const threshold = parseInt(process.env.VIOLATION_THRESHOLD || '5', 10);

const worker = createWorker(replayQueueName, async (job) => {
  const { url } = job.data;
  if (!url) throw new Error('Replay job missing url');
  // Re-scan the URL
  const report = await scanUrl(url);
  await saveScanReport(url, report);
  const violationCount = report.violations.length;
  // If the site meets the threshold, mint a badge
  if (violationCount <= threshold) {
    const badgeUrl = await mintBadge(url, report);
    // Persist the badge to DB
    await saveBadge(url, badgeUrl);
    // Enqueue a badge job for further actions (e.g. notify owner)
    const badgeQueue = createQueue(badgeQueueName);
    await badgeQueue.add('badge', { url, badgeUrl });
  }
  // Save the updated report in Redis
  await redis.set(prefixKey(`scan:${url}`), JSON.stringify(report));
  return { violations: violationCount };
}, 1);

worker.on('failed', (job, err) => {
  // eslint-disable-next-line no-console
  console.error(`Replay job ${job.id} failed:`, err.message);
});

await new Promise(() => {});