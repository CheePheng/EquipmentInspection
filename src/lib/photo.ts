import imageCompression from 'browser-image-compression';

export async function compressPhoto(file: File): Promise<Blob> {
  return imageCompression(file, {
    maxWidthOrHeight: 1200,
    maxSizeMB: 0.4,
    useWebWorker: true,
    fileType: 'image/jpeg',
  });
}

export function createPhotoUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokePhotoUrl(url: string): void {
  URL.revokeObjectURL(url);
}
