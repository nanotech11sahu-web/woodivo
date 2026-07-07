import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type { Testimonial, TestimonialListParams, TestimonialPayload } from '@/types/testimonial';

const TESTIMONIALS_KEY = 'testimonials';

async function fetchTestimonials(params: TestimonialListParams): Promise<PaginatedResult<Testimonial>> {
  const { data } = await apiClient.get<PaginatedResult<Testimonial>>('/admin/testimonials', { params });
  return data;
}

async function fetchTestimonial(id: string): Promise<Testimonial> {
  const { data } = await apiClient.get<Testimonial>(`/admin/testimonials/${id}`);
  return data;
}

async function createTestimonialRequest(payload: TestimonialPayload): Promise<Testimonial> {
  const { data } = await apiClient.post<Testimonial>('/admin/testimonials', payload);
  return data;
}

async function updateTestimonialRequest(id: string, payload: TestimonialPayload): Promise<Testimonial> {
  const { data } = await apiClient.patch<Testimonial>(`/admin/testimonials/${id}`, payload);
  return data;
}

async function deleteTestimonialRequest(id: string): Promise<void> {
  await apiClient.delete(`/admin/testimonials/${id}`);
}

async function reorderTestimonialsRequest(
  items: { id: string; displayOrder: number }[],
): Promise<void> {
  await apiClient.patch('/admin/testimonials/reorder', { items });
}

export function useTestimonials(params: TestimonialListParams) {
  return useQuery({
    queryKey: [TESTIMONIALS_KEY, 'list', params],
    queryFn: () => fetchTestimonials(params),
    placeholderData: keepPreviousData,
  });
}

export function useTestimonial(id: string | undefined) {
  return useQuery({
    queryKey: [TESTIMONIALS_KEY, 'detail', id],
    queryFn: () => fetchTestimonial(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTestimonialRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TESTIMONIALS_KEY] }),
  });
}

export function useUpdateTestimonial(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TestimonialPayload) => updateTestimonialRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TESTIMONIALS_KEY] }),
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTestimonialRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TESTIMONIALS_KEY] }),
  });
}

export function useReorderTestimonials() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderTestimonialsRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TESTIMONIALS_KEY] }),
  });
}
