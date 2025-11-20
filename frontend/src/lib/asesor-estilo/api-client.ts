import type { FaceAnalysis, IteratePayload } from './types/ai';

// Define a generic error structure for API responses
export type ApiError = {
  error: string;
  message: string;
};

// Type for the successful upload response
export type UploadResponse = {
  imageUrl: string;
  sessionId: string;
  publicId: string;
};

// Type for the successful analysis response
export type AnalyzeResponse = {
  analysis: FaceAnalysis;
  workingUrl: string;
  cached: boolean;
};

// Type for the successful iteration response
export type IterateResponse = {
    editedUrl: string;
    publicId: string;
    note: string;
};


/**
 * A wrapper around fetch to handle common API call patterns, like JSON parsing and error handling.
 * @param url The URL to fetch.
 * @param options The fetch options.
 * @returns The parsed JSON response.
 * @throws An ApiError if the response is not ok.
 */
async function apiFetch<T>(url: string, options: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw data as ApiError;
  }
  return data as T;
}

export async function uploadImage(file: File, onProgress?: (percent: number) => void): Promise<UploadResponse> {
  // uploadImage uses XMLHttpRequest to get upload progress events which fetch doesn't provide.
  if (typeof window === 'undefined') {
    // Prevent accidental usage on the server / during SSR
    throw new Error('uploadImage can only be called from the browser');
  }

  return await new Promise<UploadResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/asesor-estilo/upload');
    xhr.responseType = 'json';

    xhr.onload = () => {
      const resp = xhr.response as UploadResponse | { error?: string } | null;
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve((resp || {}) as UploadResponse);
      } else {
        reject((resp as { error?: string }) || new Error('Upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));

    if (xhr.upload && typeof xhr.upload.addEventListener === 'function') {
      xhr.upload.addEventListener('progress', (ev: ProgressEvent) => {
        if (!ev.lengthComputable) return;
        const percent = Math.round((ev.loaded / ev.total) * 100);
        if (onProgress) {
          try { onProgress(percent); } catch { /* ignore progress handler errors */ }
        }
      });
    }

    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  });
}

export async function analyzeImage(imageUrl: string, locale: string = 'es'): Promise<AnalyzeResponse> {
  return apiFetch<AnalyzeResponse>('/api/asesor-estilo/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, locale }),
  });
}

export async function iterateEdit(payload: IteratePayload): Promise<IterateResponse> {
    return apiFetch<IterateResponse>('/api/asesor-estilo/iterate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
}
