import type { EntityStatus, MediaAsset } from './common';

export type CustomizationStatus = EntityStatus;

export interface CustomizationCategoryRef {
  _id: string;
  name: string;
  slug: string;
}

export interface Customization {
  _id: string;
  title: string;
  description?: string;
  images: MediaAsset[];
  category?: CustomizationCategoryRef;
  tags: string[];
  displayOrder: number;
  status: CustomizationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CustomizationListParams {
  page?: number;
  limit?: number;
  status?: CustomizationStatus;
  category?: string;
  tag?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomizationPayload {
  title: string;
  description?: string;
  images: MediaAsset[];
  category?: string;
  tags?: string[];
  displayOrder?: number;
  status?: CustomizationStatus;
}
