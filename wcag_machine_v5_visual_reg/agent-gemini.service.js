#!/usr/bin/env node

/**
 * WCAGAI Agent: Gemini Analysis Service
 *
 * This agent analyzes accessibility scan results using Gemini 2.0
 * with embedded WCAGAI system instruction (21 rules).
 *
 * Input:  Scan results (JSON) or scan ID from Redis/database
 * Output: AI-powered accessibility analysis and remediation guidance
 *
 * Usage:
 *   node agent-gemini.service.js <scan_id>
 *   node agent-gemini.service.js --input scan-results.json
 *
 * Example:
 *   node agent-gemini.service.js abc123
 *   # => {"ok":true,"scan_id":"abc123","analysis":"...","compliance_level":"AA"}
 *
 * @version 2.0.0
 * @author Aaron J. (aaj441)
 */

const { createGeminiClient } = require('./lib/gemini');
const { createRedisClient } = require('./lib/redis');
const fs = require('fs');
require('dotenv').config();

// ============================================================================
// Configuration
// ============================================================================

const TENANT_ID = process.env.TENANT_ID || 'default';
const REDIS_AVAILABLE = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_HOST;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Fetches scan results from Redis or file
 * @param {string} scanId - Scan identifier or file path
 * @returns {Promise<Object>} Scan results
 */
async function fetchScanResults(scanId) {
  // Check if it's a file path
  if (scanId.endsWith('.json')) {
    const data = fs.readFileSync(scanId, 'utf8');
    return JSON.parse(data);
  }

  // Try to fetch from Redis
  if (REDIS_AVAILABLE) {
    const redis = createRedisClient();
    const key = `t:${TENANT_ID}:scan:${scanId}`;
    const data = await redis.get(key);

    if (!data) {
      throw new Error(`Scan not found: ${scanId}`);
    }

    return JSON.parse(data);
  }

  throw new Error('No Redis configured and scan ID is not a file path');
}

/**
 * Stores analysis results in Redis
 * @param {string} scanId - Scan identifier
 * @param {Object} analysis - Analysis results
 * @returns {Promise<void>}
 */
async function storeAnalysis(scanId, analysis) {
  if (!REDIS_AVAILABLE) {
    console.error('Redis not configured, cannot store analysis');
    return;
  }

  const redis = createRedisClient();
  const key = `t:${TENANT_ID}:analysis:${scanId}`;

  await redis.set(key, JSON.stringify(analysis), {
    ex: 7 * 24 * 60 * 60  // Expire after 7 days
  });
}

// ============================================================================
// Main Agent Function
// ============================================================================

async function analyzeWithGemini(scanId) {
  try {
    // Step 1: Fetch scan results
    console.error(`[agent-gemini] Fetching scan results for: ${scanId}`);
    const scanResults = await fetchScanResults(scanId);

    if (!scanResults.violations || !Array.isArray(scanResults.violations)) {
      throw new Error('Invalid scan results: missing violations array');
    }

    const { url, violations } = scanResults;

    console.error(`[agent-gemini] Found ${violations.length} violations for ${url}`);

    // Step 2: Initialize Gemini client
    const gemini = createGeminiClient();

    // Step 3: Analyze violations
    console.error(`[agent-gemini] Analyzing with Gemini 2.0 + WCAGAI...`);
    const analysis = await gemini.analyzeViolations(violations, url);

    // Step 4: Store analysis results
    if (REDIS_AVAILABLE) {
      console.error(`[agent-gemini] Storing analysis in Redis...`);
      await storeAnalysis(scanId, analysis);
    }

    // Step 5: Return results
    const result = {
      ok: true,
      scan_id: scanId,
      url,
      violations_count: violations.length,
      compliance_level: analysis.compliance_level,
      analysis: analysis.analysis,
      recommendations: analysis.recommendations,
      timestamp: analysis.timestamp
    };

    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error(`[agent-gemini] Error: ${error.message}`);

    const errorResult = {
      ok: false,
      scan_id: scanId,
      error: error.message,
      timestamp: new Date().toISOString()
    };

    console.log(JSON.stringify(errorResult, null, 2));
    return errorResult;
  }
}

// ============================================================================
// CLI Entry Point
// ============================================================================

if (require.main === module) {
  const scanId = process.argv[2];

  if (!scanId) {
    console.error('Usage: node agent-gemini.service.js <scan_id>');
    console.error('   or: node agent-gemini.service.js --input scan-results.json');
    process.exit(1);
  }

  const inputArg = process.argv.includes('--input') ? process.argv[3] : scanId;

  analyzeWithGemini(inputArg)
    .then(() => process.exit(0))
    .catch(error => {
      console.error(`Fatal error: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { analyzeWithGemini };
