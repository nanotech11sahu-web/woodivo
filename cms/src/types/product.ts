import type { EntityStatus, MediaAsset } from './common';

export type ProductStatus = EntityStatus;

export type ProductStockStatus = 'in_stock' | 'out_of_stock' | 'made_to_order';

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

export interface SubCategoryRef {
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
  price?: number;
  status?: ProductStatus;
}

/** Blog post referenced for internal linking from a product's detail page. */
export interface RelatedBlogRef {
  _id: string;
  title: string;
  slug: string;
  featuredImage?: MediaAsset;
  status?: string;
}

/** Per-product FAQ pair — mirrors BlogFaqItem, distinct from the site-wide
 * homepage FAQs collection. */
export interface ProductFaqItem {
  question: string;
  answer: string;
}

export interface Product {
  _id: string;
  category: CategoryRef;
  subCategory?: SubCategoryRef;
  name: string;
  slug: string;
  images: MediaAsset[];
  description?: string;
  specifications: SpecificationItem[];
  price: number;
  discountPrice?: number;
  sku?: string;
  stockStatus: ProductStockStatus;
  needsPriceReview?: boolean;
  viewCount: number;
  purchaseCount: number;
  isFeatured: boolean;
  relatedProducts: RelatedProductRef[];
  relatedBlogs: RelatedBlogRef[];
  faqs: ProductFaqItem[];
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
  subCategory?: string;
  needsPriceReview?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductPayload {
  category: string;
  subCategory?: string | null;
  name: string;
  slug?: string;
  images?: MediaAsset[];
  description?: string;
  specifications?: SpecificationItem[];
  price: number;
  discountPrice?: number | null;
  sku?: string;
  stockStatus?: ProductStockStatus;
  isFeatured: boolean;
  relatedProducts?: string[];
  relatedBlogs?: string[];
  faqs?: ProductFaqItem[];
  displayOrder?: number;
  status: ProductStatus;
}
