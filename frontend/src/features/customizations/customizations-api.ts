import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type { Customization, QueryPublicCustomizationParams } from '@/types/customization';

/** Public showcase grid on the "Customize" page — active items only, same
 * shape/contract as `useGalleryItems` in features/gallery/gallery-api.ts. */
export function useCustomizations(params: QueryPublicCustomizationParams = {}) {
  return useQuery({
    queryKey: ['public-customizations', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResult<Customization>>('/customizations', {
        params,
      });
      return data;
    },
  });
}
