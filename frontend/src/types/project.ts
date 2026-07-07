import type { MediaAsset } from './common';

// What ProjectsService.findAllPublic/findBySlugPublic actually populate
// `category` with (CATEGORY_POPULATE_FIELDS = 'name slug thumbnail status'
// in projects.service.ts) -- not the full Category record (no banner,
// description, seo, displayOrder). Same bug types/product.ts had until
// Phase 19 fixed it there; project.ts carried the same `Category | string`
// shape untouched because nothing rendered `project.category` yet.
export interface ProjectCategoryRef {
  _id: string;
  name: string;
  slug: string;
  thumbnail?: MediaAsset;
  status: 'active' | 'inactive';
}

export interface Project {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  clientName?: string;
  location?: string;
  completionYear?: string;
  category?: ProjectCategoryRef | string;
  coverImage?: MediaAsset;
  images: MediaAsset[];
  isFeatured: boolean;
  displayOrder: number;
}
