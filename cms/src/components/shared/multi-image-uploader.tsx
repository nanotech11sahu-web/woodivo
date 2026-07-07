import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { getErrorMessage } from '@/lib/http-error';
import { toast } from '@/lib/toast';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { MediaAsset, MediaFolder } from '@/types/common';

interface MultiImageUploaderProps {
  label: string;
  value: MediaAsset[];
  onChange: (assets: MediaAsset[]) => void;
  folder: MediaFolder;
  max?: number;
  hint?: string;
}

export function MultiImageUploader({
  label,
  value,
  onChange,
  folder,
  max = 20,
  hint,
}: MultiImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const remaining = max - value.length;

  async function handleFilesSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, remaining);
    event.target.value = '';
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('folder', folder);

    setIsUploading(true);
    try {
      const { data } = await apiClient.post<MediaAsset[]>('/admin/media/upload-multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange([...value, ...data]);
    } catch (error) {
      toast.error('Upload failed', getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemove(index: number) {
    const asset = value[index];
    onChange(value.filter((_, i) => i !== index));
    if (asset.publicId) {
      try {
        await apiClient.post('/admin/media/delete', { publicId: asset.publicId });
      } catch {
        // Non-critical: the asset is already detached from this record.
      }
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-espresso">{label}</p>
      <div className="flex flex-wrap gap-3">
        {value.map((asset, index) => (
          <div key={asset.publicId ?? asset.url} className="relative h-24 w-24">
            <img
              src={asset.url}
              alt={asset.alt ?? `${label} ${index + 1}`}
              className="h-24 w-24 rounded-md border border-border-warm object-cover"
            />
            <button
              type="button"
              onClick={() => void handleRemove(index)}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rust text-white shadow-sm"
              aria-label={`Remove image ${index + 1}`}
            >
              <X size={13} />
            </button>
          </div>
        ))}

        {remaining > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className={cn(
              'flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border-warm text-ink-muted',
              'hover:border-walnut hover:text-walnut disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            {isUploading ? <Spinner /> : <ImagePlus size={18} />}
            <span className="text-xs">{isUploading ? 'Uploading…' : 'Add images'}</span>
          </button>
        )}
      </div>
      {hint && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(event) => void handleFilesSelect(event)}
      />
    </div>
  );
}
