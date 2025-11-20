import fs from 'fs/promises'
import path from 'path'

type CloudinaryV2 = Record<string, unknown> | null;

const CLOUDINARY_URL = process.env.CLOUDINARY_URL || ''
// Consider CLOUDINARY configured only if it doesn't contain obvious placeholders
const CLOUDINARY_AVAILABLE = !!CLOUDINARY_URL && !(/[<>]|YOUR_|your_/).test(CLOUDINARY_URL)

let cloudinary: CloudinaryV2 = null;
let initPromise: Promise<CloudinaryV2> | null = null;

// Initialize cloudinary lazily on first use
async function ensureCloudinaryInitialized(): Promise<CloudinaryV2> {
  if (cloudinary !== null) return cloudinary // already initialized
  if (initPromise) return initPromise // already initializing
  
  if (!CLOUDINARY_AVAILABLE) {
    cloudinary = null
    return null
  }

  initPromise = (async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('cloudinary')
      const v2 = mod.default?.v2 || mod.v2 || mod
      
      if (v2 && typeof v2.config === 'function') {
        // Parse CLOUDINARY_URL manually to ensure correct configuration
        // Format: cloudinary://<api_key>:<api_secret>@<cloud_name>
        const matches = CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/]+)$/);
        if (matches) {
          v2.config({
            cloud_name: matches[3],
            api_key: matches[1],
            api_secret: matches[2],
            secure: true
          });
        } else {
          // Fallback: let the library try to pick up process.env.CLOUDINARY_URL
          // or if the user passed a different format
          v2.config({ secure: true });
        }
      }
      cloudinary = v2
      return v2
    } catch (e: unknown) {
      console.warn('Cloudinary init failed:', e instanceof Error ? e.message : String(e))
      cloudinary = null
      return null
    }
  })()

  return initPromise
}

export async function uploadToStorage(buffer: Buffer, filename: string) {
  await ensureCloudinaryInitialized()
  
  if (!CLOUDINARY_AVAILABLE || !cloudinary) {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const outPath = path.join(uploadsDir, safeName)
    await fs.writeFile(outPath, buffer)
    const url = `/uploads/${safeName}`
    console.warn('uploadToStorage: Cloudinary not configured, saved to', outPath)
    return { url, public_id: `local:${safeName}` }
  }

  return new Promise<{ url: string; public_id: string }>((resolve, reject) => {
    try {
      // Build a safe public_id from the filename
      const baseName = filename.replace(/\.[^/.]+$/, '')
      const safeBase = baseName.replace(/[^a-zA-Z0-9_-]/g, '_')
      const uniquePublicId = `${safeBase}_${Date.now()}`

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cld = cloudinary as any
        // Use a generic Cloudinary folder for uploads to avoid ties to removed features
        const uploadStream = cld?.uploader?.upload_stream?.(
          { folder: 'spartan-uploads', public_id: uniquePublicId, overwrite: false, resource_type: 'image' },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error: any, result: any) => {
            if (error) return reject(new Error(String(error)))
            if (!result || !result.secure_url || !result.public_id) return reject(new Error('No result from Cloudinary'))
            resolve({ url: String(result.secure_url), public_id: String(result.public_id) })
          }
        )
      
      if (!uploadStream) {
        return reject(new Error('Cloudinary upload_stream not available'))
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const streamifier = require('streamifier')
      streamifier.createReadStream(buffer).pipe(uploadStream)
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)))
    }
  }).catch(async (err) => {
    console.error('Cloudinary upload failed, falling back to local storage:', err)
    // Fallback to local storage
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const outPath = path.join(uploadsDir, safeName)
    await fs.writeFile(outPath, buffer)
    const url = `/uploads/${safeName}`
    return { url, public_id: `local:${safeName}` }
  })
}

