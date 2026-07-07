import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type { Banner, BannerListParams, BannerPayload } from '@/types/banner';

const BANNERS_KEY = 'banners';

async function fetchBanners(params: BannerListParams): Promise<PaginatedResult<Banner>> {
  const { data } = await apiClient.get<PaginatedResult<Banner>>('/admin/banners', { params });
  return data;
}

async function fetchBanner(id: string): Promise<Banner> {
  const { data } = await apiClient.get<Banner>(`/admin/banners/${id}`);
  return data;
}

async function createBannerRequest(payload: BannerPayload): Promise<Banner> {
  const { data } = await apiClient.post<Banner>('/admin/banners', payload);
  return data;
}

async function updateBannerRequest(id: string, payload: BannerPayload): Promise<Banner> {
  const { data } = await apiClient.patch<Banner>(`/admin/banners/${id}`, payload);
  return data;
}

async function deleteBannerRequest(id: string): Promise<void> {
  await apiClient.delete(`/admin/banners/${id}`);
}

async function reorderBannersRequest(items: { id: string; displayOrder: number }[]): Promise<void> {
  await apiClient.patch('/admin/banners/reorder', { items });
}

export function useBanners(params: BannerListParams) {
  return useQuery({
    queryKey: [BANNERS_KEY, 'list', params],
    queryFn: () => fetchBanners(params),
    placeholderData: keepPreviousData,
  });
}

export function useBanner(id: string | undefined) {
  return useQuery({
    queryKey: [BANNERS_KEY, 'detail', id],
    queryFn: () => fetchBanner(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBannerRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BANNERS_KEY] }),
  });
}

export function useUpdateBanner(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BannerPayload) => updateBannerRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BANNERS_KEY] }),
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBannerRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BANNERS_KEY] }),
  });
}

export function useReorderBanners() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderBannersRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BANNERS_KEY] }),
  });
}
