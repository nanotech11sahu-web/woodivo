import type { MediaAsset } from './common';

export interface Category {
  _id: string;
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
