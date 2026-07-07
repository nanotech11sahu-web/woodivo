export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface MediaAsset {
  url: string;
  publicId?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface SeoMeta {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

export type EntityStatus = 'active' | 'inactive';
