import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { SeoMeta } from '@/types/common';

/**
 * Fetches the centralized SEO entry for a path, if one's been entered in
 * the CMS. Returns `null` (not an error) for the common case where
 * nothing's been typed in yet — every page still has its own
 * content-derived fallback (product name, truncated description, etc.)
 * for that case, see call sites of `useSeoMeta`.
 */
export function useSeoOverride(path: string) {
  return useQuery({
    queryKey: ['seo-override', path],
    queryFn: async () => {
      const { data } = await apiClient.get<SeoMeta | null>('/seo/resolve', { params: { path } });
      return data;
    },
    staleTime: 5 * 60_000,
  });
}
