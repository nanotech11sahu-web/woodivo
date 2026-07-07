import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/common';
import type { CreateUserPayload, User, UserListParams, UserStatus } from '@/types/user';
import type { UserRole } from '@/types/auth';

const USERS_KEY = 'users';

async function fetchUsers(params: UserListParams): Promise<PaginatedResult<User>> {
  const { data } = await apiClient.get<PaginatedResult<User>>('/admin/users', { params });
  return data;
}

async function createUserRequest(payload: CreateUserPayload): Promise<User> {
  const { data } = await apiClient.post<User>('/admin/users', payload);
  return data;
}

async function updateUserRoleRequest(id: string, role: UserRole): Promise<User> {
  const { data } = await apiClient.patch<User>(`/admin/users/${id}/role`, { role });
  return data;
}

async function updateUserStatusRequest(id: string, status: UserStatus): Promise<User> {
  const { data } = await apiClient.patch<User>(`/admin/users/${id}/status`, { status });
  return data;
}

async function deleteUserRequest(id: string): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`);
}

export function useUsers(params: UserListParams) {
  return useQuery({
    queryKey: [USERS_KEY, 'list', params],
    queryFn: () => fetchUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUserRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => updateUserRoleRequest(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      updateUserStatusRequest(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUserRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
}
