/**
 * Security Gates Module
 *
 * Provides security validation functions:
 * - Prompt injection detection
 * - URL validation and sanitization
 * - XSS prevention
 * - Audit logging
 *
 * @module lib/security
 * @version 2.0.0
 */

const crypto = require('crypto');

/**
 * Detects potential prompt injection attacks
 * @param {string} input - User input to check
 * @returns {Object} { safe: boolean, confidence: number, reason: string, patterns: array }
 */
function detectPromptInjection(input) {
  if (!input || typeof input !== 'string') {
    return { safe: true, confidence: 1.0, reason: 'No input to check', patterns: [] };
  }

  const suspiciousPatterns = [
    { regex: /ignore\s+(previous|above|all)\s+instructions?/i, name: 'ignore_instructions' },
    { regex: /forget\s+(everything|all|previous)/i, name: 'forget_command' },
    { regex: /you\s+are\s+now/i, name: 'role_override' },
    { regex: /new\s+instructions?:/i, name: 'new_instructions' },
    { regex: /system\s*:\s*/i, name: 'system_prefix' },
    { regex: /\[SYSTEM\]/i, name: 'system_tag' },
    { regex: /execute\s+code/i, name: 'code_execution' },
    { regex: /run\s+command/i, name: 'command_execution' },
    { regex: /<script>/i, name: 'script_tag' },
    { regex: /javascript:/i, name: 'javascript_protocol' },
    { regex: /on(load|error|click|mouse)=/i, name: 'event_handler' },
    { regex: /eval\s*\(/i, name: 'eval_function' },
    { regex: /prompt\s*\(/i, name: 'prompt_function' }
  ];

  const matchedPatterns = [];
  let highestConfidence = 0;

  for (const pattern of suspiciousPatterns) {
    if (pattern.regex.test(input)) {
      matchedPatterns.push(pattern.name);
      highestConfidence = Math.max(highestConfidence, 0.9);
    }
  }

  // Check for excessive special characters (possible obfuscation)
  const specialCharCount = (input.match(/[^a-zA-Z0-9\s]/g) || []).length;
  const specialCharRatio = specialCharCount / input.length;

  if (specialCharRatio > 0.3) {
    matchedPatterns.push('high_special_char_ratio');
    highestConfidence = Math.max(highestConfidence, 0.7);
  }

  // Check for Base64 encoded content (possible obfuscation)
  const base64Pattern = /[A-Za-z0-9+/]{20,}={0,2}/;
  if (base64Pattern.test(input)) {
    matchedPatterns.push('possible_base64_encoding');
    highestConfidence = Math.max(highestConfidence, 0.6);
  }

  const isSafe = matchedPatterns.length === 0;

  return {
    safe: isSafe,
    confidence: isSafe ? 1.0 : highestConfidence,
    reason: isSafe
      ? 'No injection patterns detected'
      : `Matched suspicious patterns: ${matchedPatterns.join(', ')}`,
    patterns: matchedPatterns
  };
}

/**
 * Validates and sanitizes URLs
 * @param {string} url - URL to validate
 * @returns {Object} { valid: boolean, sanitized: string|null, reason: string }
 */
function validateURL(url) {
  if (!url || typeof url !== 'string') {
    return {
      valid: false,
      sanitized: null,
      reason: 'URL is required and must be a string'
    };
  }

  try {
    const parsed = new URL(url);

    // Block dangerous protocols
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(parsed.protocol)) {
      return {
        valid: false,
        sanitized: null,
        reason: `Invalid protocol: ${parsed.protocol}. Only http: and https: are allowed.`
      };
    }

    // Block localhost/private IPs in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = parsed.hostname.toLowerCase();
      const privatePatterns = [
        'localhost',
        '127.',
        '192.168.',
        '10.',
        '172.16.',
        '172.17.',
        '172.18.',
        '172.19.',
        '172.20.',
        '172.21.',
        '172.22.',
        '172.23.',
        '172.24.',
        '172.25.',
        '172.26.',
        '172.27.',
        '172.28.',
        '172.29.',
        '172.30.',
        '172.31.'
      ];

      for (const pattern of privatePatterns) {
        if (hostname === pattern || hostname.startsWith(pattern)) {
          return {
            valid: false,
            sanitized: null,
            reason: 'Private/local URLs not allowed in production'
          };
        }
      }
    }

    // Block URLs with suspicious query parameters
    const suspiciousParams = ['redirect', 'url', 'goto', 'return', 'callback'];
    for (const param of suspiciousParams) {
      if (parsed.searchParams.has(param)) {
        const value = parsed.searchParams.get(param);
        if (value && (value.startsWith('http') || value.startsWith('//'))) {
          return {
            valid: false,
            sanitized: null,
            reason: `Suspicious redirect parameter detected: ${param}`
          };
        }
      }
    }

    return {
      valid: true,
      sanitized: parsed.href,
      reason: 'URL valid'
    };
  } catch (error) {
    return {
      valid: false,
      sanitized: null,
      reason: `Malformed URL: ${error.message}`
    };
  }
}

/**
 * Sanitizes user input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Creates audit log entry
 * @param {string} event - Event type
 * @param {Object} details - Event details
 * @returns {Object} Audit log entry
 */
function createAuditLog(event, details = {}) {
  return {
    audit_id: crypto.randomUUID(),
    event,
    timestamp: new Date().toISOString(),
    tenant_id: process.env.TENANT_ID || 'default',
    ...details
  };
}

/**
 * Validates request rate for a given tenant
 * @param {string} tenantId - Tenant identifier
 * @param {number} maxRequests - Maximum requests per window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Promise<Object>} { allowed: boolean, remaining: number, resetAt: Date }
 */
async function checkRateLimit(tenantId, maxRequests = 100, windowMs = 15 * 60 * 1000) {
  // This is a simple in-memory implementation
  // In production, use Redis for distributed rate limiting

  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }

  const key = `ratelimit:${tenantId}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get or create bucket
  let bucket = global.rateLimitStore.get(key) || { requests: [], resetAt: now + windowMs };

  // Remove old requests
  bucket.requests = bucket.requests.filter(time => time > windowStart);

  // Check if limit exceeded
  if (bucket.requests.length >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(bucket.resetAt)
    };
  }

  // Add current request
  bucket.requests.push(now);
  global.rateLimitStore.set(key, bucket);

  return {
    allowed: true,
    remaining: maxRequests - bucket.requests.length,
    resetAt: new Date(bucket.resetAt)
  };
}

module.exports = {
  detectPromptInjection,
  validateURL,
  sanitizeInput,
  createAuditLog,
  checkRateLimit
};
