import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type { Product, ProductListParams, ProductPayload } from '@/types/product';

const PRODUCTS_KEY = 'products';

async function fetchProducts(params: ProductListParams): Promise<PaginatedResult<Product>> {
  const { data } = await apiClient.get<PaginatedResult<Product>>('/admin/products', { params });
  return data;
}

async function fetchProduct(id: string): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/admin/products/${id}`);
  return data;
}

async function createProductRequest(payload: ProductPayload): Promise<Product> {
  const { data } = await apiClient.post<Product>('/admin/products', payload);
  return data;
}

async function updateProductRequest(id: string, payload: ProductPayload): Promise<Product> {
  const { data } = await apiClient.patch<Product>(`/admin/products/${id}`, payload);
  return data;
}

async function deleteProductRequest(id: string): Promise<void> {
  await apiClient.delete(`/admin/products/${id}`);
}

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, 'list', params],
    queryFn: () => fetchProducts(params),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, 'detail', id],
    queryFn: () => fetchProduct(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProductRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPayload) => updateProductRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProductRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}
