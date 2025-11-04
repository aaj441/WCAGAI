#!/usr/bin/env node

/*
 * Agent 5: Deploy & Health
 *
 * Deploys the WCAG dashboard to your hosting provider (e.g. Railway) and outputs the URL.
 * This stub uses a deployRailway helper that you must implement in lib/deploy.js.
 */

import { deployRailway } from './lib/deploy.js';

try {
  const result = await deployRailway();
  console.log(JSON.stringify({ ok: true, url: result.url }));
} catch (err) {
  console.error('❌ failed to deploy:', err);
  process.exit(1);
}