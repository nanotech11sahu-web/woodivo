import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type {
  SeoEntry,
  SeoEntryCreatePayload,
  SeoEntryListParams,
  SeoEntryUpdatePayload,
} from '@/types/seo';

const SEO_KEY = 'seo-entries';

async function fetchSeoEntries(params: SeoEntryListParams): Promise<PaginatedResult<SeoEntry>> {
  const { data } = await apiClient.get<PaginatedResult<SeoEntry>>('/admin/seo', { params });
  return data;
}

async function fetchSeoEntry(id: string): Promise<SeoEntry> {
  const { data } = await apiClient.get<SeoEntry>(`/admin/seo/${id}`);
  return data;
}

async function updateSeoEntryRequest(id: string, payload: SeoEntryUpdatePayload): Promise<SeoEntry> {
  const { data } = await apiClient.patch<SeoEntry>(`/admin/seo/${id}`, payload);
  return data;
}

async function createSeoEntryRequest(payload: SeoEntryCreatePayload): Promise<SeoEntry> {
  const { data } = await apiClient.post<SeoEntry>('/admin/seo', payload);
  return data;
}

async function deleteSeoEntryRequest(id: string): Promise<void> {
  await apiClient.delete(`/admin/seo/${id}`);
}

export function useSeoEntries(params: SeoEntryListParams) {
  return useQuery({
    queryKey: [SEO_KEY, 'list', params],
    queryFn: () => fetchSeoEntries(params),
    placeholderData: keepPreviousData,
  });
}

export function useSeoEntry(id: string | undefined) {
  return useQuery({
    queryKey: [SEO_KEY, 'detail', id],
    queryFn: () => fetchSeoEntry(id as string),
    enabled: Boolean(id),
  });
}

export function useUpdateSeoEntry(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SeoEntryUpdatePayload) => updateSeoEntryRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SEO_KEY] }),
  });
}

export function useCreateSeoEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSeoEntryRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SEO_KEY] }),
  });
}

export function useDeleteSeoEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSeoEntryRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SEO_KEY] }),
  });
}
