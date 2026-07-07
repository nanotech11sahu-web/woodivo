import { apiClient } from '@/lib/api-client';
import type { LoginResponse } from '@/types/auth';

export async function loginRequest(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', {
    email,
    password,
  });
  return data;
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post('/auth/logout');
}
