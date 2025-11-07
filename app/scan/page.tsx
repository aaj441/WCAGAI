"use client";

import React, { useState, useRef, useEffect } from 'react';

// Status types for semantic meaning and consistent styling
type Status = 'error' | 'success' | 'info' | null;

// Form validation types
type ValidationState = {
  url: string[];
  keywords: string[];
};

export default function ScanPage() {
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationState>({ url: [], keywords: [] });
  const [announcement, setAnnouncement] = useState<string>('');
  
  // Refs for focus management
  const mainContentRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const base = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_BACKEND_URL || '' : '';
  const apiBase = base || window.location.origin;

  // Ensure mainContent is focused on mount for keyboard users who used skip link
  const focusMainContent = () => {
    mainContentRef.current?.focus();
  };

  // Handle live announcements for screen readers
  useEffect(() => {
    if (announcement) {
      const timeout = setTimeout(() => setAnnouncement(''), 1000);
      return () => clearTimeout(timeout);
    }
  }, [announcement]);

  const setStatusMessage = (text: string, type: Status = 'info') => {
    setMessage(text);
    setStatus(type);
    // Set announcement for immediate screen reader feedback
    setAnnouncement(text);
    // Move focus to results for important messages
    if (type === 'error' || type === 'success') {
      resultsRef.current?.focus();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationState = {
      url: [],
      keywords: []
    };

    // URL validation
    if (!url) {
      newErrors.url.push('Please enter a URL to scan');
    } else {
      try {
        new URL(url);
      } catch {
        newErrors.url.push('Please enter a valid URL including protocol (e.g., https://example.com)');
      }
    }

    // Keywords validation (optional but must be comma-separated if provided)
    if (keywords && !keywords.split(',').every(k => k.trim())) {
      newErrors.keywords.push('Keywords must be comma-separated values');
    }

    setErrors(newErrors);
    return !newErrors.url.length && !newErrors.keywords.length;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setStatus(null);
    setScanId(null);
    
    if (!validateForm()) {
      const errorMessage = errors.url[0] || errors.keywords[0] || 'Please fix the form errors.';
      setStatusMessage(errorMessage, 'error');
      return;
    }

    setLoading(true);
    setStatusMessage('Starting scan...', 'info');

    try {
      const res = await fetch(`${apiBase}/api/scan/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, keywords: keywords.split(',').map(k => k.trim()).filter(Boolean) }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Scan request failed: ${res.status} ${text}`);
      }

      const json = await res.json();
      if (json && json.scan_id) {
        setScanId(String(json.scan_id));
        setStatusMessage('Scan started successfully — check status below.', 'success');
      } else {
        setStatusMessage('Scan request accepted (no id returned).', 'info');
      }
    } catch (err: any) {
      setStatusMessage(err?.message || String(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get color and icon for status
  const getStatusStyles = (type: Status) => {
    switch (type) {
      case 'error':
        return {
          bg: '#fef2f2',
          border: '#fee2e2',
          text: '#991b1b',
          icon: '⚠️'
        };
      case 'success':
        return {
          bg: '#f0fdf4',
          border: '#dcfce7',
          text: '#166534',
          icon: '✓'
        };
      case 'info':
      default:
        return {
          bg: '#f4f6f8',
          border: '#e2e8f0',
          text: '#1e293b',
          icon: 'ℹ️'
        };
    }
  };

  return (
    <>
      {/* Skip link - hidden until focused */}
      <a
        href="#main-content"
        onClick={focusMainContent}
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0
        }}
        onFocus={(e) => {
          e.currentTarget.style.position = 'fixed';
          e.currentTarget.style.top = '0.5rem';
          e.currentTarget.style.left = '0.5rem';
          e.currentTarget.style.width = 'auto';
          e.currentTarget.style.height = 'auto';
          e.currentTarget.style.padding = '1rem';
          e.currentTarget.style.margin = '0';
          e.currentTarget.style.clip = 'auto';
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.zIndex = '100';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.25)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.position = 'absolute';
          e.currentTarget.style.width = '1px';
          e.currentTarget.style.height = '1px';
          e.currentTarget.style.padding = '0';
          e.currentTarget.style.margin = '-1px';
          e.currentTarget.style.overflow = 'hidden';
          e.currentTarget.style.clip = 'rect(0, 0, 0, 0)';
          e.currentTarget.style.whiteSpace = 'nowrap';
          e.currentTarget.style.borderWidth = '0';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        Skip to main content
      </a>

      <main
        ref={mainContentRef}
        id="main-content"
        tabIndex={-1}
        style={{
          padding: 24,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          outline: 'none'
        }}
      >
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>WCAGAI — Scanner</h1>
        <p style={{ color: '#4b5563', marginBottom: 24 }}>
          Enter a URL and optional keywords to start an accessibility scan. The backend will schedule the scan and return a scan id.
        </p>

        <form onSubmit={submit} aria-labelledby="scan-form-title">
          <div style={{ marginBottom: 20 }}>
            <label
              htmlFor="scan-url"
              style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}
            >
              URL to scan
            </label>
            <input
              id="scan-url"
              name="url"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setErrors(prev => ({ ...prev, url: [] }));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  document.getElementById('scan-keywords')?.focus();
                }
              }}
              placeholder="https://example.com"
              required
              aria-invalid={errors.url.length > 0}
              aria-describedby={`scan-url-help ${errors.url.length ? 'scan-url-error' : ''}`}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem',
                borderRadius: 6,
                border: '1px solid #d1d5db',
                marginBottom: 4,
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.12)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
            <div
              id="scan-url-help"
              style={{ fontSize: 12, color: '#6b7280' }}
            >
              Provide the full URL (including protocol). The scan runs on the backend and may take a few moments.
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              htmlFor="scan-keywords"
              style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}
            >
              Optional keywords (comma separated)
            </label>
            <textarea
              id="scan-keywords"
              name="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="navigation, header, login"
              rows={3}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem',
                borderRadius: 6,
                border: '1px solid #d1d5db',
                marginBottom: 4,
                outline: 'none',
                resize: 'vertical'
              }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.12)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
            <div
              id="keywords-help"
              style={{ fontSize: 12, color: '#6b7280' }}
            >
              Add keywords to help focus the scan on specific page regions or components.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: loading ? '#94a3b8' : '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: loading ? 'wait' : 'pointer',
                fontWeight: 500,
                outline: 'none',
                transition: 'all 0.15s ease-in-out'
              }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.25)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            >
              {loading ? (
                <>
                  <span aria-hidden="true" style={{ marginRight: 8 }}>⏳</span>
                  Starting scan...
                </>
              ) : (
                <>
                  <span aria-hidden="true" style={{ marginRight: 8 }}>🔍</span>
                  Start scan
                </>
              )}
            </button>

            <a
              href="/"
              style={{
                color: '#1976d2',
                textDecoration: 'none',
                padding: '0.5rem 0.75rem',
                borderRadius: 4,
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.12)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            >
              Back to home
            </a>
          </div>
        </form>

        <div
          ref={resultsRef}
          tabIndex={-1}
          aria-live="polite"
          aria-atomic="true"
          style={{
            marginTop: 32,
            outline: 'none'
          }}
        >
          {message && status && (
            <div
              role={status === 'error' ? 'alert' : 'status'}
              style={{
                padding: 16,
                backgroundColor: getStatusStyles(status).bg,
                border: `1px solid ${getStatusStyles(status).border}`,
                borderRadius: 6,
                color: getStatusStyles(status).text,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12
              }}
            >
              <span aria-hidden="true" style={{ fontSize: 18 }}>
                {getStatusStyles(status).icon}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 500 }}>{message}</p>
                {status === 'error' && (
                  <p style={{ margin: '8px 0 0 0', fontSize: 14 }}>
                    Please try again or check the URL is correct.
                  </p>
                )}
              </div>
            </div>
          )}

          {scanId && (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                backgroundColor: '#f8fafc',
                borderRadius: 6,
                border: '1px solid #e2e8f0'
              }}
            >
              <h2 style={{ fontSize: 16, margin: '0 0 8px 0' }}>Track your scan</h2>
              <p style={{ margin: '0 0 12px 0', fontSize: 14, color: '#475569' }}>
                Your scan is now running. Use this link to check its status:
              </p>
              <a
                href={`/api/scan/status/${scanId}`}
                style={{
                  display: 'inline-block',
                  color: '#1976d2',
                  textDecoration: 'none',
                  padding: '8px 12px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: 4,
                  border: '1px solid #e2e8f0',
                  fontSize: 14,
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.12)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              >
                View scan status
                <span className="sr-only"> for scan ID {scanId}</span>
              </a>
              <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
                Scan ID: <code>{scanId}</code>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
