import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type {
  SubCategory,
  SubCategoryListParams,
  SubCategoryPayload,
  SubCategoryStatus,
} from '@/types/subcategory';

const SUBCATEGORIES_KEY = 'subcategories';

async function fetchSubCategories(
  params: SubCategoryListParams,
): Promise<PaginatedResult<SubCategory>> {
  const { data } = await apiClient.get<PaginatedResult<SubCategory>>('/admin/subcategories', {
    params,
  });
  return data;
}

async function fetchSubCategory(id: string): Promise<SubCategory> {
  const { data } = await apiClient.get<SubCategory>(`/admin/subcategories/${id}`);
  return data;
}

async function createSubCategoryRequest(payload: SubCategoryPayload): Promise<SubCategory> {
  const { data } = await apiClient.post<SubCategory>('/admin/subcategories', payload);
  return data;
}

async function updateSubCategoryRequest(
  id: string,
  payload: SubCategoryPayload,
): Promise<SubCategory> {
  const { data } = await apiClient.patch<SubCategory>(`/admin/subcategories/${id}`, payload);
  return data;
}

async function deleteSubCategoryRequest(id: string): Promise<void> {
  await apiClient.delete(`/admin/subcategories/${id}`);
}

async function reorderSubCategoriesRequest(
  items: { id: string; displayOrder: number }[],
): Promise<void> {
  await apiClient.patch('/admin/subcategories/reorder', { items });
}

export function useSubCategories(params: SubCategoryListParams) {
  return useQuery({
    queryKey: [SUBCATEGORIES_KEY, 'list', params],
    queryFn: () => fetchSubCategories(params),
    placeholderData: keepPreviousData,
  });
}

export function useSubCategory(id: string | undefined) {
  return useQuery({
    queryKey: [SUBCATEGORIES_KEY, 'detail', id],
    queryFn: () => fetchSubCategory(id as string),
    enabled: Boolean(id),
  });
}

/**
 * For populating subcategory pickers elsewhere (e.g. the product form).
 * Pass `categoryId` to scope the options to one category — the product
 * form re-runs this every time the chosen category changes so the
 * subcategory dropdown always matches.
 */
export function useSubCategoryOptions(categoryId: string | undefined) {
  return useQuery({
    queryKey: [SUBCATEGORIES_KEY, 'options', categoryId],
    queryFn: () =>
      fetchSubCategories({
        page: 1,
        limit: 100,
        category: categoryId,
        sortBy: 'displayOrder',
        sortOrder: 'asc',
      }),
    enabled: Boolean(categoryId),
    staleTime: 60_000,
  });
}

export function useCreateSubCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSubCategoryRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SUBCATEGORIES_KEY] }),
  });
}

export function useUpdateSubCategory(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubCategoryPayload) => updateSubCategoryRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SUBCATEGORIES_KEY] }),
  });
}

export function useDeleteSubCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSubCategoryRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SUBCATEGORIES_KEY] }),
  });
}

export function useReorderSubCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderSubCategoriesRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SUBCATEGORIES_KEY] }),
  });
}

export type { SubCategoryStatus };
