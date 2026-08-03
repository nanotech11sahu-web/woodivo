import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { trackEnquirySubmitted } from '@/lib/analytics';
import type { CreateEnquiryPayload, EnquiryConfirmation } from '@/types/enquiry';
import type { MediaAsset } from '@/types/common';

/** Single mutation backing every enquiry form on the site -- tracking the
 * lead event here, rather than in each form, means every submission path
 * (contact form, customize form, suggested-products quick-enquiry) reports
 * consistently without each caller needing to remember to. */
export function useCreateEnquiry() {
  return useMutation({
    mutationFn: async (payload: CreateEnquiryPayload) => {
      const { data } = await apiClient.post<EnquiryConfirmation>(
        '/enquiries',
        payload,
      );
      return data;
    },
    onSuccess: () => {
      trackEnquirySubmitted();
    },
  });
}

/** Uploads reference photos for the "Customize this product" form ahead of
 * the enquiry submission itself, so the enquiry POST can send back plain
 * MediaAsset objects rather than juggling multipart + JSON in one request. */
export function useUploadEnquiryImages() {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      const { data } = await apiClient.post<MediaAsset[]>(
        '/enquiries/upload-images',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return data;
    },
  });
}
