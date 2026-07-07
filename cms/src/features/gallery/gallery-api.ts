import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type { GalleryItem, GalleryItemListParams, GalleryItemPayload } from '@/types/gallery';

const GALLERY_KEY = 'gallery';

async function fetchGalleryItems(
  params: GalleryItemListParams,
): Promise<PaginatedResult<GalleryItem>> {
  const { data } = await apiClient.get<PaginatedResult<GalleryItem>>('/admin/gallery', { params });
  return data;
}

async function fetchGalleryItem(id: string): Promise<GalleryItem> {
  const { data } = await apiClient.get<GalleryItem>(`/admin/gallery/${id}`);
  return data;
}

async function createGalleryItemRequest(payload: GalleryItemPayload): Promise<GalleryItem> {
  const { data } = await apiClient.post<GalleryItem>('/admin/gallery', payload);
  return data;
}

async function updateGalleryItemRequest(
  id: string,
  payload: GalleryItemPayload,
): Promise<GalleryItem> {
  const { data } = await apiClient.patch<GalleryItem>(`/admin/gallery/${id}`, payload);
  return data;
}

async function deleteGalleryItemRequest(id: string): Promise<void> {
  await apiClient.delete(`/admin/gallery/${id}`);
}

async function reorderGalleryItemsRequest(
  items: { id: string; displayOrder: number }[],
): Promise<void> {
  await apiClient.patch('/admin/gallery/reorder', { items });
}

export function useGalleryItems(params: GalleryItemListParams) {
  return useQuery({
    queryKey: [GALLERY_KEY, 'list', params],
    queryFn: () => fetchGalleryItems(params),
    placeholderData: keepPreviousData,
  });
}

export function useGalleryItem(id: string | undefined) {
  return useQuery({
    queryKey: [GALLERY_KEY, 'detail', id],
    queryFn: () => fetchGalleryItem(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGalleryItemRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [GALLERY_KEY] }),
  });
}

export function useUpdateGalleryItem(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GalleryItemPayload) => updateGalleryItemRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [GALLERY_KEY] }),
  });
}

export function useDeleteGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGalleryItemRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [GALLERY_KEY] }),
  });
}

export function useReorderGalleryItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderGalleryItemsRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [GALLERY_KEY] }),
  });
}
