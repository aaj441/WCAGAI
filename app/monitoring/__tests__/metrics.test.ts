import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { metrics, register, withMetrics } from '../../monitoring/metrics';
import { NextResponse } from 'next/server';

describe('Metrics', () => {
  beforeEach(() => {
    // Clear all metrics
    register.clear();
  });

  it('should track scan metrics', async () => {
    metrics.scansTotal.inc({ status: 'success', type: 'accessibility' });
    metrics.scanDuration.observe({ type: 'accessibility' }, 1.5);

    const output = await register.metrics();
    expect(output).toContain('wcagai_scans_total');
    expect(output).toContain('wcagai_scan_duration_seconds');
  });

  it('should track AI service metrics', async () => {
    metrics.aiRequests.inc({ provider: 'openai', status: 'success' });
    metrics.aiLatency.observe({ provider: 'openai' }, 0.5);

    const output = await register.metrics();
    expect(output).toContain('wcagai_ai_requests_total');
    expect(output).toContain('wcagai_ai_latency_seconds');
  });

  it('should track circuit breaker metrics', async () => {
    metrics.circuitState.set({ name: 'openai' }, 0); // closed
    metrics.circuitFailures.inc({ name: 'openai' });

    const output = await register.metrics();
    expect(output).toContain('wcagai_circuit_state');
    expect(output).toContain('wcagai_circuit_failures_total');
  });

  it('should track response times in middleware', async () => {
    const mockHandler = vi.fn().mockResolvedValue(
      new NextResponse('OK', { status: 200 })
    );

    const handler = withMetrics(mockHandler);
    await handler(new Request('http://localhost/test'));

    const output = await register.metrics();
    expect(output).toContain('wcagai_http_response_time_seconds');
  });

  it('should track failed requests in middleware', async () => {
    const mockHandler = vi.fn().mockRejectedValue(new Error('test error'));
    const handler = withMetrics(mockHandler);

    await handler(new Request('http://localhost/test')).catch(() => {});

    const output = await register.metrics();
    expect(output).toContain('status="500"');
  });

  it('should track security blocks', async () => {
    metrics.securityBlocks.inc({ reason: 'ssrf' });
    metrics.securityBlocks.inc({ reason: 'rate-limit' });

    const output = await register.metrics();
    expect(output).toContain('wcagai_security_blocks_total');
    expect(output).toContain('reason="ssrf"');
    expect(output).toContain('reason="rate-limit"');
  });

  it('should track business metrics', async () => {
    metrics.activeScans.set(5);
    metrics.scanQueue.set(10);

    const output = await register.metrics();
    expect(output).toContain('wcagai_active_scans');
    expect(output).toContain('wcagai_scan_queue_length');
  });
});