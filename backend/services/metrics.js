/**
 * Metrics Collection Service
 * Tracks request counts, response times, error rates, and system resources
 */

const os = require('os');

// In-memory metrics storage (for simple deployment)
// For production, use Redis or a metrics database
const metrics = {
  requests: [],
  errors: [],
  responseTimes: [],
  startTime: Date.now()
};

// ============================================================================
// Record Metrics
// ============================================================================

function recordRequest(duration, isError = false) {
  const now = Date.now();

  metrics.requests.push({
    timestamp: now,
    duration,
    isError
  });

  if (isError) {
    metrics.errors.push({
      timestamp: now
    });
  }

  metrics.responseTimes.push(duration);

  // Clean up old metrics (keep last 10 minutes)
  const tenMinutesAgo = now - (10 * 60 * 1000);
  metrics.requests = metrics.requests.filter(r => r.timestamp > tenMinutesAgo);
  metrics.errors = metrics.errors.filter(e => e.timestamp > tenMinutesAgo);

  // Keep last 1000 response times for percentile calculation
  if (metrics.responseTimes.length > 1000) {
    metrics.responseTimes = metrics.responseTimes.slice(-1000);
  }
}

// ============================================================================
// Calculate Metrics
// ============================================================================

async function getMetrics() {
  const now = Date.now();
  const oneMinuteAgo = now - (60 * 1000);

  // Request metrics
  const recentRequests = metrics.requests.filter(r => r.timestamp > oneMinuteAgo);
  const requestsPerMinute = recentRequests.length;

  const totalRequests = metrics.requests.length;

  // Error metrics
  const recentErrors = metrics.errors.filter(e => e.timestamp > oneMinuteAgo);
  const errorsPerMinute = recentErrors.length;
  const errorsTotal = metrics.errors.length;
  const errorRate = totalRequests > 0 ? errorsTotal / totalRequests : 0;

  // Response time metrics
  const responseTimes = metrics.responseTimes.sort((a, b) => a - b);
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  const p50ResponseTime = calculatePercentile(responseTimes, 50);
  const p95ResponseTime = calculatePercentile(responseTimes, 95);
  const p99ResponseTime = calculatePercentile(responseTimes, 99);

  // Resource metrics
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsagePercent = (usedMemory / totalMemory) * 100;
  const memoryUsageMB = usedMemory / (1024 * 1024);

  // CPU usage (approximation)
  const cpuUsage = process.cpuUsage();
  const cpuUsagePercent = ((cpuUsage.user + cpuUsage.system) / 1000000) / process.uptime() * 100;

  return {
    requestsTotal: totalRequests,
    requestsPerMinute,
    errorsTotal,
    errorsPerMinute,
    errorRate,
    avgResponseTime: Math.round(avgResponseTime),
    p50ResponseTime,
    p95ResponseTime,
    p99ResponseTime,
    cpuUsage: Math.min(100, Math.round(cpuUsagePercent)),
    memoryUsageMB: Math.round(memoryUsageMB),
    memoryUsage: Math.round(memoryUsagePercent)
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculatePercentile(values, percentile) {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return Math.round(sorted[index] || 0);
}

// ============================================================================
// Middleware for Automatic Metrics Recording
// ============================================================================

function metricsMiddleware(req, res, next) {
  const startTime = Date.now();

  // Record response time when request finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const isError = res.statusCode >= 400;
    recordRequest(duration, isError);
  });

  next();
}

module.exports = {
  recordRequest,
  getMetrics,
  metricsMiddleware
};
