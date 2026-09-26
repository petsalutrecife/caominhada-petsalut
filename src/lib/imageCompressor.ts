/**
 * Client-side Image Compression & Media Processing Utility
 * - Compresses large photos and receipts to lightweight WebP/JPEG format
 * - Supports iterative size-capping to prevent QuotaExceededError and database bloat
 * - Provides both Base64 Data URL and Blob representations for Supabase Storage
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.75)
  maxSizeBytes?: number; // Target max size (default 75KB)
  preferredFormat?: 'image/webp' | 'image/jpeg';
}

export interface CompressedBlobResult {
  blob: Blob;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  dataUrl: string;
}

export function isPdf(fileOrDataUrl: File | string | undefined | null): boolean {
  if (!fileOrDataUrl) return false;
  if (fileOrDataUrl instanceof File) {
    return fileOrDataUrl.type === 'application/pdf' || fileOrDataUrl.name.toLowerCase().endsWith('.pdf');
  }
  if (typeof fileOrDataUrl === 'string') {
    return (
      fileOrDataUrl.startsWith('data:application/pdf') ||
      fileOrDataUrl.toLowerCase().includes('.pdf') ||
      fileOrDataUrl.toLowerCase().endsWith('.pdf')
    );
  }
  return false;
}

export function isStorageUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Compresses an image or handles a PDF file, returning a lightweight Data URL.
 */
export async function compressImage(
  fileOrBase64: File | Blob | string,
  options: CompressionOptions = {}
): Promise<string> {
  const result = await compressImageToBlob(fileOrBase64, options);
  return result.dataUrl;
}

/**
 * Compresses an image or reads a PDF, returning a Blob ready for Supabase Storage upload
 * along with its metadata and data URL fallback.
 */
export async function compressImageToBlob(
  fileOrBase64: File | Blob | string,
  options: CompressionOptions = {}
): Promise<CompressedBlobResult> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.75,
    maxSizeBytes = 75 * 1024, // 75KB
    preferredFormat = 'image/webp'
  } = options;

  if (typeof window === 'undefined') {
    const str = typeof fileOrBase64 === 'string' ? fileOrBase64 : '';
    return {
      blob: new Blob([str], { type: 'text/plain' }),
      mimeType: 'text/plain',
      extension: 'txt',
      sizeBytes: str.length,
      dataUrl: str
    };
  }

  // 1. Handle PDF files cleanly without modification
  const isBlobPdf = (fileOrBase64 instanceof File || (typeof Blob !== 'undefined' && fileOrBase64 instanceof Blob)) && fileOrBase64.type === 'application/pdf';
  if (isBlobPdf) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBase64);
    });

    return {
      blob: fileOrBase64,
      mimeType: 'application/pdf',
      extension: 'pdf',
      sizeBytes: fileOrBase64.size,
      dataUrl
    };
  }

  if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:application/pdf')) {
    const commaIdx = fileOrBase64.indexOf(',');
    const base64Data = commaIdx !== -1 ? fileOrBase64.substring(commaIdx + 1) : fileOrBase64;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    return {
      blob,
      mimeType: 'application/pdf',
      extension: 'pdf',
      sizeBytes: blob.size,
      dataUrl: fileOrBase64
    };
  }

  // 2. Convert File or Blob to data URL if necessary
  let dataUrl: string;
  if (typeof fileOrBase64 !== 'string') {
    dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBase64);
    });
  } else {
    dataUrl = fileOrBase64;
  }

  // If not an image data URL, return as-is
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    const dummyBlob = new Blob([dataUrl], { type: 'text/plain' });
    return {
      blob: dummyBlob,
      mimeType: 'text/plain',
      extension: 'bin',
      sizeBytes: dataUrl.length,
      dataUrl
    };
  }

  // 3. Compress using HTML5 Canvas
  return new Promise<CompressedBlobResult>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Scale keeping aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.max(1, Math.round(width * ratio));
        height = Math.max(1, Math.round(height * ratio));
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback to original
        resolve({
          blob: new Blob([dataUrl], { type: 'image/jpeg' }),
          mimeType: 'image/jpeg',
          extension: 'jpg',
          sizeBytes: dataUrl.length,
          dataUrl
        });
        return;
      }

      // Fill white background for transparent images when converting to JPEG/WebP
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Check if browser supports WebP canvas export
      let targetMime = preferredFormat;
      let ext = preferredFormat === 'image/webp' ? 'webp' : 'jpg';

      let testUrl = canvas.toDataURL(targetMime, quality);
      if (!testUrl.startsWith(`data:${targetMime}`)) {
        // Fallback to JPEG if WebP export not supported
        targetMime = 'image/jpeg';
        ext = 'jpg';
        testUrl = canvas.toDataURL(targetMime, quality);
      }

      // Iterative quality reduction if size exceeds target maxSizeBytes
      let currentQuality = quality;
      let outputDataUrl = testUrl;

      // Data URL size estimate: string length * 0.75 ≈ binary size
      while (outputDataUrl.length * 0.75 > maxSizeBytes && currentQuality > 0.4) {
        currentQuality -= 0.1;
        outputDataUrl = canvas.toDataURL(targetMime, currentQuality);
      }

      // Convert to Blob for upload
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({
              blob,
              mimeType: targetMime,
              extension: ext,
              sizeBytes: blob.size,
              dataUrl: outputDataUrl
            });
          } else {
            // Blob conversion fallback
            const commaIdx = outputDataUrl.indexOf(',');
            const base64 = commaIdx !== -1 ? outputDataUrl.substring(commaIdx + 1) : outputDataUrl;
            const bytes = atob(base64);
            const arr = new Uint8Array(bytes.length);
            for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
            const fallbackBlob = new Blob([arr], { type: targetMime });
            resolve({
              blob: fallbackBlob,
              mimeType: targetMime,
              extension: ext,
              sizeBytes: fallbackBlob.size,
              dataUrl: outputDataUrl
            });
          }
        },
        targetMime,
        currentQuality
      );
    };

    img.onerror = () => {
      const fallbackBlob = new Blob([dataUrl], { type: 'image/jpeg' });
      resolve({
        blob: fallbackBlob,
        mimeType: 'image/jpeg',
        extension: 'jpg',
        sizeBytes: dataUrl.length,
        dataUrl
      });
    };

    img.src = dataUrl;
  });
}
