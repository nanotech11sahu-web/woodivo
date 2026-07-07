export type EnquiryStatus = 'new' | 'seen' | 'contacted' | 'closed';

export type EnquirySource = 'homepage' | 'product' | 'category' | 'project' | 'contact' | 'floating_cta';

export interface EnquiryCategoryRef {
  _id: string;
  name: string;
  slug: string;
}

export interface Enquiry {
  _id: string;
  fullName: string;
  mobileNumber: string;
  city?: string;
  interestedCategory?: EnquiryCategoryRef;
  message?: string;
  status: EnquiryStatus;
  source: EnquirySource;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: EnquiryStatus;
  source?: EnquirySource;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Admin-side updates only — enquiries are created by the public site, never in the CMS. */
export interface EnquiryUpdatePayload {
  status?: EnquiryStatus;
  notes?: string;
}

export interface EnquiryStats {
  total: number;
  byStatus: Record<EnquiryStatus, number>;
}
