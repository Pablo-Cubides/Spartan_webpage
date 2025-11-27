import { APP_CONFIG } from '../config/app.config';
import { createHash } from 'crypto';
import { appendLog } from '../ai/logger';

/**
 * In-memory cache implementation
 */
class InMemoryCache {
  private cache = new Map<string, { value: unknown; expiresAt: number }>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    for (const [key, entry] of entries) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds || APP_CONFIG.cache.TTL_SECONDS;
    const expiresAt = Date.now() + ttl * 1000;

    this.cache.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  getSize(): number {
    return this.cache.size;
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Singleton cache instance
let cacheInstance: InMemoryCache | null = null;

function getCache(): InMemoryCache {
  if (!cacheInstance) {
    cacheInstance = new InMemoryCache();
    console.log('✓ Using in-memory cache');
  }
  return cacheInstance;
}

/**
 * Get value from cache
 */
export async function getCached<T>(key: string): Promise<T | null> {
  if (!APP_CONFIG.cache.ENABLED) {
    return null;
  }

  const startTime = Date.now();
  const cache = getCache();
  const value = await cache.get<T>(key);

  appendLog({
    phase: value ? 'cache.hit' : 'cache.miss',
    key: key.substring(0, 20) + '...',
    durationMs: Date.now() - startTime,
    timestamp: Date.now(),
  });

  return value;
}

/**
 * Set value in cache
 */
export async function setCached(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<void> {
  if (!APP_CONFIG.cache.ENABLED) {
    return;
  }

  const cache = getCache();
  await cache.set(key, value, ttlSeconds);

  appendLog({
    phase: 'cache.set',
    key: key.substring(0, 20) + '...',
    ttl: ttlSeconds || APP_CONFIG.cache.TTL_SECONDS,
    timestamp: Date.now(),
  });
}

/**
 * Delete value from cache
 */
export async function deleteCached(key: string): Promise<void> {
  if (!APP_CONFIG.cache.ENABLED) {
    return;
  }

  const cache = getCache();
  await cache.delete(key);

  appendLog({
    phase: 'cache.delete',
    key: key.substring(0, 20) + '...',
    timestamp: Date.now(),
  });
}

/**
 * Clear entire cache (use with caution)
 */
export async function clearCache(): Promise<void> {
  const cache = getCache();
  await cache.clear();

  appendLog({
    phase: 'cache.cleared',
    timestamp: Date.now(),
  });
}

/**
 * Generate cache key for image analysis
 */
export function generateAnalysisCacheKey(imageHash: string, locale: string): string {
  return `analysis:${imageHash}:${locale}`;
}

/**
 * Generate cache key for image generation
 */
export function generateGenerationCacheKey(
  imageHash: string,
  instruction: string
): string {
  // Use the built-in crypto module imported at top
  const instructionHash = createHash('md5')
    .update(instruction)
    .digest('hex')
    .substring(0, 8);
  
  return `generation:${imageHash}:${instructionHash}`;
}

/**
 * Get cache statistics (only for in-memory cache)
 */
export function getCacheStats(): { size?: number; type: string } {
  const cache = getCache();

  return {
    type: 'in-memory',
    size: cache.getSize(),
  };
}
