import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { AboutPage, UpdateAboutPagePayload } from '@/types/about';

const ABOUT_KEY = 'about-page';

async function fetchAboutPage(): Promise<AboutPage> {
  const { data } = await apiClient.get<AboutPage>('/admin/about');
  return data;
}

async function updateAboutPageRequest(
  payload: UpdateAboutPagePayload,
): Promise<AboutPage> {
  const { data } = await apiClient.patch<AboutPage>('/admin/about', payload);
  return data;
}

export function useAboutPage() {
  return useQuery({
    queryKey: [ABOUT_KEY],
    queryFn: fetchAboutPage,
  });
}

/** PATCH response is the full singleton document — write straight into the
 * cache instead of invalidating, same reasoning as useUpdateWebsiteSettings. */
export function useUpdateAboutPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAboutPageRequest,
    onSuccess: (data) => {
      queryClient.setQueryData([ABOUT_KEY], data);
    },
  });
}
