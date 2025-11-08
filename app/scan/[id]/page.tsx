"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Violation } from '@/types';

interface ScanResultProps {
  id: string;
  url: string;
  violations: Violation[];
  keywords?: string[];
  timestamp: string;
}

export default function ScanResultPage({ params }: { params: { id: string } }) {
  const mainRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [result, setResult] = useState<ScanResultProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(`/api/scan/${params.id}`);
        if (!res.ok) {
          throw new Error('Failed to load scan results');
        }
        const data = await res.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [params.id]);

  // Focus main content on mount for accessibility
  useEffect(() => {
    mainRef.current?.focus();
  }, []);

  if (loading) {
    return (
      <main
        ref={mainRef}
        tabIndex={-1}
        style={{
          padding: 24,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          outline: 'none'
        }}
      >
        <div role="status" aria-live="polite">
          <p>Loading scan results...</p>
        </div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main
        ref={mainRef}
        tabIndex={-1}
        style={{
          padding: 24,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          outline: 'none'
        }}
      >
        <div role="alert">
          <h1 style={{ fontSize: 28, marginBottom: 8, color: '#dc2626' }}>
            Error Loading Results
          </h1>
          <p style={{ marginBottom: 16 }}>{error}</p>
          <button
            onClick={() => router.push('/scan')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              outline: 'none'
            }}
            onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.25)'}
            onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            Start New Scan
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      ref={mainRef}
      tabIndex={-1}
      style={{
        padding: 24,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        outline: 'none'
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>
          Scan Results
        </h1>

        <div
          style={{
            marginBottom: 24,
            padding: 16,
            backgroundColor: '#f8fafc',
            borderRadius: 6,
            border: '1px solid #e2e8f0'
          }}
        >
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>Scan Details</h2>
          <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8 }}>
            <dt style={{ fontWeight: 600 }}>URL:</dt>
            <dd style={{ margin: 0 }}>{result.url}</dd>
            <dt style={{ fontWeight: 600 }}>Scan ID:</dt>
            <dd style={{ margin: 0 }}>{result.id}</dd>
            <dt style={{ fontWeight: 600 }}>Date:</dt>
            <dd style={{ margin: 0 }}>{new Date(result.timestamp).toLocaleString()}</dd>
            {result.keywords?.length && (
              <>
                <dt style={{ fontWeight: 600 }}>Keywords:</dt>
                <dd style={{ margin: 0 }}>{result.keywords.join(', ')}</dd>
              </>
            )}
          </dl>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, marginBottom: 16 }}>
            Violations ({result.violations.length})
          </h2>

          {result.violations.length === 0 ? (
            <p style={{ color: '#16a34a' }}>
              No violations found! 🎉
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {result.violations.map((violation, index) => (
                <div
                  key={`${violation.id}-${index}`}
                  style={{
                    padding: 16,
                    backgroundColor: 'white',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <h3
                    style={{
                      fontSize: 16,
                      marginBottom: 8,
                      color: violation.impact === 'critical' ? '#dc2626' :
                             violation.impact === 'serious' ? '#ea580c' :
                             violation.impact === 'moderate' ? '#d97706' : '#1e293b'
                    }}
                  >
                    {violation.description}
                  </h3>

                  <div style={{ marginBottom: 12 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        backgroundColor: violation.impact === 'critical' ? '#fee2e2' :
                                       violation.impact === 'serious' ? '#ffedd5' :
                                       violation.impact === 'moderate' ? '#fef3c7' : '#f1f5f9',
                        borderRadius: 4,
                        fontSize: 14,
                        color: violation.impact === 'critical' ? '#991b1b' :
                               violation.impact === 'serious' ? '#9a3412' :
                               violation.impact === 'moderate' ? '#92400e' : '#475569'
                      }}
                    >
                      {violation.impact}
                    </span>
                  </div>

                  {violation.html && (
                    <pre
                      style={{
                        padding: 12,
                        backgroundColor: '#f8fafc',
                        borderRadius: 4,
                        fontSize: 14,
                        overflow: 'auto'
                      }}
                    >
                      <code>{violation.html}</code>
                    </pre>
                  )}

                  {violation.fixes?.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <h4 style={{ fontSize: 14, marginBottom: 4 }}>
                        Suggested Fixes:
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {violation.fixes.map((fix, i) => (
                          <li key={i} style={{ marginBottom: 4 }}>
                            {fix}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => window.print()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'white',
              color: '#1976d2',
              border: '1px solid currentColor',
              borderRadius: 6,
              cursor: 'pointer',
              outline: 'none'
            }}
            onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.25)'}
            onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            Export Results
          </button>

          <button
            onClick={() => router.push('/scan')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              outline: 'none'
            }}
            onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.25)'}
            onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            Start New Scan
          </button>
        </div>
      </div>
    </main>
  );
}