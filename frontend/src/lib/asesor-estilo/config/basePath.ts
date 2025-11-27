/**
 * Inyectar basePath como variable global en cliente
 * Se ejecuta en layout.tsx para disponibilizar en todas las páginas
 */

export function injectBasePath() {
  if (typeof window !== 'undefined') {
    (window as Window & Record<string, unknown>).__NEXT_PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
  }
}
