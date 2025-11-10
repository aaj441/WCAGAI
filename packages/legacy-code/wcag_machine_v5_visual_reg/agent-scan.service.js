#!/usr/bin/env node

/*
 * Agent 2: Scan 1 URL
 *
 * This script pulls a URL from the command line, runs an accessibility scan using the
 * scanUrl helper (Puppeteer + axe-core), stores the raw report in Redis, and outputs
 * a summary JSON containing the number of violations.
 */

import { redis } from './lib/redis.js';
import { scanUrl } from './lib/scan.js';
import { prefixKey } from './lib/tenant.js';
import { saveScanReport } from './lib/db.js';

const url = process.argv[2];
if (!url) {
  console.error('❌ url needed');
  process.exit(1);
}

try {
  const report = await scanUrl(url);
  // Persist to Redis using tenant prefix
  await redis.set(prefixKey(`scan:${url}`), JSON.stringify(report));
  // Optionally persist to database
  await saveScanReport(url, report);
  console.log(JSON.stringify({ ok: true, url, violations: report.violations.length }));
} catch (err) {
  console.error('❌ failed to scan:', err);
  process.exit(1);
}