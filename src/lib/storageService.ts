import { supabase } from '@/lib/supabaseMock';
import { compressImageToBlob, isStorageUrl, CompressionOptions } from '@/lib/imageCompressor';

export const MEDIA_BUCKET = 'caominhada-media';

export interface UploadMediaOptions {
  folder: 'pets' | 'receipts' | 'logos' | 'general';
  identifier?: string;
  compression?: CompressionOptions;
}

export interface UploadResult {
  url: string;
  isStorage: boolean;
  sizeBytes: number;
}

/**
 * Uploads an image or PDF to Supabase Storage.
 * If Storage is unavailable or the bucket has not been created yet,
 * it automatically falls back to an ultra-compressed Base64 Data URL,
 * ensuring zero disruption to users.
 */
export async function uploadMediaToStorage(
  fileOrDataUrl: File | Blob | string,
  options: UploadMediaOptions
): Promise<UploadResult> {
  if (!fileOrDataUrl) {
    return { url: '', isStorage: false, sizeBytes: 0 };
  }

  // 1. If it's already a remote HTTP/HTTPS URL, don't re-upload
  if (typeof fileOrDataUrl === 'string' && isStorageUrl(fileOrDataUrl)) {
    return { url: fileOrDataUrl, isStorage: true, sizeBytes: 0 };
  }

  // 2. Compress or process the media (WebP/JPEG or PDF)
  const compressionOpts: CompressionOptions = {
    maxWidth: options.folder === 'receipts' ? 1000 : 800,
    maxHeight: options.folder === 'receipts' ? 1000 : 800,
    quality: 0.75,
    maxSizeBytes: 75 * 1024,
    preferredFormat: 'image/webp',
    ...options.compression
  };

  const processed = await compressImageToBlob(fileOrDataUrl, compressionOpts);

  // 3. Generate a clean, unique file path in the bucket
  const cleanId = (options.identifier || 'media')
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '_')
    .slice(0, 40);
  const timestamp = Date.now();
  const filePath = `${options.folder}/${cleanId}_${timestamp}.${processed.extension}`;

  // 4. Attempt upload to Supabase Storage
  try {
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(filePath, processed.blob, {
        contentType: processed.mimeType,
        upsert: true,
        cacheControl: '31536000' // Cache CDN for 1 year
      });

    if (!error && data) {
      const { data: publicData } = supabase.storage
        .from(MEDIA_BUCKET)
        .getPublicUrl(filePath);

      if (publicData?.publicUrl) {
        return {
          url: publicData.publicUrl,
          isStorage: true,
          sizeBytes: processed.sizeBytes
        };
      }
    } else if (error) {
      console.warn(
        `[StorageService] Upload to bucket '${MEDIA_BUCKET}' not available (${error.message}). Falling back to compressed Data URL.`
      );
    }
  } catch (err) {
    console.warn('[StorageService] Unexpected error uploading to storage:', err);
  }

  // 5. Fallback: Return the ultra-compressed Base64 Data URL
  return {
    url: processed.dataUrl,
    isStorage: false,
    sizeBytes: processed.sizeBytes
  };
}

/**
 * Checks if the Supabase Storage bucket is accessible and ready.
 */
export async function checkStorageReady(): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.from(MEDIA_BUCKET).list('', { limit: 1 });
    return !error;
  } catch {
    return false;
  }
}
