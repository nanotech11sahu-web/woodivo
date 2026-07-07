import type { MediaAsset } from './common';

// backend/src/common/schemas/specification-item.schema.ts stores `key`,
// not `label` -- this type had it wrong since an earlier phase, unnoticed
// because nothing rendered `specifications` until this phase's product
// details page.
export interface SpecificationItem {
  key: string;
  value: string;
}

// What ProductsService.findAllPublic/findBySlugPublic actually populate
// `category` with (CATEGORY_POPULATE_FIELDS = 'name slug thumbnail status'
// in products.service.ts) -- not the full Category record (no banner,
// description, seo, displayOrder). Mirrors the CMS's own CategoryRef
// (cms/src/types/product.ts) rather than reusing the full Category type
// the way the previous version of this file did.
export interface ProductCategoryRef {
  _id: string;
  name: string;
  slug: string;
  thumbnail?: MediaAsset;
  status: 'active' | 'inactive';
}

// What findBySlugPublic's relatedProducts populate actually returns
// (select: 'name slug images', filtered to active products only via
// match) -- not an array of ids. Mirrors the CMS's RelatedProductRef.
export interface RelatedProductRef {
  _id: string;
  name: string;
  slug: string;
  images?: MediaAsset[];
}

export interface Product {
  _id: string;
  category: ProductCategoryRef | string;
  name: string;
  slug: string;
  images: MediaAsset[];
  description?: string;
  specifications: SpecificationItem[];
  isFeatured: boolean;
  relatedProducts: RelatedProductRef[];
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface QueryPublicProductParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  featured?: boolean;
}
