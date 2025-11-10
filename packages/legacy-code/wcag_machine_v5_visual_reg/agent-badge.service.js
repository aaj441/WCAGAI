#!/usr/bin/env node

/*
 * Agent 7: Badge Dispatcher
 *
 * Listens on queue:badge and performs any follow-up tasks when a badge is
 * minted.  For instance, this could send an email to the site owner with the
 * badge, publish it to a CDN or update a CRM record.  Here we simply log
 * the badge URL to stdout.
 */

import { createWorker } from './lib/queue.js';
import { prefixKey } from './lib/tenant.js';

const badgeQueueName = prefixKey('queue:badge');

const worker = createWorker(badgeQueueName, async (job) => {
  const { url, badgeUrl } = job.data;
  if (!url || !badgeUrl) throw new Error('Badge job missing data');
  // In a real implementation, you might send an email or update HubSpot
  // For demonstration we just log the badge URL
  console.log(JSON.stringify({ ok: true, url, badgeUrl }));
}, 1);

worker.on('failed', (job, err) => {
  // eslint-disable-next-line no-console
  console.error(`Badge job ${job.id} failed:`, err.message);
});

await new Promise(() => {});