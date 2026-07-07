import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type { Faq, FaqListParams, FaqPayload } from '@/types/faq';

const FAQS_KEY = 'faqs';

async function fetchFaqs(params: FaqListParams): Promise<PaginatedResult<Faq>> {
  const { data } = await apiClient.get<PaginatedResult<Faq>>('/admin/faqs', { params });
  return data;
}

async function fetchFaq(id: string): Promise<Faq> {
  const { data } = await apiClient.get<Faq>(`/admin/faqs/${id}`);
  return data;
}

async function createFaqRequest(payload: FaqPayload): Promise<Faq> {
  const { data } = await apiClient.post<Faq>('/admin/faqs', payload);
  return data;
}

async function updateFaqRequest(id: string, payload: FaqPayload): Promise<Faq> {
  const { data } = await apiClient.patch<Faq>(`/admin/faqs/${id}`, payload);
  return data;
}

async function deleteFaqRequest(id: string): Promise<void> {
  await apiClient.delete(`/admin/faqs/${id}`);
}

async function reorderFaqsRequest(items: { id: string; displayOrder: number }[]): Promise<void> {
  await apiClient.patch('/admin/faqs/reorder', { items });
}

export function useFaqs(params: FaqListParams) {
  return useQuery({
    queryKey: [FAQS_KEY, 'list', params],
    queryFn: () => fetchFaqs(params),
    placeholderData: keepPreviousData,
  });
}

export function useFaq(id: string | undefined) {
  return useQuery({
    queryKey: [FAQS_KEY, 'detail', id],
    queryFn: () => fetchFaq(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFaqRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [FAQS_KEY] }),
  });
}

export function useUpdateFaq(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FaqPayload) => updateFaqRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [FAQS_KEY] }),
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFaqRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [FAQS_KEY] }),
  });
}

export function useReorderFaqs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderFaqsRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [FAQS_KEY] }),
  });
}
