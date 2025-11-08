# Security Middleware Documentation

## Overview

This document describes the security middleware implementations for the WCAGAI platform, including idempotency handling and SSRF protection.

## Table of Contents

1. [Idempotency Middleware](#idempotency-middleware)
2. [SSRF Protection](#ssrf-protection)
3. [Configuration](#configuration)
4. [Error Handling](#error-handling)
5. [Examples](#examples)

## Idempotency Middleware

The idempotency middleware ensures that repeated scan requests with the same idempotency key return cached results rather than initiating new scans.

### Usage

```typescript
// In your API route
import { withIdempotency } from '@/middleware/idempotency';

export const POST = withIdempotency(async (req) => {
  // Your handler code
});
```

### HTTP Headers

- Request: `Idempotency-Key: <unique-key>`
- Response: 
  - `X-Idempotent-Replayed: true` (when serving cached result)
  - `X-Idempotent-Key: <key>` (echoed back)

### Example Request

```bash
curl -X POST https://api.wcagai.com/scan \
  -H "Idempotency-Key: scan-123" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## SSRF Protection

The SSRF protection middleware prevents scanning of internal/private networks and cloud metadata endpoints.

### Protected Resources

- Localhost (`127.0.0.1`, `::1`)
- Private networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
- Link-local (`169.254.0.0/16`)
- Cloud metadata endpoints
- Non-HTTP(S) protocols

### Usage

```typescript
import { withSSRFProtection } from '@/middleware/ssrf-protection';

export const POST = withSSRFProtection(async (req) => {
  // Your handler code
});
```

## Configuration

Configuration is managed through environment variables:

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=optional_password
REDIS_MAX_RETRIES=3
REDIS_RETRY_BACKOFF=1000
REDIS_CONNECT_TIMEOUT=5000

# Security Configuration
IDEMPOTENCY_TTL=86400
SCAN_RATE_LIMIT=100
MAX_URL_LENGTH=2048
MAX_KEYWORDS_LENGTH=100
```

## Error Handling

The middleware uses custom error classes for different scenarios:

```typescript
import { 
  ValidationError,
  SecurityError,
  RateLimitError,
  IdempotencyError
} from '@/errors';

// Example usage
if (isPrivateIP(hostname)) {
  throw new SecurityError('Private IP scanning not allowed');
}
```

## Examples

### Complete API Route Example

```typescript
import { withIdempotency, withSSRFProtection } from '@/middleware/security';

async function handler(req: NextRequest) {
  const { url, keywords } = await req.json();
  
  // Start scan
  const result = await startScan(url, keywords);
  
  return NextResponse.json(result);
}

// Apply middleware stack
export const POST = withIdempotency(withSSRFProtection(handler));
```

### Error Responses

```json
// 403 Security Error
{
  "error": {
    "message": "Private IP scanning not allowed",
    "code": "SECURITY_ERROR"
  }
}

// 409 Idempotency Error
{
  "error": {
    "message": "Duplicate idempotency key",
    "code": "IDEMPOTENCY_ERROR"
  }
}
```

## Testing

Run the test suite:

```bash
npm test

# Run specific tests
npm test -- middleware.test.ts
```

## Security Considerations

1. Always validate URLs before scanning
2. Use proper HTTPS for all API endpoints
3. Implement rate limiting
4. Monitor for abuse patterns
5. Keep dependencies updated

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - Copyright (c) 2025 WCAGAI