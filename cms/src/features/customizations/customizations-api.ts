import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type {
  Customization,
  CustomizationListParams,
  CustomizationPayload,
} from '@/types/customization';

const CUSTOMIZATIONS_KEY = 'customizations';

async function fetchCustomizations(
  params: CustomizationListParams,
): Promise<PaginatedResult<Customization>> {
  const { data } = await apiClient.get<PaginatedResult<Customization>>('/admin/customizations', {
    params,
  });
  return data;
}

async function fetchCustomization(id: string): Promise<Customization> {
  const { data } = await apiClient.get<Customization>(`/admin/customizations/${id}`);
  return data;
}

async function createCustomizationRequest(payload: CustomizationPayload): Promise<Customization> {
  const { data } = await apiClient.post<Customization>('/admin/customizations', payload);
  return data;
}

async function updateCustomizationRequest(
  id: string,
  payload: CustomizationPayload,
): Promise<Customization> {
  const { data } = await apiClient.patch<Customization>(`/admin/customizations/${id}`, payload);
  return data;
}

async function deleteCustomizationRequest(id: string): Promise<void> {
  await apiClient.delete(`/admin/customizations/${id}`);
}

async function reorderCustomizationsRequest(
  items: { id: string; displayOrder: number }[],
): Promise<void> {
  await apiClient.patch('/admin/customizations/reorder', { items });
}

export function useCustomizations(params: CustomizationListParams) {
  return useQuery({
    queryKey: [CUSTOMIZATIONS_KEY, 'list', params],
    queryFn: () => fetchCustomizations(params),
    placeholderData: keepPreviousData,
  });
}

export function useCustomization(id: string | undefined) {
  return useQuery({
    queryKey: [CUSTOMIZATIONS_KEY, 'detail', id],
    queryFn: () => fetchCustomization(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateCustomization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomizationRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CUSTOMIZATIONS_KEY] }),
  });
}

export function useUpdateCustomization(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomizationPayload) => updateCustomizationRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CUSTOMIZATIONS_KEY] }),
  });
}

export function useDeleteCustomization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomizationRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CUSTOMIZATIONS_KEY] }),
  });
}

export function useReorderCustomizations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderCustomizationsRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CUSTOMIZATIONS_KEY] }),
  });
}
