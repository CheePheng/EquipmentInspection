import { useRef, useEffect, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { compressPhoto, createPhotoUrl, revokePhotoUrl } from '../../lib/photo';

interface PhotoCaptureProps {
  photos: Blob[];
  onChange: (photos: Blob[]) => void;
  maxPhotos?: number;
}

export function PhotoCapture({ photos, onChange, maxPhotos = 5 }: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  // Sync previews when photos array changes (e.g. reset)
  useEffect(() => {
    const urls = photos.map(createPhotoUrl);
    setPreviews(urls);
    return () => {
      urls.forEach(revokePhotoUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos.length]);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected
    e.target.value = '';

    try {
      const compressed = await compressPhoto(file);
      const newPhotos = [...photos, compressed];
      onChange(newPhotos);
    } catch {
      // Silently ignore compression errors — could add toast here
    }
  };

  const handleRemove = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onChange(newPhotos);
  };

  const canAdd = photos.length < maxPhotos;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary">
          {photos.length}/{maxPhotos} photos
        </span>
        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-sm text-amber-primary hover:text-amber-hover transition-colors duration-150 font-medium"
          >
            <Camera size={16} />
            Add Photo
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleCapture}
        tabIndex={-1}
        aria-hidden="true"
      />

      {previews.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {previews.map((url, i) => (
            <div key={url} className="relative flex-shrink-0">
              <img
                src={url}
                alt={`Photo ${i + 1}`}
                className="w-16 h-16 rounded-lg object-cover border border-border"
              />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                aria-label={`Remove photo ${i + 1}`}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-status-critical flex items-center justify-center text-white hover:bg-red-600 transition-colors duration-150"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-20 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1.5 text-text-muted hover:border-amber-primary hover:text-amber-primary transition-colors duration-150"
        >
          <Camera size={20} />
          <span className="text-xs">Tap to add photos</span>
        </button>
      )}
    </div>
  );
}
