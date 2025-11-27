/**
 * API Client Configuration
 * Centralizes URL and header configuration for all requests
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const getApiUrl = (): string => {
  if (typeof window === 'undefined') {
    // Server-side: prefer an explicit API URL from env, otherwise default
    // to localhost with the current server port so server-side fetches to
    // internal Next API routes work during development.
    return process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`;
  }
  // Client-side
  return API_BASE_URL;
};

export const getAuthHeader = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? getTokenCookie() : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const apiCall = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const isInternalApi = endpoint.startsWith('/api');

  // On the server, fetch requires an absolute URL. For internal Next API
  // routes we must prefix with the API server origin when running server-side.
  const url = (isInternalApi && typeof window === 'undefined')
    ? `${getApiUrl()}${endpoint}`
    : (isInternalApi ? endpoint : `${getApiUrl()}${endpoint}`);

  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  // When calling internal Next API routes we prefer a relative URL so the
  // browser uses the same origin and avoids CORS or wrong-host issues in dev.
  const fetchInit: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(url, fetchInit);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data as T;
};

/**
 * Secure cookie configuration for tokens
 */
export const setTokenCookie = (token: string): void => {
  if (typeof document !== 'undefined') {
    document.cookie = `auth_token=${token}; path=/; secure; samesite=strict; max-age=3600`;
  }
};

export const getTokenCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const name = 'auth_token=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return null;
};

export const removeTokenCookie = (): void => {
  if (typeof document !== 'undefined') {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; secure; samesite=strict';
  }
};
