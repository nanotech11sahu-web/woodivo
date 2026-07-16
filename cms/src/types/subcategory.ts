import type { EntityStatus, MediaAsset } from './common';

export type SubCategoryStatus = EntityStatus;

/** Minimal category info populated onto a subcategory by the API. */
export interface SubCategoryCategoryRef {
  _id: string;
  name: string;
  slug: string;
  thumbnail?: MediaAsset;
  status: EntityStatus;
}

export interface SubCategory {
  _id: string;
  category: SubCategoryCategoryRef;
  name: string;
  slug: string;
  banner?: MediaAsset;
  thumbnail?: MediaAsset;
  description?: string;
  displayOrder: number;
  status: SubCategoryStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubCategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SubCategoryStatus;
  isFeatured?: boolean;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SubCategoryPayload {
  category: string;
  name: string;
  slug?: string;
  description?: string;
  banner?: MediaAsset;
  thumbnail?: MediaAsset;
  displayOrder?: number;
  status: SubCategoryStatus;
  isFeatured: boolean;
}
