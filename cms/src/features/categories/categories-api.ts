import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type { Category, CategoryListParams, CategoryPayload, CategoryStatus } from '@/types/category';

const CATEGORIES_KEY = 'categories';

async function fetchCategories(params: CategoryListParams): Promise<PaginatedResult<Category>> {
  const { data } = await apiClient.get<PaginatedResult<Category>>('/admin/categories', { params });
  return data;
}

async function fetchCategory(id: string): Promise<Category> {
  const { data } = await apiClient.get<Category>(`/admin/categories/${id}`);
  return data;
}

async function createCategoryRequest(payload: CategoryPayload): Promise<Category> {
  const { data } = await apiClient.post<Category>('/admin/categories', payload);
  return data;
}

async function updateCategoryRequest(id: string, payload: CategoryPayload): Promise<Category> {
  const { data } = await apiClient.patch<Category>(`/admin/categories/${id}`, payload);
  return data;
}

async function deleteCategoryRequest(id: string): Promise<void> {
  await apiClient.delete(`/admin/categories/${id}`);
}

async function reorderCategoriesRequest(
  items: { id: string; displayOrder: number }[],
): Promise<void> {
  await apiClient.patch('/admin/categories/reorder', { items });
}

export function useCategories(params: CategoryListParams) {
  return useQuery({
    queryKey: [CATEGORIES_KEY, 'list', params],
    queryFn: () => fetchCategories(params),
    placeholderData: keepPreviousData,
  });
}

export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: [CATEGORIES_KEY, 'detail', id],
    queryFn: () => fetchCategory(id as string),
    enabled: Boolean(id),
  });
}

/** For populating category pickers elsewhere (e.g. the product form). */
export function useCategoryOptions() {
  return useQuery({
    queryKey: [CATEGORIES_KEY, 'options'],
    queryFn: () => fetchCategories({ page: 1, limit: 100, sortBy: 'displayOrder', sortOrder: 'asc' }),
    staleTime: 60_000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategoryRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] }),
  });
}

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryPayload) => updateCategoryRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategoryRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] }),
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderCategoriesRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] }),
  });
}

export type { CategoryStatus };
