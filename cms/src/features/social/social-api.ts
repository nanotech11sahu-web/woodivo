import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type { SocialHealthResult, SocialPostSummary } from '@/types/social-post';

const SOCIAL_KEY = 'social';

interface RawSocialPostsResponse {
  items: SocialPostSummary[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

async function fetchSocialHealth(): Promise<SocialHealthResult> {
  const { data } = await apiClient.get<SocialHealthResult>('/admin/social/health');
  return data;
}

async function fetchSocialPosts(page: number, limit: number): Promise<PaginatedResult<SocialPostSummary>> {
  const { data } = await apiClient.get<RawSocialPostsResponse>('/admin/social/posts', {
    params: { page, limit },
  });
  return {
    items: data.items,
    meta: {
      page: data.meta.page,
      limit: data.meta.limit,
      total: data.meta.total,
      totalPages: data.meta.totalPages,
      hasPrevPage: data.meta.page > 1,
      hasNextPage: data.meta.page < data.meta.totalPages,
    },
  };
}

export function useSocialHealth() {
  return useQuery({
    queryKey: [SOCIAL_KEY, 'health'],
    queryFn: fetchSocialHealth,
    // Connectivity can flip between checks - keep it reasonably fresh without
    // hammering the Publisher on every re-render.
    refetchInterval: 30_000,
    retry: false,
  });
}

export function useSocialPosts(page: number, limit: number) {
  return useQuery({
    queryKey: [SOCIAL_KEY, 'posts', page, limit],
    queryFn: () => fetchSocialPosts(page, limit),
    // Statuses change while jobs are in flight - keep the table reasonably live.
    refetchInterval: 15_000,
  });
}
