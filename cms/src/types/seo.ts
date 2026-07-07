import type { SeoMeta } from './common';

export type SeoPageType =
  | 'home'
  | 'about'
  | 'contact'
  | 'gallery'
  | 'projects-listing'
  | 'blogs-listing'
  | 'product'
  | 'blog'
  | 'category'
  | 'project'
  | 'custom';

export interface SeoEntry extends SeoMeta {
  _id: string;
  path: string;
  pageType: SeoPageType;
  entityId?: string;
  entityLabel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeoEntryListParams {
  page?: number;
  limit?: number;
  search?: string;
  pageType?: SeoPageType;
}

/** Only the meta fields are ever editable from the CMS — path/pageType/entityId are derived and stay read-only in the form. */
export type SeoEntryUpdatePayload = SeoMeta;

export interface SeoEntryCreatePayload extends SeoMeta {
  path: string;
}
