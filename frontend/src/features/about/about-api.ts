import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { AboutPage } from '@/types/about';

export function useAboutPage() {
  return useQuery({
    queryKey: ['public-about-page'],
    queryFn: async () => {
      const { data } = await apiClient.get<AboutPage>('/about');
      return data;
    },
    // Same reasoning as useSettings — hero copy, story, team, values are
    // practically static within a session.
    staleTime: 15 * 60_000,
  });
}
