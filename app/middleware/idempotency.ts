/**
 * Idempotency middleware for handling duplicate scan requests.
 * Uses Redis to store and check idempotency keys, ensuring same scan request
 * returns cached result within 24h window.
 */

import { Redis } from 'ioredis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export interface IdempotencyResult {
  id: string;
  result: any;
  createdAt: string;
}

export class IdempotencyMiddleware {
  private static readonly IDEMPOTENCY_PREFIX = 'idempotency:';
  private static readonly TTL = 86400; // 24 hours in seconds

  /**
   * Check for existing result with idempotency key
   */
  static async check(key: string): Promise<IdempotencyResult | null> {
    try {
      const cached = await redis.get(`${this.IDEMPOTENCY_PREFIX}${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch (err) {
      console.error('Idempotency check failed:', err);
      return null;
    }
  }

  /**
   * Store result with idempotency key
   */
  static async store(key: string, result: any): Promise<void> {
    try {
      const data: IdempotencyResult = {
        id: key,
        result,
        createdAt: new Date().toISOString()
      };
      await redis.setex(
        `${this.IDEMPOTENCY_PREFIX}${key}`, 
        this.TTL,
        JSON.stringify(data)
      );
    } catch (err) {
      console.error('Idempotency store failed:', err);
    }
  }

  /**
   * Middleware function for Next.js API routes
   */
  static async middleware(request: NextRequest) {
    const idempotencyKey = request.headers.get('idempotency-key');

    // Skip if no idempotency key provided
    if (!idempotencyKey) {
      return NextResponse.next();
    }

    // Check for existing result
    const cached = await this.check(idempotencyKey);
    if (cached) {
      return NextResponse.json(cached.result, {
        status: 200,
        headers: {
          'X-Idempotent-Replayed': 'true',
          'X-Idempotent-Key': idempotencyKey
        }
      });
    }

    // No cached result, continue to handler
    return NextResponse.next();
  }

  /**
   * Helper to wrap API response for idempotency
   */
  static async wrapResponse(key: string, result: any) {
    if (!key) return result;
    await this.store(key, result);
    return result;
  }
}

export function withIdempotency(handler: Function) {
  return async function(req: NextRequest, ...args: any[]) {
    const idempotencyKey = req.headers.get('idempotency-key');
    
    // Check idempotency if key provided
    if (idempotencyKey) {
      const cached = await IdempotencyMiddleware.check(idempotencyKey);
      if (cached) {
        return NextResponse.json(cached.result, {
          status: 200,
          headers: {
            'X-Idempotent-Replayed': 'true',
            'X-Idempotent-Key': idempotencyKey
          }
        });
      }
    }
    
    // Run handler and store result if idempotent
    const result = await handler(req, ...args);
    if (idempotencyKey) {
      await IdempotencyMiddleware.store(idempotencyKey, result);
    }
    
    return result;
  };
}