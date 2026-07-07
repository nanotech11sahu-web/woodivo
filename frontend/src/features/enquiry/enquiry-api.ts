import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { CreateEnquiryPayload, EnquiryConfirmation } from '@/types/enquiry';

export function useCreateEnquiry() {
  return useMutation({
    mutationFn: async (payload: CreateEnquiryPayload) => {
      const { data } = await apiClient.post<EnquiryConfirmation>(
        '/enquiries',
        payload,
      );
      return data;
    },
  });
}
