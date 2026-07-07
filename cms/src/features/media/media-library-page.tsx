import { useState } from 'react';
import { Copy, Trash2, ImageOff } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/features/auth/auth-context';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import { useMediaAssets, useDeleteMediaAsset } from './media-api';
import type { MediaLibraryAsset } from '@/types/media';
import type { MediaFolder } from '@/types/common';

const FOLDER_OPTIONS: MediaFolder[] = [
  'categories',
  'products',
  'projects',
  'gallery',
  'blogs',
  'banners',
  'testimonials',
  'settings',
  'misc',
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function MediaLibraryPage() {
  const { user: currentUser } = useAuth();
  const [folder, setFolder] = useState<MediaFolder | ''>('');
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<MediaLibraryAsset | null>(null);

  // Deleting here removes the file from Cloudinary outright, not just from
  // one record's field the way `ImageUploader`'s replace-image delete does
  // — there's no way to check whether some other product/banner/blog is
  // still pointing at this exact URL before doing it (that would need a
  // reverse index across every module's image fields, out of scope for
  // this phase). Gated to ADMIN+ in this UI as a result, even though the
  // underlying `/admin/media/delete` route itself still allows EDITOR too
  // (unchanged, since `ImageUploader`'s own replace-flow depends on that).
  const canDelete = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMediaAssets({
      folder: folder || undefined,
      search: search || undefined,
      limit: 24,
    });
  const deleteAsset = useDeleteMediaAsset();

  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = data?.pages[0]?.totalCount;

  function handleFolderChange(value: string) {
    setFolder(value as MediaFolder | '');
  }

  async function handleCopyUrl(asset: MediaLibraryAsset) {
    try {
      await navigator.clipboard.writeText(asset.url);
      toast.success('Image URL copied');
    } catch {
      toast.error("Couldn't copy URL", 'Your browser blocked clipboard access.');
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteAsset.mutateAsync(pendingDelete.publicId);
      toast.success('Image deleted from Cloudinary');
      setPendingDelete(null);
    } catch (error) {
      toast.error("Couldn't delete image", getErrorMessage(error));
    }
  }

  return (
    <div>
      <PageHeader
        title="Media Library"
        description={
          totalCount !== undefined
            ? `${totalCount} image${totalCount === 1 ? '' : 's'} across every module, pulled live from Cloudinary.`
            : 'Every image ever uploaded across every module, pulled live from Cloudinary.'
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search by filename…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-xs"
        />
        <Select value={folder} onChange={(event) => handleFolderChange(event.target.value)} className="max-w-40">
          <option value="">All folders</option>
          {FOLDER_OPTIONS.map((option) => (
            <option key={option} value={option} className="capitalize">
              {option}
            </option>
          ))}
        </Select>
      </div>

      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      )}

      {isError && (
        <div className="rounded-card border border-border-warm bg-card p-8 text-center text-sm text-ink-muted">
          Couldn't load the media library. Cloudinary may be unreachable — try again shortly.
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-card border border-border-warm bg-card p-8 text-center">
          <ImageOff className="mx-auto mb-2 text-ink-muted" size={28} />
          <p className="font-display text-lg text-espresso">No images found</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">
            Try a different search or folder — or upload one from any module's edit form.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((asset) => (
            <div
              key={asset.publicId}
              className="group relative aspect-square overflow-hidden rounded-card border border-border-warm bg-sand"
            >
              <img
                src={asset.url}
                alt={asset.publicId}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col justify-between bg-espresso/0 p-2 opacity-0 transition-opacity group-hover:bg-espresso/60 group-hover:opacity-100">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => void handleCopyUrl(asset)}
                    aria-label="Copy image URL"
                    className="rounded bg-card/90 p-1.5 text-espresso hover:bg-card"
                  >
                    <Copy size={13} />
                  </button>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => setPendingDelete(asset)}
                      aria-label="Delete image"
                      className="rounded bg-card/90 p-1.5 text-rust hover:bg-card"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <p className="truncate text-[11px] text-white/90">
                  {asset.width && asset.height ? `${asset.width}×${asset.height} · ` : ''}
                  {asset.format.toUpperCase()} · {formatBytes(asset.bytes)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" onClick={() => void fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage && <Spinner className="text-current" />}
            Load more
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this image from Cloudinary?"
        description="This removes the file entirely, not just from one listing — anything else still pointing at this image (another product, an old blog post) will show a broken image. This can't be undone."
        confirmLabel="Delete permanently"
        destructive
        isLoading={deleteAsset.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
