#!/usr/bin/env node

/*
 * Capture screenshots of key UI states for visual regression testing.  
 * This script uses Playwright to drive a Chromium browser.  
 * The base URL can be overridden via the BASE_URL environment variable.  
 * Captured PNGs are written to ./test-artefacts.  
 */

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const OUT_DIR = './test-artefacts';

// Ensure the output directory exists
await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();

console.log('🎬 Capturing live UI states…');

// 1. Dashboard: scanning progress
try {
  await page.goto(`${BASE}?scan-progress`);
  await page.waitForSelector('#scan-progress', { state: 'visible', timeout: 15000 });
  const dashPath = `${OUT_DIR}/01-dashboard.png`;
  await page.screenshot({ path: dashPath, fullPage: true });
  console.log(`✅ captured ${dashPath}`);
} catch (err) {
  console.error('❌ Error capturing dashboard:', err);
}

// 2. Review-Before-Send modal
try {
  await page.goto(`${BASE}/review-send?first_name=John&company=example&contactId=123`);
  await page.waitForSelector('button:has-text("Approve")', { timeout: 15000 });
  const modalPath = `${OUT_DIR}/02-review-modal.png`;
  await page.screenshot({ path: modalPath, fullPage: true });
  console.log(`✅ captured ${modalPath}`);
} catch (err) {
  console.error('❌ Error capturing modal:', err);
}

// Additional states can be captured here (annotated violations, HubSpot deal, Gmail sent, etc.)

await browser.close();
console.log('📸 Capture complete');