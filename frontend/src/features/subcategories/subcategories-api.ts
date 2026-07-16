import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { SubCategory } from '@/types/subcategory';

/** All active subcategories, optionally scoped to one category slug. */
export function useSubCategories(categorySlug?: string) {
  return useQuery({
    queryKey: ['public-subcategories', { category: categorySlug ?? null }],
    queryFn: async () => {
      const { data } = await apiClient.get<SubCategory[]>('/subcategories', {
        params: categorySlug ? { category: categorySlug } : undefined,
      });
      return data;
    },
  });
}

export function useSubCategory(slug: string | undefined) {
  return useQuery({
    queryKey: ['public-subcategory', slug],
    queryFn: async () => {
      const { data } = await apiClient.get<SubCategory>(`/subcategories/${slug}`);
      return data;
    },
    enabled: Boolean(slug),
  });
}
