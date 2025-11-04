import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import axeCore from 'axe-core';

/**
 * Run an accessibility scan on the provided URL using axe‑core.  
 * A headless Chromium instance is launched via the AWS‑compatible chromium build.  
 * @param {string} url The URL to scan
 * @returns {Promise<object>} The full axe report
 */
export async function scanUrl(url) {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(),
    args: chromium.args,
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  // Inject axe-core source into the page
  await page.addScriptTag({ content: axeCore.source });
  const results = await page.evaluate(async () => {
    return await window.axe.run();
  });
  await browser.close();
  return results;
}