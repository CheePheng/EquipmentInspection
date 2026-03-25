import { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

interface PhotoGridProps {
  photos: Blob[];
  onChange?: (photos: Blob[]) => void;
  maxPhotos?: number;
  readOnly?: boolean;
}

export function PhotoGrid({ photos, onChange, maxPhotos = 5, readOnly = false }: PhotoGridProps) {
  const [urls, setUrls] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const objectUrls = photos.map(b => URL.createObjectURL(b));
    setUrls(objectUrls);
    return () => {
      objectUrls.forEach(u => URL.revokeObjectURL(u));
    };
  }, [photos]);

  const handleRemove = (index: number) => {
    const next = photos.filter((_, i) => i !== index);
    onChange?.(next);
  };

  const handleAdd = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      // Simple pass-through; PhotoCapture handles compression. Here we accept raw blob.
      onChange?.([...photos, file]);
    };
    input.click();
  };

  if (photos.length === 0 && readOnly) return null;

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {urls.map((url, i) => (
          <div key={url} className="relative aspect-square">
            <button
              type="button"
              onClick={() => readOnly ? setLightboxIndex(i) : undefined}
              className="w-full h-full"
              aria-label={`View photo ${i + 1}`}
            >
              <img
                src={url}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover rounded-lg border border-border"
              />
            </button>
            {!readOnly && (
              <button
                type="button"
                onClick={() => handleRemove(i)}
                aria-label={`Remove photo ${i + 1}`}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-status-critical flex items-center justify-center text-white hover:bg-red-600 transition-colors duration-150 z-10"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}

        {!readOnly && photos.length < maxPhotos && (
          <button
            type="button"
            onClick={handleAdd}
            aria-label="Add photo"
            className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center text-text-muted hover:border-amber-primary hover:text-amber-primary transition-colors duration-150"
          >
            <Plus size={20} />
          </button>
        )}
      </div>

      {/* Lightbox modal for read-only view */}
      <Modal
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
      >
        {lightboxIndex !== null && urls[lightboxIndex] && (
          <div className="flex items-center justify-center -m-6 mt-0">
            <img
              src={urls[lightboxIndex]}
              alt={`Photo ${lightboxIndex + 1}`}
              className="max-w-full max-h-[70vh] object-contain rounded-b-2xl"
            />
          </div>
        )}
      </Modal>
    </>
  );
}
