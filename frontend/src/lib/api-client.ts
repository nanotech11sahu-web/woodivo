import axios from 'axios';

/**
 * The public site never authenticates — there's no login here, only
 * anonymous reads plus the enquiry POST. So, unlike the CMS's api-client,
 * there's no token storage, no refresh-token interceptor, no redirect-to-
 * login. What's kept identical is the envelope unwrap: the backend's
 * global TransformInterceptor wraps every response as
 * { success, statusCode, message, data, timestamp } regardless of which
 * app is calling it, so this still needs to unwrap `data` once here
 * rather than have every hook reach into `response.data.data`.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1',
});

apiClient.interceptors.response.use((response) => {
  const body = response.data as unknown;
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    response.data = (body as { data: unknown }).data;
  }
  return response;
});