export async function deleteFromStorage(publicId: string) {
  if (!publicId) return false

  if (!CLOUDINARY_AVAILABLE || publicId.startsWith('local:')) {
    try {
      const filename = publicId.replace(/^local:/, '')
      const p = path.join(process.cwd(), 'public', 'uploads', filename)
      await fs.unlink(p)
      return true
    } catch (err: unknown) {
      // If file not found, treat as success
      if (err && typeof err === 'object' && 'code' in err) {
        const asObj = err as Record<string, unknown>
        if (asObj.code === 'ENOENT') return true
      }
      console.error('deleteFromStorage local error', err)
      return false
    }
  }

    try {
      await ensureCloudinaryInitialized()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cld = cloudinary as any
      if (cld?.uploader?.destroy && typeof cld.uploader.destroy === 'function') {
        const res = await cld.uploader.destroy(publicId, { resource_type: 'image' })
        if (res && typeof res === 'object') {
          const r = res as Record<string, unknown>
          return r.result === 'ok' || r.result === 'not_found'
        }
      }
      return false
    } catch (e: unknown) {
      console.error('cloudinary delete error', e)
      return false
    }
}

/**
 * Build a canonical URL for an image stored in the configured storage.
 * - For local (dev) storage it maps to the saved `/uploads/<filename>` path.
 * - For Cloudinary it uses the SDK to generate a stable secure URL for the public id.
 */
export function getCanonicalUrl(publicId: string, extension = 'jpg') {
  if (!publicId) return ''

  // Local stored files use the "local:" prefix
  if (publicId.startsWith('local:')) {
    const filename = publicId.replace(/^local:/, '')
    return `/uploads/${filename}`
  }

  // If Cloudinary isn't available, attempt a reasonable fallback that matches
  // how the local dev upload path behaves (use publicId + extension).
  if (!CLOUDINARY_AVAILABLE) {
    const safe = publicId.replace(/[^a-zA-Z0-9_\/-]/g, '_')
    return `/uploads/${safe}.${extension}`
  }

  try {
    if (cloudinary && typeof cloudinary.url === 'function') {
      const url = cloudinary.url(publicId, { secure: true, format: extension })
      if (url) return url
    }
  } catch {
    // ignore and fallback to a constructed url
  }

  // Last-resort fallback: construct an https URL using the configured cloud name
  try {
    const cfg = cloudinary && typeof cloudinary.config === 'function' ? cloudinary.config() : {}
    const cloudName = cfg && typeof cfg === 'object' && 'cloud_name' in cfg ? (cfg as Record<string, unknown>).cloud_name : ''
    if (cloudName) {
      return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.${extension}`
    }
  } catch {
    // ignore
  }

  return `/uploads/${publicId}.${extension}`
}

/**
 * Get an optimized URL for an image stored in Cloudinary.
 * This applies smart transformations to ensure consistent dimensions and quality
 * for both display and AI processing.
 * 
 * @param publicId - The Cloudinary public ID
 * @param maxWidth - Maximum width in pixels (default: 1024)
 * @param quality - Quality setting (default: 'auto:good')
 * @returns Optimized Cloudinary URL with transformations
 */
export function getOptimizedUrl(publicId: string, maxWidth = 1024, quality: 'auto:good' | 'auto:best' | '90' = 'auto:good'): string {
  if (!publicId) return ''

  // Local storage: return the local path as-is
  if (publicId.startsWith('local:')) {
    const filename = publicId.replace(/^local:/, '')
    return `/uploads/${filename}`
  }

  // If Cloudinary isn't available, fallback to canonical
  if (!CLOUDINARY_AVAILABLE) {
    return getCanonicalUrl(publicId)
  }

  try {
    // Generate Cloudinary URL with optimization transformations
    // - c_limit: Ensures the image fits within maxWidth, maintaining aspect ratio
    // - q_auto:good: Automatic quality optimization
    // - f_auto: Automatic format selection (WebP when supported)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cld = cloudinary as any
    if (cld && typeof cld.url === 'function') {
      const url = cld.url(publicId, {
        secure: true,
        transformation: [
          {
            width: maxWidth,
            crop: 'limit', // Limit size but maintain aspect ratio
            quality: quality,
            fetch_format: 'auto' // Serve WebP/AVIF when supported, fallback to original format
          }
        ]
      })
      if (url) return url
    }
  } catch (e: unknown) {
    console.error('getOptimizedUrl error', e)
    // Fallback to canonical
  }

  return getCanonicalUrl(publicId)
}
