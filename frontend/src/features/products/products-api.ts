import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type { Product, QueryPublicProductParams } from '@/types/product';

export function useProducts(params: QueryPublicProductParams = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['public-products', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResult<Product>>('/products', {
        params,
      });
      return data;
    },
    enabled: options?.enabled,
  });
}

export function useFeaturedProducts(limit = 8) {
  return useProducts({ featured: true, limit });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ['public-product', slug],
    queryFn: async () => {
      const { data } = await apiClient.get<Product>(`/products/${slug}`);
      return data;
    },
    enabled: Boolean(slug),
  });
}
