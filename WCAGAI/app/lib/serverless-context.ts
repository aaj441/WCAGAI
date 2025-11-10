/**
 * Serverless Context Helper
 * Provides graceful degradation for serverless environments
 * Handles initialization timing and cold starts
 */

import { getBackendUrl, isServerless } from '@/app/utils/env-guards';

type ServerlessContextType = {
  isServerless: boolean;
  isInitialized: boolean;
  backendUrl: string | null;
  error: string | null;
};

let contextCache: ServerlessContextType | null = null;
let initPromise: Promise<ServerlessContextType> | null = null;

/**
 * Initialize serverless context safely
 * Deferred initialization prevents cold-start errors
 */
export const initializeServerlessContext = async (): Promise<ServerlessContextType> => {
  // Return cached value if already initialized
  if (contextCache) {
    return contextCache;
  }

  // Return existing promise if already initializing
  if (initPromise) {
    return initPromise;
  }

  // Create new initialization promise
  initPromise = (async () => {
    try {
      const context: ServerlessContextType = {
        isServerless: isServerless(),
        isInitialized: true,
        backendUrl: getBackendUrl(),
        error: null,
      };
      contextCache = context;
      return context;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[ServerlessContext] Initialization failed:', errorMessage);
      const fallbackContext: ServerlessContextType = {
        isServerless: isServerless(),
        isInitialized: false,
        backendUrl: null,
        error: errorMessage,
      };
      contextCache = fallbackContext;
      return fallbackContext;
    }
  })();

  return initPromise;
};

/**
 * Get cached serverless context synchronously
 * Returns null if not yet initialized
 */
export const getServerlessContext = (): ServerlessContextType | null => {
  return contextCache;
};

/**
 * Check if running in serverless with proper error handling
 */
export const isInServerless = (): boolean => {
  try {
    return isServerless();
  } catch {
    return false;
  }
};

/**
 * Get backend URL with automatic initialization
 * Safe for use in components with proper error handling
 */
export const getServerlessBackendUrl = async (): Promise<string | null> => {
  try {
    const context = await initializeServerlessContext();
    return context.backendUrl;
  } catch (error) {
    console.error('[ServerlessContext] Failed to get backend URL:', error);
    return null;
  }
};
