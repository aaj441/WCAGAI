/**
 * Application configuration module
 * Loads and validates environment variables, providing typed configuration objects
 */

import { z } from 'zod';

// Configuration schema with validation
const ConfigSchema = z.object({
  redis: z.object({
    url: z.string().url().default('redis://localhost:6379'),
    password: z.string().optional(),
    maxRetries: z.number().min(1).max(10).default(3),
    retryBackoff: z.number().min(100).max(5000).default(1000),
    connectTimeout: z.number().min(1000).max(10000).default(5000)
  }),
  security: z.object({
    idempotencyTTL: z.number().min(60).max(86400 * 7).default(86400), // 1 day default, max 7 days
    scanRateLimit: z.number().min(1).max(1000).default(100), // Scans per hour
    maxUrlLength: z.number().min(10).max(2048).default(2048),
    maxKeywordsLength: z.number().min(1).max(1000).default(100)
  }),
  ai: z.object({
    openAiKey: z.string().min(1),
    claudeKey: z.string().optional(),
    maxRetries: z.number().min(1).max(5).default(3),
    timeoutMs: z.number().min(1000).max(30000).default(15000)
  })
});

// Type inference from schema
export type Config = z.infer<typeof ConfigSchema>;

function loadConfig(): Config {
  try {
    const config = {
      redis: {
        url: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD,
        maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
        retryBackoff: parseInt(process.env.REDIS_RETRY_BACKOFF || '1000'),
        connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '5000')
      },
      security: {
        idempotencyTTL: parseInt(process.env.IDEMPOTENCY_TTL || '86400'),
        scanRateLimit: parseInt(process.env.SCAN_RATE_LIMIT || '100'),
        maxUrlLength: parseInt(process.env.MAX_URL_LENGTH || '2048'),
        maxKeywordsLength: parseInt(process.env.MAX_KEYWORDS_LENGTH || '100')
      },
      ai: {
        openAiKey: process.env.OPENAI_API_KEY || '',
        claudeKey: process.env.CLAUDE_API_KEY,
        maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3'),
        timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '15000')
      }
    };

    // Validate configuration
    return ConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n');
      throw new Error(`Invalid configuration:\n${issues}`);
    }
    throw error;
  }
}

// Export singleton configuration
export const config = loadConfig();