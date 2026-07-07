import axios from 'axios';

const ACCESS_TOKEN_KEY = 'woodivo_cms_access_token';
const REFRESH_TOKEN_KEY = 'woodivo_cms_refresh_token';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1',
});

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function redirectToLogin(): void {
  clearTokens();
  if (!window.location.pathname.startsWith('/login')) {
    window.location.assign('/login');
  }
}

/**
 * Every backend response is wrapped by the API's global TransformInterceptor
 * as { success, statusCode, message, data, timestamp }. Unwrap it once here
 * so the rest of the app can treat apiClient responses as the raw payload.
 */
function unwrapEnvelope(response: import('axios').AxiosResponse) {
  const body = response.data as unknown;
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    response.data = (body as { data: unknown }).data;
  }
  return response;
}

let refreshPromise: Promise<string> | null = null;

/**
 * On a 401, try exactly one silent refresh via the stored refresh token
 * before giving up. Concurrent 401s share the same in-flight refresh call
 * (refreshPromise) rather than each firing their own /auth/refresh request.
 */
apiClient.interceptors.response.use(
  unwrapEnvelope,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retried) {
      if (error.response?.status === 401) redirectToLogin();
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retried = true;

    try {
      refreshPromise ??= axios
        .post(`${apiClient.defaults.baseURL}/auth/refresh`, { refreshToken })
        .then(({ data }) => {
          setTokens(data.accessToken, data.refreshToken);
          return data.accessToken as string;
        })
        .finally(() => {
          refreshPromise = null;
        });

      const newAccessToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch {
      redirectToLogin();
      return Promise.reject(error);
    }
  },
);
