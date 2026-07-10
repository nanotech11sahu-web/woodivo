import type { MediaAsset } from './common';

export type EnquirySource =
  | 'homepage'
  | 'product'
  | 'category'
  | 'project'
  | 'contact'
  | 'floating_cta'
  | 'about'
  | 'custom_order';

export interface CreateEnquiryPayload {
  fullName: string;
  mobileNumber: string;
  state?: string;
  city?: string;
  interestedCategory?: string;
  interestedProduct?: string;
  referenceImages?: MediaAsset[];
  message?: string;
  source?: EnquirySource;
}

export interface EnquiryConfirmation {
  id: string;
  fullName: string;
  submittedAt: string;
}
