import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { UpdateWebsiteSettingsPayload, WebsiteSettings } from '@/types/settings';

const SETTINGS_KEY = 'settings';

async function fetchSettings(): Promise<WebsiteSettings> {
  const { data } = await apiClient.get<WebsiteSettings>('/admin/settings');
  return data;
}

async function updateSettingsRequest(
  payload: UpdateWebsiteSettingsPayload,
): Promise<WebsiteSettings> {
  const { data } = await apiClient.patch<WebsiteSettings>('/admin/settings', payload);
  return data;
}

export function useWebsiteSettings() {
  return useQuery({
    queryKey: [SETTINGS_KEY],
    queryFn: fetchSettings,
  });
}

/**
 * No `invalidateQueries` here — unlike every other module's mutations, the
 * PATCH response *is* the full singleton document, so writing it straight
 * into the cache with setQueryData avoids an extra round trip for data we
 * already have in hand.
 */
export function useUpdateWebsiteSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSettingsRequest,
    onSuccess: (data) => {
      queryClient.setQueryData([SETTINGS_KEY], data);
    },
  });
}
