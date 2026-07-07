import type { EntityStatus, MediaAsset } from './common';

export type CategoryStatus = EntityStatus;

export interface Category {
  _id: string;
  name: string;
  slug: string;
  banner?: MediaAsset;
  thumbnail?: MediaAsset;
  description?: string;
  displayOrder: number;
  status: CategoryStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CategoryStatus;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  banner?: MediaAsset;
  thumbnail?: MediaAsset;
  displayOrder?: number;
  status: CategoryStatus;
  isFeatured: boolean;
}
