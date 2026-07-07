export type EnquirySource =
  | 'homepage'
  | 'product'
  | 'category'
  | 'project'
  | 'contact'
  | 'floating_cta'
  | 'about';

export interface CreateEnquiryPayload {
  fullName: string;
  mobileNumber: string;
  city?: string;
  interestedCategory?: string;
  message?: string;
  source?: EnquirySource;
}

export interface EnquiryConfirmation {
  id: string;
  fullName: string;
  submittedAt: string;
}
