import type { MediaAsset } from './common';

export type BlogStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategoryPayload {
  name: string;
  slug?: string;
  displayOrder?: number;
}

export interface BlogCategoryRef {
  _id: string;
  name: string;
  slug: string;
}

/** Per-post FAQ pair — distinct from the site-wide homepage FAQs collection. */
export interface BlogFaqItem {
  question: string;
  answer: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: MediaAsset;
  images: MediaAsset[];
  faqs: BlogFaqItem[];
  category?: BlogCategoryRef;
  tags: string[];
  status: BlogStatus;
  publishAt?: string;
  isFeatured: boolean;
  authorName?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: BlogStatus;
  category?: string;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BlogPayload {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  featuredImage?: MediaAsset;
  images?: MediaAsset[];
  faqs?: BlogFaqItem[];
  category?: string;
  tags?: string[];
  status: BlogStatus;
  publishAt?: string;
  isFeatured: boolean;
  authorName?: string;
}
