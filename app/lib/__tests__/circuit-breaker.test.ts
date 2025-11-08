import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CircuitBreaker, ResilientAIService } from '../lib/circuit-breaker';
import { Redis } from 'ioredis';

// Mock Redis
vi.mock('ioredis');

describe('CircuitBreaker', () => {
  let redis: Redis;
  let breaker: CircuitBreaker;

  beforeEach(() => {
    redis = new Redis();
    breaker = new CircuitBreaker('test-service');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should stay closed on successful executions', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');
    const result = await breaker.execute(mockFn);
    
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should open after threshold failures', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('fail'));
    const mockFallback = vi.fn().mockResolvedValue('fallback');

    // Simulate 5 failures
    for (let i = 0; i < 5; i++) {
      await breaker.execute(mockFn, mockFallback).catch(() => {});
    }

    // Next call should go straight to fallback
    const result = await breaker.execute(mockFn, mockFallback);
    expect(result).toBe('fallback');
    expect(mockFn).toHaveBeenCalledTimes(5); // No more calls after opening
  });

  it('should try primary function in half-open state', async () => {
    const mockFn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');
    
    // Fail once to record failure
    await breaker.execute(mockFn).catch(() => {});
    
    // Mock timeout passed
    vi.advanceTimersByTime(31000);
    
    // Should try primary function again
    const result = await breaker.execute(mockFn);
    expect(result).toBe('success');
  });

  it('should use fallback when provided and circuit is open', async () => {
    const mockPrimary = vi.fn().mockRejectedValue(new Error('fail'));
    const mockFallback = vi.fn().mockResolvedValue('fallback');

    // Cause circuit to open
    for (let i = 0; i < 5; i++) {
      await breaker.execute(mockPrimary, mockFallback);
    }

    const result = await breaker.execute(mockPrimary, mockFallback);
    expect(result).toBe('fallback');
    expect(mockFallback).toHaveBeenCalled();
  });
});

describe('ResilientAIService', () => {
  let aiService: ResilientAIService;

  beforeEach(() => {
    aiService = new ResilientAIService();
  });

  it('should try OpenAI first', async () => {
    const result = await aiService.generateSuggestion('test prompt')
      .catch(e => e.message);
    expect(result).toContain('OpenAI call not implemented');
  });

  it('should fallback to Claude when OpenAI fails', async () => {
    // TODO: Mock OpenAI failure and verify Claude fallback
  });

  it('should throw when all providers fail', async () => {
    const error = await aiService.generateSuggestion('test prompt')
      .catch(e => e);
    expect(error.message).toContain('All AI providers failed');
  });
});