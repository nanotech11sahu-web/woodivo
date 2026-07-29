import { useRef, useState } from 'react';
import { Film, X } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { getErrorMessage } from '@/lib/http-error';
import { toast } from '@/lib/toast';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { MediaAsset, MediaFolder } from '@/types/common';

interface VideoUploaderProps {
  label: string;
  value?: MediaAsset;
  onChange: (asset: MediaAsset | undefined) => void;
  folder: MediaFolder;
  hint?: string;
}

/** Single-video uploader, mirrors ImageUploader - used by the "Post as Reel" flow. */
export function VideoUploader({ label, value, onChange, folder, hint }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    setIsUploading(true);
    try {
      const { data } = await apiClient.post<MediaAsset>('/admin/media/upload-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(data);
    } catch (error) {
      toast.error('Upload failed', getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemove() {
    const publicId = value?.publicId;
    onChange(undefined);
    if (publicId) {
      try {
        await apiClient.post('/admin/media/delete', { publicId, resourceType: 'video' });
      } catch {
        // Non-critical: the asset is already detached from this record.
      }
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-espresso">{label}</p>
      {value ? (
        <div className="relative w-40">
          <video
            src={value.url}
            controls
            className="h-28 w-40 rounded-md border border-border-warm object-cover"
          />
          <button
            type="button"
            onClick={() => void handleRemove()}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rust text-white shadow-sm"
            aria-label={`Remove ${label}`}
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            'flex h-28 w-40 flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border-warm text-ink-muted',
            'hover:border-walnut hover:text-walnut disabled:cursor-not-allowed disabled:opacity-60',
          )}
        >
          {isUploading ? <Spinner /> : <Film size={20} />}
          <span className="text-xs">{isUploading ? 'Uploading…' : 'Upload video'}</span>
        </button>
      )}
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime"
        className="hidden"
        onChange={(event) => void handleFileSelect(event)}
      />
    </div>
  );
}
