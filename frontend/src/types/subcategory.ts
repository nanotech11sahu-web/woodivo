import type { MediaAsset } from './common';

export interface SubCategoryCategoryRef {
  _id: string;
  name: string;
  slug: string;
  thumbnail?: MediaAsset;
  status: 'active' | 'inactive';
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
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}
