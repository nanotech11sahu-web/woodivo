import type { MediaAsset } from './common';

export type CustomPostStatus = 'draft' | 'posted';

// CMS-only content: no slug, no SEO-for-website fields, never rendered on
// the public storefront - it exists purely to drive social posting.
export interface CustomPost {
  _id: string;
  title: string;
  images: MediaAsset[];
  caption: string;
  keywords: string[];
  tone?: string;
  cta?: string;
  status: CustomPostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CustomPostListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomPostStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomPostPayload {
  title: string;
  images: MediaAsset[];
  caption: string;
  keywords?: string[];
  tone?: string;
  cta?: string;
  status?: CustomPostStatus;
}
