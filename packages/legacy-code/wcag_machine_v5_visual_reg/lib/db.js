/**
 * Persistence and analytics stub.
 *
 * A production-grade WCAG machine should persist scan reports, badge
 * metadata and analytics to a relational database or analytics warehouse.
 * This module provides placeholder functions that you can wire up to
 * Postgres, ClickHouse or another data store.  See README for details.
 */

// Example: using pg (PostgreSQL) when installed.  If pg is not available
// these imports will fail gracefully and the stub functions will no-op.
let pgClient;
try {
  // dynamic import to avoid hard dependency when pg is not installed
  const { Client } = await import('pg');
  pgClient = new Client({ connectionString: process.env.DATABASE_URL });
  await pgClient.connect();
} catch (err) {
  // eslint-disable-next-line no-console
  console.warn('DB not configured; scan reports will not be persisted.');
  pgClient = null;
}

/**
 * Save a scan report to the database.  Associates the report with the
 * tenant and URL.  In a real implementation this would INSERT into a
 * table with columns (tenant_id, url, violations_json, scanned_at).
 */
export async function saveScanReport(url, report) {
  if (!pgClient) return;
  const tenant = process.env.TENANT_ID || 'default';
  const text = `INSERT INTO scan_reports (tenant_id, url, report_json, scanned_at) VALUES ($1, $2, $3, NOW())`;
  await pgClient.query(text, [tenant, url, JSON.stringify(report)]);
}

/**
 * Save a badge URL for later display.  Associates it with a domain and tenant.
 */
export async function saveBadge(url, badgeUrl) {
  if (!pgClient) return;
  const tenant = process.env.TENANT_ID || 'default';
  const text = `INSERT INTO badges (tenant_id, url, badge_url, created_at) VALUES ($1, $2, $3, NOW())`;
  await pgClient.query(text, [tenant, url, badgeUrl]);
}

/**
 * Track acceptance rate for suggested fixes.  This could update an
 * analytics cube; here it just logs the event.
 */
export async function recordFixAcceptance(url, accepted) {
  if (!pgClient) return;
  const tenant = process.env.TENANT_ID || 'default';
  const text = `INSERT INTO fix_acceptance (tenant_id, url, accepted, timestamp) VALUES ($1, $2, $3, NOW())`;
  await pgClient.query(text, [tenant, url, accepted]);
}