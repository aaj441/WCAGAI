/**
 * Environment Variable Guards
 * Provides safe access to environment variables with fallbacks
 * Prevents module-level execution errors in serverless functions
 */

// Backend URL with fallback
export const getBackendUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL;
  
  // Fallback to localhost in development
  if (!url) {
    console.warn('[EnvGuard] NEXT_PUBLIC_BACKEND_URL not configured, using fallback');
    return typeof window !== 'undefined' ? 'http://localhost:8000' : 'http://localhost:8000';
  }
  
  return url;
};

// API endpoint builder with error handling
export const buildApiUrl = (path: string): string => {
  try {
    const baseUrl = getBackendUrl();
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  } catch (error) {
    console.error('[EnvGuard] Error building API URL:', error);
    return `http://localhost:8000${path}`;
  }
};

// Check if backend is configured
export const isBackendConfigured = (): boolean => {
  return !!process.env.NEXT_PUBLIC_BACKEND_URL;
};

// Check if running in serverless environment
export const isServerless = (): boolean => {
  return typeof process !== 'undefined' && process.env.VERCEL === 'true';
};

// Get environment info for debugging
export const getEnvironmentInfo = () => {
  return {
    backendUrl: getBackendUrl(),
    isServerless: isServerless(),
    isBackendConfigured: isBackendConfigured(),
    nodeEnv: process.env.NODE_ENV,
    environment: process.env.VERCEL_ENV || 'development',
  };
};
