/**
 * Badge generation helper (ENHANCED for AAG Badge API)
 *
 * When a site passes a re-audit with an acceptable number of violations,
 * we mint an SVG badge that can be embedded on their site. This enhanced
 * version supports AAG compliance levels (A, AA, AAA).
 *
 * @module lib/badge
 * @version 2.0.0 (Enhanced with AAG Badge API capabilities)
 */

import crypto from 'crypto';

/**
 * Determines AAG compliance level based on violations
 * @param {Array} violations - Array of violations
 * @returns {string} Compliance level (AAA, AA, A, or Fail)
 */
function determineComplianceLevel(violations) {
  const criticalCount = violations.filter(v => v.impact === 'critical').length;
  const seriousCount = violations.filter(v => v.impact === 'serious').length;
  const moderateCount = violations.filter(v => v.impact === 'moderate').length;
  const totalCount = violations.length;

  // AAG Compliance Levels:
  // - Fail: Any critical violations OR 10+ total violations
  // - A: No critical, but 1+ serious OR 5+ total violations
  // - AA: No critical/serious, but 1+ moderate OR 2+ total violations
  // - AAA: 0-2 minor violations only

  if (criticalCount > 0 || totalCount > 10) {
    return 'Fail';
  } else if (seriousCount > 0 || totalCount > 5) {
    return 'A';
  } else if (moderateCount > 0 || totalCount > 2) {
    return 'AA';
  } else {
    return 'AAA';
  }
}

/**
 * Gets color scheme for compliance level
 * @param {string} level - Compliance level
 * @returns {Object} { backgroundColor, textColor }
 */
function getBadgeColors(level) {
  const colors = {
    'AAA': { backgroundColor: '#22C55E', textColor: '#FFFFFF' },  // Green
    'AA': { backgroundColor: '#3B82F6', textColor: '#FFFFFF' },   // Blue
    'A': { backgroundColor: '#F59E0B', textColor: '#FFFFFF' },    // Amber
    'Fail': { backgroundColor: '#EF4444', textColor: '#FFFFFF' }  // Red
  };

  return colors[level] || colors['Fail'];
}

/**
 * Generates AAG compliance badge (Enhanced)
 * @param {string} domain - Domain name
 * @param {Object} report - Scan report with violations
 * @param {string} level - Optional: Override compliance level
 * @returns {Promise<Object>} Badge data with URL, level, and metadata
 */
async function mintBadge(domain, report, level = null) {
  const violations = report.violations || [];
  const complianceLevel = level || determineComplianceLevel(violations);
  const colors = getBadgeColors(complianceLevel);
  const badgeId = crypto.randomUUID();

  // Generate SVG badge
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" role="img" aria-label="AAG Compliance Badge">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.backgroundColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.backgroundColor};stop-opacity:0.8" />
    </linearGradient>
  </defs>
  <rect width="300" height="100" rx="8" fill="url(#grad)"/>
  <text x="150" y="35" fill="${colors.textColor}" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" font-weight="normal">AAG Accessibility</text>
  <text x="150" y="65" fill="${colors.textColor}" font-family="Arial, sans-serif" font-size="28" text-anchor="middle" font-weight="bold">Level ${complianceLevel}</text>
  <text x="150" y="88" fill="${colors.textColor}" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" opacity="0.9">${domain}</text>
</svg>`;

  // Encode as base64 data URI
  const buffer = Buffer.from(svg);
  const badgeUrl = `data:image/svg+xml;base64,${buffer.toString('base64')}`;

  return {
    badge_id: badgeId,
    badge_url: badgeUrl,
    compliance_level: complianceLevel,
    domain,
    violations_count: violations.length,
    generated_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
    svg_content: svg
  };
}

/**
 * Creates barrier feedback entry
 * @param {string} badgeId - Badge identifier
 * @param {string} barrierType - Type of barrier (visual, auditory, motor, cognitive)
 * @param {string} description - Description of the barrier
 * @param {Object} userContext - User context (assistive tech, etc.)
 * @returns {Object} Feedback entry
 */
function createBarrierFeedback(badgeId, barrierType, description, userContext = {}) {
  return {
    feedback_id: crypto.randomUUID(),
    badge_id: badgeId,
    barrier_type: barrierType,
    description,
    user_context: userContext,
    received_at: new Date().toISOString(),
    status: 'pending_review'
  };
}

/**
 * Encrypts user preferences (for privacy-preserving badge personalization)
 * @param {Object} preferences - User preferences
 * @param {string} key - Encryption key
 * @returns {string} Encrypted preferences
 */
function encryptUserPreferences(preferences, key = process.env.ENCRYPTION_KEY) {
  if (!key) {
    throw new Error('ENCRYPTION_KEY not configured');
  }

  const algorithm = 'aes-256-cbc';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);

  let encrypted = cipher.update(JSON.stringify(preferences), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts user preferences
 * @param {string} encryptedData - Encrypted preferences
 * @param {string} key - Encryption key
 * @returns {Object} Decrypted preferences
 */
function decryptUserPreferences(encryptedData, key = process.env.ENCRYPTION_KEY) {
  if (!key) {
    throw new Error('ENCRYPTION_KEY not configured');
  }

  const algorithm = 'aes-256-cbc';
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];

  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), iv);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}

export {
  mintBadge,
  determineComplianceLevel,
  getBadgeColors,
  createBarrierFeedback,
  encryptUserPreferences,
  decryptUserPreferences
};