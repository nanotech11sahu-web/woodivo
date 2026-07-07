import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type { Faq } from '@/types/faq';

export function useFaqs(group?: string, limit = 20) {
  return useQuery({
    queryKey: ['public-faqs', { group: group ?? null, limit }],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResult<Faq>>('/faqs', {
        params: { group, limit },
      });
      return data;
    },
  });
}
