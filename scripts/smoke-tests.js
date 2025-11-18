#!/usr/bin/env node
/**
 * Smoke Test Suite - WCAGAI Zero-Downtime Deployment
 *
 * Runs critical tests after deployment to verify system health
 * Usage: node scripts/smoke-tests.js [target-url]
 *
 * Example:
 *   node scripts/smoke-tests.js https://wcagai-green.railway.app
 *   node scripts/smoke-tests.js  # defaults to production
 */

const https = require('https');
const http = require('http');

// ============================================================================
// Configuration
// ============================================================================

const TARGET_URL = process.argv[2] || process.env.TARGET_URL || 'https://wcagai.com';
const TIMEOUT = 10000; // 10 seconds

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// ============================================================================
// HTTP Request Helper
// ============================================================================

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const req = client.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: TIMEOUT
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: json
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// ============================================================================
// Test Functions
// ============================================================================

async function test1_HealthEndpoint() {
  console.log(`${colors.blue}Test 1:${colors.reset} Health endpoint responds`);

  const response = await makeRequest(`${TARGET_URL}/health`);

  if (response.statusCode === 200) {
    console.log(`  ${colors.green}✓ PASS${colors.reset} - Health endpoint returned 200`);
    console.log(`  Status: ${response.body.status}`);
    return true;
  } else {
    console.log(`  ${colors.red}✗ FAIL${colors.reset} - Expected 200, got ${response.statusCode}`);
    return false;
  }
}

async function test2_ReadinessProbe() {
  console.log(`${colors.blue}Test 2:${colors.reset} Readiness probe`);

  const response = await makeRequest(`${TARGET_URL}/health/ready`);

  if (response.statusCode === 200 && response.body.ready === true) {
    console.log(`  ${colors.green}✓ PASS${colors.reset} - Service is ready`);
    return true;
  } else {
    console.log(`  ${colors.red}✗ FAIL${colors.reset} - Service not ready`);
    return false;
  }
}

async function test3_LivenessProbe() {
  console.log(`${colors.blue}Test 3:${colors.reset} Liveness probe`);

  const response = await makeRequest(`${TARGET_URL}/health/live`);

  if (response.statusCode === 200 && response.body.alive === true) {
    console.log(`  ${colors.green}✓ PASS${colors.reset} - Service is alive`);
    return true;
  } else {
    console.log(`  ${colors.red}✗ FAIL${colors.reset} - Service not alive`);
    return false;
  }
}

async function test4_MetricsEndpoint() {
  console.log(`${colors.blue}Test 4:${colors.reset} Metrics endpoint`);

  const response = await makeRequest(`${TARGET_URL}/health/metrics`);

  if (response.statusCode === 200 && response.body.metrics) {
    console.log(`  ${colors.green}✓ PASS${colors.reset} - Metrics available`);
    console.log(`  Error rate: ${response.body.metrics.error_rate}`);
    console.log(`  Avg response time: ${response.body.metrics.avg_response_time_ms}ms`);
    return true;
  } else {
    console.log(`  ${colors.red}✗ FAIL${colors.reset} - Metrics not available`);
    return false;
  }
}

async function test5_DatabaseConnection() {
  console.log(`${colors.blue}Test 5:${colors.reset} Database connection`);

  const response = await makeRequest(`${TARGET_URL}/health`);

  if (response.body.checks && response.body.checks.database) {
    const dbStatus = response.body.checks.database.status;
    if (dbStatus === 'up') {
      console.log(`  ${colors.green}✓ PASS${colors.reset} - Database connected`);
      return true;
    } else {
      console.log(`  ${colors.yellow}⚠ WARN${colors.reset} - Database status: ${dbStatus}`);
      return true; // Not critical for basic functionality
    }
  } else {
    console.log(`  ${colors.red}✗ FAIL${colors.reset} - Database check failed`);
    return false;
  }
}

async function test6_GeminiAI() {
  console.log(`${colors.blue}Test 6:${colors.reset} Gemini AI availability`);

  const response = await makeRequest(`${TARGET_URL}/health`);

  if (response.body.checks && response.body.checks.gemini_ai) {
    const aiStatus = response.body.checks.gemini_ai.status;
    if (aiStatus === 'up') {
      console.log(`  ${colors.green}✓ PASS${colors.reset} - Gemini AI available`);
      return true;
    } else {
      console.log(`  ${colors.red}✗ FAIL${colors.reset} - Gemini AI status: ${aiStatus}`);
      return false;
    }
  } else {
    console.log(`  ${colors.red}✗ FAIL${colors.reset} - Gemini AI check failed`);
    return false;
  }
}

async function test7_APITestProbes() {
  console.log(`${colors.blue}Test 7:${colors.reset} API test probes`);

  try {
    const response = await makeRequest(`${TARGET_URL}/api/test/probes`);

    if (response.statusCode === 200) {
      console.log(`  ${colors.green}✓ PASS${colors.reset} - Test probes endpoint working`);
      if (response.body.summary) {
        console.log(`  ${response.body.summary}`);
      }
      return true;
    } else {
      console.log(`  ${colors.yellow}⚠ WARN${colors.reset} - Test probes returned ${response.statusCode}`);
      return true; // Not critical
    }
  } catch (error) {
    console.log(`  ${colors.yellow}⚠ WARN${colors.reset} - Test probes endpoint unavailable`);
    return true; // Not critical
  }
}

async function test8_FrontendLoads() {
  console.log(`${colors.blue}Test 8:${colors.reset} Frontend loads`);

  const response = await makeRequest(`${TARGET_URL}/`);

  if (response.statusCode === 200) {
    console.log(`  ${colors.green}✓ PASS${colors.reset} - Frontend loads successfully`);
    return true;
  } else {
    console.log(`  ${colors.red}✗ FAIL${colors.reset} - Frontend returned ${response.statusCode}`);
    return false;
  }
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runSmokeTests() {
  console.log('');
  console.log('════════════════════════════════════════════════════════');
  console.log('  WCAGAI Smoke Test Suite');
  console.log('════════════════════════════════════════════════════════');
  console.log('');
  console.log(`Target: ${TARGET_URL}`);
  console.log('');

  const tests = [
    test1_HealthEndpoint,
    test2_ReadinessProbe,
    test3_LivenessProbe,
    test4_MetricsEndpoint,
    test5_DatabaseConnection,
    test6_GeminiAI,
    test7_APITestProbes,
    test8_FrontendLoads
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
      console.log('');
    } catch (error) {
      console.log(`  ${colors.red}✗ ERROR${colors.reset} - ${error.message}`);
      console.log('');
      failed++;
    }
  }

  // Summary
  console.log('════════════════════════════════════════════════════════');
  console.log('  Test Summary');
  console.log('════════════════════════════════════════════════════════');
  console.log('');
  console.log(`Total tests: ${tests.length}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log('');

  if (failed === 0) {
    console.log(`${colors.green}✅ ALL TESTS PASSED${colors.reset}`);
    console.log('');
    console.log('Deployment is healthy and ready for traffic');
    console.log('');
    process.exit(0);
  } else {
    console.log(`${colors.red}❌ SOME TESTS FAILED${colors.reset}`);
    console.log('');
    console.log('Do NOT switch traffic to this environment');
    console.log('Review failures and fix issues before deploying');
    console.log('');
    process.exit(1);
  }
}

// Run tests
runSmokeTests().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
