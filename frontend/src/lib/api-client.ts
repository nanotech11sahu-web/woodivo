import axios from 'axios';
import i18n from '@/lib/i18n';

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

// Adds the active i18next language as `?lang=` on every request so the
// backend's TranslationService (see backend/src/modules/translation) can
// machine-translate CMS-authored content — product/blog/category copy,
// testimonials, FAQs — for non-English visitors. Skipped if the request
// already sets its own `lang` param.
apiClient.interceptors.request.use((config) => {
  config.params = { lang: i18n.language, ...config.params };
  return config;
});

apiClient.interceptors.response.use((response) => {
  const body = response.data as unknown;
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    response.data = (body as { data: unknown }).data;
  }
  return response;
});
