import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type {
  Enquiry,
  EnquiryListParams,
  EnquiryStats,
  EnquiryUpdatePayload,
} from '@/types/enquiry';

const ENQUIRIES_KEY = 'enquiries';

async function fetchEnquiries(params: EnquiryListParams): Promise<PaginatedResult<Enquiry>> {
  const { data } = await apiClient.get<PaginatedResult<Enquiry>>('/admin/enquiries', { params });
  return data;
}

async function fetchEnquiry(id: string): Promise<Enquiry> {
  const { data } = await apiClient.get<Enquiry>(`/admin/enquiries/${id}`);
  return data;
}

async function fetchEnquiryStats(): Promise<EnquiryStats> {
  const { data } = await apiClient.get<EnquiryStats>('/admin/enquiries/stats');
  return data;
}

async function updateEnquiryRequest(id: string, payload: EnquiryUpdatePayload): Promise<Enquiry> {
  const { data } = await apiClient.patch<Enquiry>(`/admin/enquiries/${id}`, payload);
  return data;
}

async function deleteEnquiryRequest(id: string): Promise<void> {
  await apiClient.delete(`/admin/enquiries/${id}`);
}

export function useEnquiries(params: EnquiryListParams) {
  return useQuery({
    queryKey: [ENQUIRIES_KEY, 'list', params],
    queryFn: () => fetchEnquiries(params),
    placeholderData: keepPreviousData,
  });
}

export function useEnquiry(id: string | undefined) {
  return useQuery({
    queryKey: [ENQUIRIES_KEY, 'detail', id],
    queryFn: () => fetchEnquiry(id as string),
    enabled: Boolean(id),
  });
}

export function useEnquiryStats() {
  return useQuery({
    queryKey: [ENQUIRIES_KEY, 'stats'],
    queryFn: fetchEnquiryStats,
    staleTime: 30_000,
  });
}

export function useUpdateEnquiry(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EnquiryUpdatePayload) => updateEnquiryRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [ENQUIRIES_KEY] }),
  });
}

export function useDeleteEnquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEnquiryRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [ENQUIRIES_KEY] }),
  });
}
