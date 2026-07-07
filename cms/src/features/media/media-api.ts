import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { MediaLibraryParams, MediaLibraryResult } from '@/types/media';

const MEDIA_LIBRARY_KEY = 'media-library';

async function fetchMediaAssets(params: MediaLibraryParams): Promise<MediaLibraryResult> {
  const { data } = await apiClient.get<MediaLibraryResult>('/admin/media', { params });
  return data;
}

async function deleteMediaAssetRequest(publicId: string): Promise<void> {
  // Reuses the same `/admin/media/delete` endpoint the per-field
  // `ImageUploader` calls when a field's image is replaced — there's no
  // separate library-only delete route. See PHASE17_NOTES.md for why that
  // matters here specifically (this delete has no record to fall back to).
  await apiClient.post('/admin/media/delete', { publicId });
}

// `useInfiniteQuery`, not `useQuery` + the shared `Pagination` component —
// Cloudinary's Search API is cursor-paginated, so there's no `totalPages`
// to page through, only "here's a cursor, ask again for the next batch."
export function useMediaAssets(params: Omit<MediaLibraryParams, 'cursor'>) {
  return useInfiniteQuery({
    queryKey: [MEDIA_LIBRARY_KEY, 'list', params],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      fetchMediaAssets({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useDeleteMediaAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMediaAssetRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [MEDIA_LIBRARY_KEY] }),
  });
}
