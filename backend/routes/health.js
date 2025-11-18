/**
 * Health Check Routes - Zero-Downtime Deployment
 *
 * Implements comprehensive health checking for blue-green deployments:
 * - /health - Full system health check
 * - /health/ready - Readiness probe (for load balancers)
 * - /health/live - Liveness probe (for container orchestration)
 * - /health/metrics - Performance metrics
 */

const express = require('express');
const router = express.Router();
const { checkDatabase, checkRedis, checkGeminiAI, checkSerpAPI, checkEmailService } = require('../services/health-checks');
const { getMetrics } = require('../services/metrics');

// ============================================================================
// /health - Comprehensive Health Check
// ============================================================================

router.get('/health', async (req, res) => {
  const startTime = Date.now();

  try {
    // Run all health checks in parallel
    const [database, redis, gemini, serpapi, email] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkGeminiAI(),
      checkSerpAPI(),
      checkEmailService()
    ]);

    // Determine overall status
    const allChecks = [database, redis, gemini, serpapi, email];
    const failedCritical = [database, gemini].some(check => check.status !== 'up');
    const failedNonCritical = [redis, serpapi, email].some(check => check.status !== 'up');

    let overallStatus = 'healthy';
    if (failedCritical) {
      overallStatus = 'unhealthy';
    } else if (failedNonCritical) {
      overallStatus = 'degraded';
    }

    // Get current metrics
    const metrics = await getMetrics();

    // Calculate uptime
    const uptime = process.uptime();

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '2.0.0',
      environment: process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV || 'development',
      uptime_seconds: Math.floor(uptime),
      response_time_ms: Date.now() - startTime,
      checks: {
        database,
        redis,
        gemini_ai: gemini,
        serpapi,
        email_service: email
      },
      metrics: {
        requests_per_minute: metrics.requestsPerMinute || 0,
        avg_response_time_ms: metrics.avgResponseTime || 0,
        error_rate: metrics.errorRate || 0,
        cpu_usage_percent: metrics.cpuUsage || 0,
        memory_usage_percent: metrics.memoryUsage || 0
      }
    };

    // Set appropriate HTTP status
    const httpStatus = overallStatus === 'healthy' ? 200 :
                      overallStatus === 'degraded' ? 200 : 503;

    res.status(httpStatus).json(response);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      response_time_ms: Date.now() - startTime
    });
  }
});

// ============================================================================
// /health/ready - Readiness Probe
// ============================================================================

router.get('/health/ready', async (req, res) => {
  try {
    // Quick checks for readiness
    // - Database connection established
    // - Gemini AI key validated
    // - Server fully started

    const database = await checkDatabase();
    const gemini = await checkGeminiAI();

    const ready = database.status === 'up' && gemini.status === 'up';

    if (ready) {
      res.status(200).json({
        ready: true,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        ready: false,
        timestamp: new Date().toISOString(),
        reason: database.status !== 'up' ? 'database_not_ready' : 'gemini_not_ready'
      });
    }
  } catch (error) {
    res.status(503).json({
      ready: false,
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// ============================================================================
// /health/live - Liveness Probe
// ============================================================================

router.get('/health/live', (req, res) => {
  // Simple check: is the process running and responding?
  // This should be VERY fast (< 10ms)

  const alive = process.uptime() > 0;

  if (alive) {
    res.status(200).json({
      alive: true,
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.floor(process.uptime())
    });
  } else {
    res.status(503).json({
      alive: false,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================================
// /health/metrics - Performance Metrics
// ============================================================================

router.get('/health/metrics', async (req, res) => {
  try {
    const metrics = await getMetrics();

    res.status(200).json({
      timestamp: new Date().toISOString(),
      metrics: {
        // Request metrics
        requests_total: metrics.requestsTotal || 0,
        requests_per_minute: metrics.requestsPerMinute || 0,
        requests_per_second: (metrics.requestsPerMinute || 0) / 60,

        // Response time metrics
        avg_response_time_ms: metrics.avgResponseTime || 0,
        p50_response_time_ms: metrics.p50ResponseTime || 0,
        p95_response_time_ms: metrics.p95ResponseTime || 0,
        p99_response_time_ms: metrics.p99ResponseTime || 0,

        // Error metrics
        errors_total: metrics.errorsTotal || 0,
        error_rate: metrics.errorRate || 0,
        errors_per_minute: metrics.errorsPerMinute || 0,

        // Resource metrics
        cpu_usage_percent: metrics.cpuUsage || 0,
        memory_usage_mb: metrics.memoryUsageMB || 0,
        memory_usage_percent: metrics.memoryUsage || 0,

        // System metrics
        uptime_seconds: Math.floor(process.uptime()),
        node_version: process.version,
        platform: process.platform
      },
      baselines: {
        p50_target_ms: 50,
        p95_target_ms: 200,
        p99_target_ms: 500,
        error_rate_target: 0.01, // 1%
        cpu_usage_target: 70,
        memory_usage_target: 80
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
