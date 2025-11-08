"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const mainRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Focus main content on mount for accessibility
  useEffect(() => {
    mainRef.current?.focus();
  }, []);

  return (
    <main
      ref={mainRef}
      tabIndex={-1}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: '#fef2f2',
        outline: 'none'
      }}
    >
      <div
        style={{
          maxWidth: '32rem',
          textAlign: 'center'
        }}
      >
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 600,
            marginBottom: '1rem',
            color: '#991b1b'
          }}
        >
          Something went wrong!
        </h1>

        <p
          style={{
            marginBottom: '2rem',
            color: '#b91c1c'
          }}
        >
          {error.message || 'An unexpected error occurred while processing your request.'}
        </p>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center'
          }}
        >
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              outline: 'none'
            }}
            onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.25)'}
            onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            Try again
          </button>

          <button
            onClick={() => router.push('/')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: '#dc2626',
              border: '1px solid currentColor',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              outline: 'none'
            }}
            onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.25)'}
            onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            Return home
          </button>
        </div>

        {error.digest && (
          <p
            style={{
              marginTop: '2rem',
              fontSize: '0.875rem',
              color: '#64748b'
            }}
          >
            Error ID: <code>{error.digest}</code>
          </p>
        )}
      </div>
    </main>
  );
}