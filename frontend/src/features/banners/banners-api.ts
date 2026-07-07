import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Banner, BannerPlacement } from '@/types/banner';

export function useBanners(placement: BannerPlacement) {
  return useQuery({
    queryKey: ['public-banners', placement],
    queryFn: async () => {
      const { data } = await apiClient.get<Banner[]>('/banners', {
        params: { placement },
      });
      return data;
    },
  });
}
