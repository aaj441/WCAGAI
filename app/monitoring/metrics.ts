/**
 * Prometheus metrics configuration and collection
 */

import { Registry, Counter, Histogram, Gauge } from 'prom-client';
import { NextResponse } from 'next/server';

// Create a new registry
export const register = new Registry();

// Add default Node.js metrics (CPU, memory, etc)
register.setDefaultLabels({
  app: 'wcagai',
  environment: process.env.NODE_ENV || 'development'
});

// Application metrics
export const metrics = {
  // Scan metrics
  scansTotal: new Counter({
    name: 'wcagai_scans_total',
    help: 'Total number of scans initiated',
    labelNames: ['status', 'type'] as const,
    registers: [register]
  }),

  scanDuration: new Histogram({
    name: 'wcagai_scan_duration_seconds',
    help: 'Scan duration in seconds',
    labelNames: ['type'] as const,
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
    registers: [register]
  }),

  // AI service metrics
  aiRequests: new Counter({
    name: 'wcagai_ai_requests_total',
    help: 'Total number of AI API requests',
    labelNames: ['provider', 'status'] as const,
    registers: [register]
  }),

  aiLatency: new Histogram({
    name: 'wcagai_ai_latency_seconds',
    help: 'AI API request latency',
    labelNames: ['provider'] as const,
    buckets: [0.1, 0.5, 1, 2, 5, 10],
    registers: [register]
  }),

  // Circuit breaker metrics
  circuitState: new Gauge({
    name: 'wcagai_circuit_state',
    help: 'Circuit breaker state (0=closed, 1=half-open, 2=open)',
    labelNames: ['name'] as const,
    registers: [register]
  }),

  circuitFailures: new Counter({
    name: 'wcagai_circuit_failures_total',
    help: 'Circuit breaker failure count',
    labelNames: ['name'] as const,
    registers: [register]
  }),

  // Redis metrics
  redisConnections: new Gauge({
    name: 'wcagai_redis_connections',
    help: 'Number of active Redis connections',
    registers: [register]
  }),

  redisErrors: new Counter({
    name: 'wcagai_redis_errors_total',
    help: 'Total number of Redis errors',
    labelNames: ['type'] as const,
    registers: [register]
  }),

  // Security metrics
  securityBlocks: new Counter({
    name: 'wcagai_security_blocks_total',
    help: 'Total number of blocked requests',
    labelNames: ['reason'] as const,
    registers: [register]
  }),

  // Performance metrics
  responseTime: new Histogram({
    name: 'wcagai_http_response_time_seconds',
    help: 'HTTP response time in seconds',
    labelNames: ['method', 'route', 'status'] as const,
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    registers: [register]
  }),

  // Business metrics
  activeScans: new Gauge({
    name: 'wcagai_active_scans',
    help: 'Number of currently active scans',
    registers: [register]
  }),

  scanQueue: new Gauge({
    name: 'wcagai_scan_queue_length',
    help: 'Number of scans waiting in queue',
    registers: [register]
  })
};

// Metrics middleware for Next.js API routes
export async function withMetrics(handler: Function) {
  return async function(req: Request, ...args: any[]) {
    const start = Date.now();
    const route = new URL(req.url).pathname;
    
    try {
      const response = await handler(req, ...args);
      
      // Record response time
      metrics.responseTime.observe(
        {
          method: req.method,
          route,
          status: response.status
        },
        (Date.now() - start) / 1000
      );
      
      return response;
    } catch (error) {
      metrics.responseTime.observe(
        {
          method: req.method,
          route,
          status: 500
        },
        (Date.now() - start) / 1000
      );
      throw error;
    }
  };
}

// Prometheus metrics endpoint
export async function metricsHandler() {
  try {
    const metrics = await register.metrics();
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': register.contentType
      }
    });
  } catch (error) {
    console.error('Metrics generation failed:', error);
    return new NextResponse('Metrics collection failed', { status: 500 });
  }
}