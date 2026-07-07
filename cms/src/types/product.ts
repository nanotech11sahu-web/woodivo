import type { EntityStatus, MediaAsset } from './common';

export type ProductStatus = EntityStatus;

export interface SpecificationItem {
  key: string;
  value: string;
}

export interface CategoryRef {
  _id: string;
  name: string;
  slug: string;
  thumbnail?: MediaAsset;
  status: EntityStatus;
}

export interface RelatedProductRef {
  _id: string;
  name: string;
  slug: string;
  images?: MediaAsset[];
  status?: ProductStatus;
}

export interface Product {
  _id: string;
  category: CategoryRef;
  name: string;
  slug: string;
  images: MediaAsset[];
  description?: string;
  specifications: SpecificationItem[];
  isFeatured: boolean;
  relatedProducts: RelatedProductRef[];
  displayOrder: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus;
  isFeatured?: boolean;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductPayload {
  category: string;
  name: string;
  slug?: string;
  images?: MediaAsset[];
  description?: string;
  specifications?: SpecificationItem[];
  isFeatured: boolean;
  relatedProducts?: string[];
  displayOrder?: number;
  status: ProductStatus;
}
