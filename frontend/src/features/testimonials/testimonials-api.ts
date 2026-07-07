import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type { Testimonial } from '@/types/testimonial';

export function useTestimonials(featuredOnly = false, limit = 10) {
  return useQuery({
    queryKey: ['public-testimonials', { featuredOnly, limit }],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResult<Testimonial>>(
        '/testimonials',
        { params: { featuredOnly, limit } },
      );
      return data;
    },
  });
}
