import { NextRequest, NextResponse } from 'next/server';
import { withIdempotency } from '../../middleware/idempotency';
import { withSSRFProtection } from '../../middleware/ssrf-protection';

async function handler(req: NextRequest): Promise<NextResponse> {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  try {
    const body = await req.json();
    const { url, keywords = [] } = body;

    // Validate required fields
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Start scan process
    // ... existing scan logic here ...

    return NextResponse.json({
      message: 'Scan started successfully',
      scan_id: 'generated_id',
      url,
      keywords
    });

  } catch (error: any) {
    console.error('Scan request failed:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    );
  }
}

// Apply middlewares in correct order:
// 1. SSRF Protection (blocks malicious URLs)
// 2. Idempotency (prevents duplicate scans)
export const POST = withIdempotency(withSSRFProtection(handler));