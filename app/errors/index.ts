/**
 * Custom error classes and error handling utilities
 */

export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly context?: Record<string, any>;

  constructor(message: string, status = 500, code = 'INTERNAL_ERROR', context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        ...(this.context && { context: this.context })
      }
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 400, 'VALIDATION_ERROR', context);
  }
}

export class SecurityError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 403, 'SECURITY_ERROR', context);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', context);
  }
}

export class IdempotencyError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 409, 'IDEMPOTENCY_ERROR', context);
  }
}

export class RedisError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 503, 'REDIS_ERROR', context);
  }
}

export class AIServiceError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 502, 'AI_SERVICE_ERROR', context);
  }
}