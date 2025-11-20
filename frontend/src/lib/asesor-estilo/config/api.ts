/**
 * Centralized API configuration for Personal_shoper
 * This file abstracts all API endpoints to make integration with main site easier
 */

export const API_CONFIG = {
  // Base URL for all API calls - can be overridden via environment
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api/asesor-estilo',
  
  // API timeout in milliseconds
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  
  // Max retries for failed requests
  MAX_RETRIES: parseInt(process.env.NEXT_PUBLIC_API_MAX_RETRIES || '3', 10),
  
  // Retry delay in milliseconds
  RETRY_DELAY: parseInt(process.env.NEXT_PUBLIC_API_RETRY_DELAY || '300', 10),
};

export const API_ENDPOINTS = {
  // Upload endpoint
  UPLOAD: `${API_CONFIG.BASE_URL}/upload`,
  
  // Analysis endpoint
  ANALYZE: `${API_CONFIG.BASE_URL}/analyze`,
  
  // Image iteration/editing endpoint
  ITERATE: `${API_CONFIG.BASE_URL}/iterate`,
  
  // Moderation endpoint
  MODERATE: `${API_CONFIG.BASE_URL}/moderate`,
  
  // Admin/registry endpoints
  REGISTRY: `${API_CONFIG.BASE_URL}/admin/registry`,
} as const;

/**
 * Get the full API endpoint URL
 * Useful for constructing fetch requests
 */
export function getApiUrl(endpoint: keyof typeof API_ENDPOINTS): string {
  return API_ENDPOINTS[endpoint];
}

/**
 * Configuration for upload behavior
 */
export const UPLOAD_CONFIG = {
  MAX_SIZE_MB: parseInt(process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE_MB || '10', 10),
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

/**
 * Configuration for UI locale and strings
 */
export const UI_CONFIG = {
  LOCALE: process.env.NEXT_PUBLIC_LOCALE || 'es',
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Tu Asesor de Estilo Personal',
};
