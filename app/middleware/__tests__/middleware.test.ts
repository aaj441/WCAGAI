import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from 'ioredis';
import { IdempotencyMiddleware } from '../idempotency';
import { SSRFProtection } from '../ssrf-protection';

// Mock Redis
vi.mock('ioredis');

describe('IdempotencyMiddleware', () => {
  let redis: Redis;

  beforeEach(() => {
    redis = new Redis();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should store and retrieve cached results', async () => {
    const key = 'test-key';
    const result = { data: 'test' };

    // Mock Redis get/set
    vi.spyOn(redis, 'get').mockResolvedValue(null);
    vi.spyOn(redis, 'setex').mockResolvedValue('OK');

    // Store result
    await IdempotencyMiddleware.store(key, result);
    expect(redis.setex).toHaveBeenCalledWith(
      'idempotency:test-key',
      86400,
      expect.any(String)
    );

    // Set up mock for retrieval
    vi.spyOn(redis, 'get').mockResolvedValue(JSON.stringify({
      id: key,
      result,
      createdAt: expect.any(String)
    }));

    // Check cached result
    const cached = await IdempotencyMiddleware.check(key);
    expect(cached).toEqual({
      id: key,
      result,
      createdAt: expect.any(String)
    });
  });

  it('should handle Redis errors gracefully', async () => {
    vi.spyOn(redis, 'get').mockRejectedValue(new Error('Redis connection failed'));
    
    const cached = await IdempotencyMiddleware.check('test-key');
    expect(cached).toBeNull();
  });
});

describe('SSRFProtection', () => {
  const mockRequest = (url: string): NextRequest => {
    return new NextRequest('https://example.com/api/scan', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
  };

  it('should block localhost URLs', async () => {
    const urls = [
      'http://localhost',
      'http://127.0.0.1',
      'http://0.0.0.0',
      'http://[::1]'
    ];

    for (const url of urls) {
      const req = mockRequest(url);
      const result = await SSRFProtection.validateUrl(url);
      expect(result).toBe(false);
    }
  });

  it('should block AWS metadata endpoint', async () => {
    const url = 'http://169.254.169.254/latest/meta-data';
    const result = await SSRFProtection.validateUrl(url);
    expect(result).toBe(false);
  });

  it('should allow valid public URLs', async () => {
    const urls = [
      'https://example.com',
      'https://google.com',
      'http://valid-site.org'
    ];

    for (const url of urls) {
      const result = await SSRFProtection.validateUrl(url);
      expect(result).toBe(true);
    }
  });

  it('should block non-http(s) protocols', async () => {
    const urls = [
      'file:///etc/passwd',
      'ftp://malicious.com',
      'data:text/plain,hello',
      'gopher://danger.com'
    ];

    for (const url of urls) {
      const result = await SSRFProtection.validateUrl(url);
      expect(result).toBe(false);
    }
  });
});