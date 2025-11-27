/**
 * Inyectar basePath como variable global en cliente
 * Se ejecuta en layout.tsx para disponibilizar en todas las páginas
 */

export function injectBasePath() {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__NEXT_PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
  }
}
