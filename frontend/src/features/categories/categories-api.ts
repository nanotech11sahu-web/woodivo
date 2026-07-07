import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Category } from '@/types/category';

export function useCategories(featured?: boolean) {
  return useQuery({
    queryKey: ['public-categories', { featured: featured ?? null }],
    queryFn: async () => {
      const { data } = await apiClient.get<Category[]>('/categories', {
        params: featured ? { featured: 'true' } : undefined,
      });
      return data;
    },
  });
}

export function useCategory(slug: string | undefined) {
  return useQuery({
    queryKey: ['public-category', slug],
    queryFn: async () => {
      const { data } = await apiClient.get<Category>(`/categories/${slug}`);
      return data;
    },
    enabled: Boolean(slug),
  });
}
