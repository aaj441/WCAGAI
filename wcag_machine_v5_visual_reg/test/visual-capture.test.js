#!/usr/bin/env node

/*
 * Visual regression test that compares live captures against the committed golden baseline.  
 * If the pixel difference between a live capture and its golden counterpart exceeds the threshold (2%), the test fails.  
 */

import { readdir, readFile } from 'fs/promises';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const ARTEFACTS_DIR = './test-artefacts';
const GOLDEN_DIR = './test-golden';
const THRESHOLD = 0.02; // allow 2% difference

async function run() {
  const files = await readdir(ARTEFACTS_DIR);
  let failed = false;
  for (const file of files) {
    if (!file.endsWith('.png')) continue;
    const artefactBuf = await readFile(`${ARTEFACTS_DIR}/${file}`);
    const goldenBuf = await readFile(`${GOLDEN_DIR}/${file}`);
    const artefact = PNG.sync.read(artefactBuf);
    const golden = PNG.sync.read(goldenBuf);
    const diff = pixelmatch(
      artefact.data,
      golden.data,
      null,
      artefact.width,
      artefact.height,
      { threshold: THRESHOLD }
    );
    const totalPixels = artefact.width * artefact.height;
    const diffPercent = (diff / totalPixels) * 100;
    if (diffPercent > THRESHOLD * 100) {
      failed = true;
      console.error(`❌ ${file} visual drift: ${diffPercent.toFixed(2)}% > ${THRESHOLD * 100}%`);
    } else {
      console.log(`✅ ${file} visual diff: ${diffPercent.toFixed(2)}% ≤ ${THRESHOLD * 100}%`);
    }
  }
  if (failed) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});