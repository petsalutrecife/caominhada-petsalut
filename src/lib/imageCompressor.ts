/**
 * Client-side Image Compression Utility
 * Resizes large photos and receipts to lightweight JPEG base64 strings
 * drastically reducing database payload, network latency, and preventing timeouts.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
}

export async function compressImage(
  fileOrBase64: File | string,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 900,
    maxHeight = 900,
    quality = 0.75
  } = options;

  if (typeof window === 'undefined') {
    if (typeof fileOrBase64 === 'string') return fileOrBase64;
    return '';
  }

  // Handle PDF files without modifying
  if (fileOrBase64 instanceof File && fileOrBase64.type === 'application/pdf') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBase64);
    });
  }

  if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:application/pdf')) {
    return fileOrBase64;
  }

  // Convert File to data URL first if needed
  let dataUrl: string;
  if (fileOrBase64 instanceof File) {
    dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBase64);
    });
  } else {
    dataUrl = fileOrBase64;
  }

  // If the dataUrl is not an image (e.g. empty or placeholder), return as is
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      // Draw and compress to JPEG
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      // If compression fails, return original dataUrl
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}
