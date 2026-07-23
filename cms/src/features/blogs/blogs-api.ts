import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type { Blog, BlogListParams, BlogPayload } from '@/types/blog';
import type { PostToSocialOptions, PostToSocialResponse } from '@/types/social';

const BLOGS_KEY = 'blogs';

async function fetchBlogs(params: BlogListParams): Promise<PaginatedResult<Blog>> {
  const { data } = await apiClient.get<PaginatedResult<Blog>>('/admin/blogs', { params });
  return data;
}

async function fetchBlog(id: string): Promise<Blog> {
  const { data } = await apiClient.get<Blog>(`/admin/blogs/${id}`);
  return data;
}

async function createBlogRequest(payload: BlogPayload): Promise<Blog> {
  const { data } = await apiClient.post<Blog>('/admin/blogs', payload);
  return data;
}

async function updateBlogRequest(id: string, payload: BlogPayload): Promise<Blog> {
  const { data } = await apiClient.patch<Blog>(`/admin/blogs/${id}`, payload);
  return data;
}

async function deleteBlogRequest(id: string): Promise<void> {
  await apiClient.delete(`/admin/blogs/${id}`);
}

async function postBlogsToSocialRequest(
  ids: string[],
  options?: PostToSocialOptions,
): Promise<PostToSocialResponse> {
  const { data } = await apiClient.post<PostToSocialResponse>('/admin/blogs/post-to-social', {
    ids,
    ...options,
  });
  return data;
}

export function useBlogs(params: BlogListParams) {
  return useQuery({
    queryKey: [BLOGS_KEY, 'list', params],
    queryFn: () => fetchBlogs(params),
    placeholderData: keepPreviousData,
  });
}

export function useBlog(id: string | undefined) {
  return useQuery({
    queryKey: [BLOGS_KEY, 'detail', id],
    queryFn: () => fetchBlog(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBlogRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BLOGS_KEY] }),
  });
}

export function useUpdateBlog(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BlogPayload) => updateBlogRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BLOGS_KEY] }),
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBlogRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BLOGS_KEY] }),
  });
}

export function usePostBlogsToSocial() {
  return useMutation({
    mutationFn: ({ ids, options }: { ids: string[]; options?: PostToSocialOptions }) =>
      postBlogsToSocialRequest(ids, options),
  });
}
