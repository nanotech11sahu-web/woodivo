import type { MediaAsset } from './common';

// What CustomizationsService.findAllPublic populates `category` with
// (CATEGORY_POPULATE_FIELDS = 'name slug' in customizations.service.ts) —
// same populate-shape as BlogCategoryRef, not the full Category record.
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
}

export interface QueryPublicCustomizationParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
}
