import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type { GalleryItem, QueryPublicGalleryParams } from '@/types/gallery';

export function useGalleryItems(params: QueryPublicGalleryParams = {}) {
  return useQuery({
    queryKey: ['public-gallery', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResult<GalleryItem>>('/gallery', {
        params,
      });
      return data;
    },
  });
}
