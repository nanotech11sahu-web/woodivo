import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { BlogCategory, BlogCategoryPayload } from '@/types/blog';

const BLOG_CATEGORIES_KEY = 'blog-categories';

async function fetchBlogCategories(): Promise<BlogCategory[]> {
  const { data } = await apiClient.get<BlogCategory[]>('/admin/blog-categories');
  return data;
}

async function createBlogCategoryRequest(payload: BlogCategoryPayload): Promise<BlogCategory> {
  const { data } = await apiClient.post<BlogCategory>('/admin/blog-categories', payload);
  return data;
}

async function updateBlogCategoryRequest(
  id: string,
  payload: BlogCategoryPayload,
): Promise<BlogCategory> {
  const { data } = await apiClient.patch<BlogCategory>(`/admin/blog-categories/${id}`, payload);
  return data;
}

async function deleteBlogCategoryRequest(id: string): Promise<void> {
  await apiClient.delete(`/admin/blog-categories/${id}`);
}

async function reorderBlogCategoriesRequest(
  items: { id: string; displayOrder: number }[],
): Promise<void> {
  await apiClient.patch('/admin/blog-categories/reorder', { items });
}

/** Unpaginated — same shape the backend's product `Category` reorder screen and the blog form's category picker both need. */
export function useBlogCategories() {
  return useQuery({
    queryKey: [BLOG_CATEGORIES_KEY, 'list'],
    queryFn: fetchBlogCategories,
    staleTime: 60_000,
  });
}

export function useCreateBlogCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBlogCategoryRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BLOG_CATEGORIES_KEY] }),
  });
}

export function useUpdateBlogCategory(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BlogCategoryPayload) => updateBlogCategoryRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BLOG_CATEGORIES_KEY] }),
  });
}

export function useDeleteBlogCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBlogCategoryRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BLOG_CATEGORIES_KEY] }),
  });
}

export function useReorderBlogCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderBlogCategoriesRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BLOG_CATEGORIES_KEY] }),
  });
}
