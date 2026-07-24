import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type {
  CustomPost,
  CustomPostListParams,
  CustomPostPayload,
} from '@/types/custom-post';
import type { PostToSocialOptions, PostToSocialResponse } from '@/types/social';

const CUSTOM_POSTS_KEY = 'custom-posts';

async function fetchCustomPosts(
  params: CustomPostListParams,
): Promise<PaginatedResult<CustomPost>> {
  const { data } = await apiClient.get<PaginatedResult<CustomPost>>('/admin/custom-posts', {
    params,
  });
  return data;
}

async function fetchCustomPost(id: string): Promise<CustomPost> {
  const { data } = await apiClient.get<CustomPost>(`/admin/custom-posts/${id}`);
  return data;
}

async function createCustomPostRequest(payload: CustomPostPayload): Promise<CustomPost> {
  const { data } = await apiClient.post<CustomPost>('/admin/custom-posts', payload);
  return data;
}

async function updateCustomPostRequest(
  id: string,
  payload: CustomPostPayload,
): Promise<CustomPost> {
  const { data } = await apiClient.patch<CustomPost>(`/admin/custom-posts/${id}`, payload);
  return data;
}

async function deleteCustomPostRequest(id: string): Promise<void> {
  await apiClient.delete(`/admin/custom-posts/${id}`);
}

async function postCustomPostsToSocialRequest(
  ids: string[],
  options?: PostToSocialOptions,
): Promise<PostToSocialResponse> {
  const { data } = await apiClient.post<PostToSocialResponse>(
    '/admin/custom-posts/post-to-social',
    { ids, ...options },
  );
  return data;
}

export function useCustomPosts(params: CustomPostListParams) {
  return useQuery({
    queryKey: [CUSTOM_POSTS_KEY, 'list', params],
    queryFn: () => fetchCustomPosts(params),
    placeholderData: keepPreviousData,
  });
}

export function useCustomPost(id: string | undefined) {
  return useQuery({
    queryKey: [CUSTOM_POSTS_KEY, 'detail', id],
    queryFn: () => fetchCustomPost(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateCustomPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomPostRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CUSTOM_POSTS_KEY] }),
  });
}

export function useUpdateCustomPost(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomPostPayload) => updateCustomPostRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CUSTOM_POSTS_KEY] }),
  });
}

export function useDeleteCustomPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomPostRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CUSTOM_POSTS_KEY] }),
  });
}

export function usePostCustomPostsToSocial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, options }: { ids: string[]; options?: PostToSocialOptions }) =>
      postCustomPostsToSocialRequest(ids, options),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CUSTOM_POSTS_KEY] }),
  });
}
