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

// What findBySlugPublic's relatedBlogs populate actually returns
// (select: 'title slug excerpt featuredImage publishAt createdAt',
// filtered to published posts only via match) -- mirrors the CMS's
// RelatedBlogRef, and matches BlogCardItem's shape so the same card
// component can render it.
export interface RelatedBlogRef {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: MediaAsset;
  publishAt?: string;
  createdAt: string;
}

// Per-product FAQ pair — mirrors Blog['faqs'], distinct from the site-wide
// homepage FAQs collection.
export interface ProductFaqItem {
  question: string;
  answer: string;
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
  relatedBlogs: RelatedBlogRef[];
  faqs: ProductFaqItem[];
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
