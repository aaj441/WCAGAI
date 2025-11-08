"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "../components/Button";
import { ErrorMessage } from "../components/ErrorMessage";

type Status = "error" | "success" | "info" | null;

export default function ScanPage() {
  const [url, setUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ url: string[]; keywords: string[] }>({ url: [], keywords: [] });

  const resultsRef = useRef<HTMLDivElement | null>(null);
  const apiBase = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BACKEND_URL) || "";

  useEffect(() => {
    if (message && (status === "error" || status === "success")) {
      resultsRef.current?.focus();
    }
  }, [message, status]);

  const setStatusMessage = (text: string, type: Status = "info") => {
    setMessage(text);
    setStatus(type);
  };

  const validate = (value: string) => {
    if (!value) return "Please enter a URL to scan";
    try {
      new URL(value);
      return null;
    } catch {
      return "Please include the protocol (e.g. https://example.com)";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setStatus(null);
    setScanId(null);

    const urlError = validate(url);
    setErrors({ url: urlError ? [urlError] : [], keywords: [] });
    if (urlError) {
      setStatusMessage(urlError, "error");
      return;
    }

    setLoading(true);
    setStatusMessage("Starting scan...", "info");

    try {
      const res = await fetch(`${apiBase || ""}/api/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean) }),
      });

      if (!res.ok) throw new Error(`Scan request failed: ${res.status}`);
      const json = await res.json();
      if (json?.scan_id) {
        setScanId(String(json.scan_id));
        setStatusMessage("Scan started successfully", "success");
      } else {
        setStatusMessage("Scan request accepted", "info");
      }
    } catch (err: any) {
      setStatusMessage(err?.message || String(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 md:p-8">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Start an accessibility scan</h1>
            <p className="mt-1 text-sm text-gray-600">Paste a URL or upload HTML to analyze accessibility issues and receive prioritized fixes.</p>
          </header>

          {message && (
            <div className="mb-4">
              {status === "error" ? (
                <ErrorMessage message={message} />
              ) : (
                <div className={`p-3 rounded-md border ${status === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-blue-50 border-blue-200 text-blue-800"}`} role="status">
                  {message}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="scan-form-title">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">Website URL</label>
              <div className="mt-1">
                <input
                  id="url"
                  name="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  aria-invalid={errors.url.length > 0}
                  aria-describedby={errors.url.length ? "url-error" : undefined}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              {errors.url.length > 0 && <p id="url-error" className="mt-2 text-sm text-red-600">{errors.url[0]}</p>}
            </div>

            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">Optional keywords</label>
              <div className="mt-1">
                <textarea
                  id="keywords"
                  name="keywords"
                  rows={3}
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="navigation, header, login"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">Keywords help focus the scan on specific areas (comma-separated).</p>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" isLoading={loading} disabled={loading}>Start scan</Button>
              <Button type="button" variant="outline" onClick={() => { setUrl(""); setKeywords(""); setErrors({ url: [], keywords: [] }); }}>Clear</Button>
              <a href="/" className="ml-auto text-sm text-blue-600 hover:underline">Back to home</a>
            </div>
          </form>

          <div ref={resultsRef} tabIndex={-1} className="mt-6">
            {scanId && (
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                <h2 className="text-sm font-medium text-gray-900">Scan started</h2>
                <p className="mt-1 text-sm text-gray-600">Scan ID: <code className="font-mono">{scanId}</code></p>
                <div className="mt-3">
                  <a href={`/scan/${scanId}`} className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-blue-600 bg-white border border-gray-200 hover:bg-gray-50">View results</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
