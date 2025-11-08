/**
 * SSRF protection middleware for preventing scans of private/internal IP ranges.
 * Blocks requests to localhost, private IPs, metadata endpoints, etc.
 */

import * as dns from 'dns';
import { promisify } from 'util';
import { NextRequest, NextResponse } from 'next/server';
import ipRangeCheck from 'ip-range-check';

const lookup = promisify(dns.lookup);

// Blocked IP ranges and hostnames
const BLOCKED_RANGES = [
  '127.0.0.0/8',    // Loopback
  '10.0.0.0/8',     // Private network
  '172.16.0.0/12',  // Private network
  '192.168.0.0/16', // Private network
  '169.254.0.0/16', // Link-local
  'fc00::/7',       // Unique local addresses
];

const BLOCKED_HOSTNAMES = [
  'localhost',
  '0.0.0.0',
  '[::]',
  'metadata.google.internal', // GCP metadata
  '169.254.169.254',         // AWS/GCP metadata
  'metadata.azure.internal'   // Azure metadata
];

export class SSRFProtection {
  /**
   * Check if hostname resolves to blocked IP
   */
  private static async isBlockedIP(hostname: string): Promise<boolean> {
    try {
      // Try IPv4 lookup first
      const { address } = await lookup(hostname, 4);
      return BLOCKED_RANGES.some(range => ipRangeCheck(address, range));
    } catch {
      try {
        // Try IPv6 if IPv4 fails
        const { address } = await lookup(hostname, 6);
        return BLOCKED_RANGES.some(range => ipRangeCheck(address, range));
      } catch {
        // DNS lookup failed, block by default
        return true;
      }
    }
  }

  /**
   * Check if hostname is explicitly blocked
   */
  private static isBlockedHostname(hostname: string): boolean {
    return BLOCKED_HOSTNAMES.some(blocked => 
      hostname === blocked || hostname.endsWith(`.${blocked}`)
    );
  }

  /**
   * Validate URL is safe to scan
   */
  static async validateUrl(urlString: string): Promise<boolean> {
    try {
      const url = new URL(urlString);
      
      // Only allow http(s) protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        return false;
      }

      // Check hostname blocklist
      if (this.isBlockedHostname(url.hostname)) {
        return false;
      }

      // Check IP ranges
      if (await this.isBlockedIP(url.hostname)) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Middleware function for Next.js API routes
   */
  static async middleware(request: NextRequest) {
    // Only check POST requests to scan endpoints
    if (request.method !== 'POST' || !request.url.includes('/api/scan')) {
      return NextResponse.next();
    }

    try {
      const body = await request.json();
      const url = body.url || body.input;

      if (!url) {
        return NextResponse.json(
          { error: 'No URL provided' },
          { status: 400 }
        );
      }

      const isValid = await this.validateUrl(url);
      if (!isValid) {
        return NextResponse.json(
          { error: 'URL not allowed for security reasons' },
          { status: 403 }
        );
      }

      return NextResponse.next();
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }
  }
}

export function withSSRFProtection(handler: Function) {
  return async function(req: NextRequest, ...args: any[]) {
    // Only check POST requests to scan endpoints
    if (req.method === 'POST' && req.url.includes('/api/scan')) {
      try {
        const body = await req.json();
        const url = body.url || body.input;

        if (!url) {
          return NextResponse.json(
            { error: 'No URL provided' },
            { status: 400 }
          );
        }

        const isValid = await SSRFProtection.validateUrl(url);
        if (!isValid) {
          return NextResponse.json(
            { error: 'URL not allowed for security reasons' },
            { status: 403 }
          );
        }
      } catch (err) {
        return NextResponse.json(
          { error: 'Invalid request' },
          { status: 400 }
        );
      }
    }

    return handler(req, ...args);
  };
}