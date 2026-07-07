import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type { Project } from '@/types/project';

export function useProjects(
  params: { page?: number; limit?: number; category?: string; featured?: boolean } = {},
) {
  return useQuery({
    queryKey: ['public-projects', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResult<Project>>('/projects', {
        params,
      });
      return data;
    },
  });
}

export function useFeaturedProjects(limit = 6) {
  return useProjects({ featured: true, limit });
}

export function useProject(slug: string | undefined) {
  return useQuery({
    queryKey: ['public-project', slug],
    queryFn: async () => {
      const { data } = await apiClient.get<Project>(`/projects/${slug}`);
      return data;
    },
    enabled: Boolean(slug),
  });
}
