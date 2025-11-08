/**
 * Circuit breaker implementation for AI service resilience.
 * Handles fallback between OpenAI and Claude, with automatic recovery.
 */

import { config } from '../config';
import { AIServiceError } from '../errors';
import { Redis } from 'ioredis';

const redis = new Redis(config.redis.url);

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
type Provider = 'openai' | 'claude';

interface FailureRecord {
  count: number;
  lastFailure: number;
}

export class CircuitBreaker {
  private readonly key: string;
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly monitorInterval: number;

  constructor(
    private readonly name: string,
    options: {
      failureThreshold?: number;
      resetTimeout?: number;
      monitorInterval?: number;
    } = {}
  ) {
    this.key = `circuit:${name}`;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
    this.monitorInterval = options.monitorInterval || 5000; // 5 seconds

    // Start monitoring circuit state
    this.monitor();
  }

  /**
   * Get current circuit state
   */
  private async getState(): Promise<CircuitState> {
    const failures = await this.getFailures();
    if (!failures) return 'CLOSED';

    const { count, lastFailure } = failures;
    const timeSinceLastFailure = Date.now() - lastFailure;

    if (count >= this.failureThreshold) {
      return timeSinceLastFailure > this.resetTimeout ? 'HALF_OPEN' : 'OPEN';
    }

    return 'CLOSED';
  }

  /**
   * Get failure record from Redis
   */
  private async getFailures(): Promise<FailureRecord | null> {
    const data = await redis.get(this.key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Record a failure
   */
  private async recordFailure(): Promise<void> {
    const failures = await this.getFailures();
    const newRecord: FailureRecord = {
      count: (failures?.count || 0) + 1,
      lastFailure: Date.now()
    };
    await redis.setex(this.key, 86400, JSON.stringify(newRecord)); // 24h TTL
  }

  /**
   * Reset failure count
   */
  private async reset(): Promise<void> {
    await redis.del(this.key);
  }

  /**
   * Monitor circuit state and log changes
   */
  private async monitor(): Promise<void> {
    let lastState: CircuitState = 'CLOSED';

    const check = async () => {
      const currentState = await this.getState();
      if (currentState !== lastState) {
        console.log(`Circuit ${this.name} state changed from ${lastState} to ${currentState}`);
        lastState = currentState;
      }
      setTimeout(check, this.monitorInterval);
    };

    check();
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(
    primary: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    const state = await this.getState();

    if (state === 'OPEN') {
      if (!fallback) {
        throw new AIServiceError('Circuit is open', {
          service: this.name,
          state
        });
      }
      return fallback();
    }

    try {
      const result = await primary();
      if (state === 'HALF_OPEN') {
        await this.reset();
      }
      return result;
    } catch (error) {
      await this.recordFailure();
      
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }
}

/**
 * AI service with circuit breaker protection
 */
export class ResilientAIService {
  private readonly openAIBreaker: CircuitBreaker;
  private readonly claudeBreaker: CircuitBreaker;

  constructor() {
    this.openAIBreaker = new CircuitBreaker('openai');
    this.claudeBreaker = new CircuitBreaker('claude');
  }

  /**
   * Generate AI suggestion with automatic fallback
   */
  async generateSuggestion(prompt: string): Promise<string> {
    try {
      // Try OpenAI first
      return await this.openAIBreaker.execute(
        async () => this.callOpenAI(prompt),
        // Fallback to Claude if OpenAI fails
        async () => {
          console.log('OpenAI circuit open, falling back to Claude');
          return await this.claudeBreaker.execute(
            async () => this.callClaude(prompt)
          );
        }
      );
    } catch (error) {
      throw new AIServiceError('All AI providers failed', {
        originalError: error
      });
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    // TODO: Implement actual OpenAI call
    throw new Error('OpenAI call not implemented');
  }

  private async callClaude(prompt: string): Promise<string> {
    // TODO: Implement actual Claude call
    throw new Error('Claude call not implemented');
  }
}