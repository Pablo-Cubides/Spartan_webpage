/**
 * Hook para construir rutas de API dinámicamente
 * 
 * Soporta montaje en diferentes subpaths para integración en monorepos
 * 
 * Uso:
 * const uploadPath = useApiPath('/api/upload')
 * const analyzePath = useApiPath('/api/analyze')
 * 
 * En desarrollo: /api/upload
 * En monorepo con basePath="/face-analyzer": /face-analyzer/api/upload
 */

export function useApiPath(path: string): string {
  // Get basePath from NEXT_PUBLIC_BASE_PATH environment variable
  // This is set during build/runtime and propagated to the browser
  const basePath = typeof window !== 'undefined' && (window as Window & Record<string, unknown>).__NEXT_PUBLIC_BASE_PATH
    ? (window as Window & Record<string, unknown>).__NEXT_PUBLIC_BASE_PATH as string
    : process.env.NEXT_PUBLIC_BASE_PATH || '';

  // Return the path with basePath prefix if available
  const fullPath = basePath ? `${basePath}${path}` : path;
  
  return fullPath;
}

/**
 * Utilidad para obtener basePath fuera de React components
 */
export function getApiPath(path: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return basePath ? `${basePath}${path}` : path;
}

/**
 * Versión para uso en fetch calls
 */
export async function fetchApi<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const fullPath = getApiPath(path);
  const response = await fetch(fullPath, options);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}
