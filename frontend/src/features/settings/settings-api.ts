import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { WebsiteSettings } from '@/types/settings';

export function useSettings() {
  return useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const { data } = await apiClient.get<WebsiteSettings>('/settings');
      return data;
    },
    // Logo, contact info, socials — practically static within a session,
    // and every page on the site needs it (header + footer both read it).
    staleTime: 15 * 60_000,
  });
}
