/**
 * Configuration Management
 * 
 * Central configuration for all services and integrations
 */

import type { Config } from '@/types/agents';

export const config: Config = {
  database: {
    url: process.env.DATABASE_URL || '',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4-turbo-preview',
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: 'claude-3-5-sonnet-20241022',
    },
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || '',
    sessionSecret: process.env.SESSION_SECRET || '',
    encryption: {
      algorithm: 'aes-256-gcm',
      key: process.env.ENCRYPTION_KEY || '',
    },
  },
  monitoring: {
    sentry: process.env.SENTRY_DSN
      ? { dsn: process.env.SENTRY_DSN }
      : undefined,
    datadog: process.env.DATADOG_API_KEY
      ? { apiKey: process.env.DATADOG_API_KEY }
      : undefined,
  },
};

/**
 * Validate required configuration
 */
export function validateConfig(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.database.url) {
    errors.push('DATABASE_URL is required');
  }

  if (!config.ai.openai.apiKey && !config.ai.anthropic.apiKey) {
    errors.push('At least one AI API key (OPENAI_API_KEY or ANTHROPIC_API_KEY) is required');
  }

  if (!config.security.jwtSecret) {
    errors.push('JWT_SECRET is required');
  }

  if (!config.security.sessionSecret) {
    errors.push('SESSION_SECRET is required');
  }

  if (!config.security.encryption.key || config.security.encryption.key.length < 32) {
    errors.push('ENCRYPTION_KEY must be at least 32 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get feature flags
 */
export const features = {
  mfa: process.env.ENABLE_MFA === 'true',
  oauth: process.env.ENABLE_OAUTH === 'true',
  templateGeneration: process.env.ENABLE_TEMPLATE_GENERATION === 'true',
  bulkProcessing: process.env.ENABLE_BULK_PROCESSING === 'true',
  soc2AuditLog: process.env.SOC2_AUDIT_LOG === 'true',
  fdcpaStrictMode: process.env.FDCPA_STRICT_MODE === 'true',
};

/**
 * Rate limiting configuration
 */
export const rateLimits = {
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
};

export default config;
