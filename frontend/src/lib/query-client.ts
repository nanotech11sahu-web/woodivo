import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Content here is CMS-authored, not real-time — a longer staleTime
      // than the CMS's own 30s default avoids re-fetching the same
      // category/settings data on every route change a visitor makes.
      staleTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
