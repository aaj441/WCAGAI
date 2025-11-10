'use client';

import React, { useEffect } from 'react';

/**
 * Global Error Boundary
 * Catches errors from any child component
 * Provides graceful error handling in serverless
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ErrorBoundary] Application error:', error);
  }, [error]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        maxWidth: '600px',
        textAlign: 'center',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{
          fontSize: '32px',
          marginBottom: '16px',
          color: '#d32f2f',
        }}>
          Something went wrong
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '24px',
          lineHeight: '1.6',
        }}>
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        
        {error.digest && (
          <p style={{
            fontSize: '12px',
            color: '#999',
            marginBottom: '24px',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
          }}>
            Error ID: {error.digest}
          </p>
        )}
        
        <button
          onClick={() => reset()}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'white',
            backgroundColor: '#1976d2',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1565c0')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#1976d2')}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
