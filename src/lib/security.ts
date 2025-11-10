/**
 * Encryption & Security Utilities
 * 
 * AES-256-GCM encryption for sensitive data (SOC 2 compliance)
 */

import crypto from 'crypto';
import { config } from './config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Encrypt sensitive data using AES-256-GCM
 */
export function encrypt(text: string): string {
  try {
    // Generate random IV and salt
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Derive key from encryption key
    const key = crypto.pbkdf2Sync(
      config.security.encryption.key,
      salt,
      ITERATIONS,
      KEY_LENGTH,
      'sha512'
    );

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get auth tag
    const tag = cipher.getAuthTag();

    // Combine salt, iv, tag, and encrypted data
    const result = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')]);

    return result.toString('base64');
  } catch (error) {
    console.error('[Encryption] Encryption failed:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt data encrypted with AES-256-GCM
 */
export function decrypt(encryptedData: string): string {
  try {
    // Decode from base64
    const buffer = Buffer.from(encryptedData, 'base64');

    // Extract salt, IV, tag, and encrypted data
    const salt = buffer.slice(0, SALT_LENGTH);
    const iv = buffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = buffer.slice(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + TAG_LENGTH
    );
    const encrypted = buffer.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    // Derive key
    const key = crypto.pbkdf2Sync(
      config.security.encryption.key,
      salt,
      ITERATIONS,
      KEY_LENGTH,
      'sha512'
    );

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    // Decrypt
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('[Encryption] Decryption failed:', error);
    throw new Error('Decryption failed');
  }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 12);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
}

/**
 * Generate secure random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate API key
 */
export function generateApiKey(): string {
  const prefix = 'wcag_';
  const key = crypto.randomBytes(32).toString('base64url');
  return `${prefix}${key}`;
}

/**
 * Hash API key for storage
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length);
  }
  return '*'.repeat(data.length - visibleChars) + data.slice(-visibleChars);
}

/**
 * Generate TOTP secret for MFA
 */
export function generateMFASecret(): string {
  return crypto.randomBytes(20).toString('base64url');
}

/**
 * Verify TOTP token
 */
export async function verifyMFAToken(
  secret: string,
  token: string
): Promise<boolean> {
  try {
    const { authenticator } = await import('otplib');
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error('[MFA] Token verification failed:', error);
    return false;
  }
}

/**
 * Generate MFA QR code URL
 */
export async function generateMFAQRCode(
  secret: string,
  email: string
): Promise<string> {
  try {
    const { authenticator } = await import('otplib');
    const otpauth = authenticator.keyuri(
      email,
      'WCAG AI Platform',
      secret
    );
    return otpauth;
  } catch (error) {
    console.error('[MFA] QR code generation failed:', error);
    throw new Error('QR code generation failed');
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Validate URL safety
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    // Block localhost and private IPs in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = parsed.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.16.')
      ) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Rate limit key generation
 */
export function getRateLimitKey(
  identifier: string,
  resource: string
): string {
  return `ratelimit:${resource}:${identifier}`;
}

/**
 * Create HMAC signature
 */
export function createSignature(
  data: string,
  secret: string = config.security.jwtSecret
): string {
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
}

/**
 * Verify HMAC signature
 */
export function verifySignature(
  data: string,
  signature: string,
  secret: string = config.security.jwtSecret
): boolean {
  const expectedSignature = createSignature(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
