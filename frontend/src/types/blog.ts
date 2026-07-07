import type { MediaAsset } from './common';

// What BlogsService.findAllPublic / findBySlugPublic / findLatestPublic
// actually populate `category` with (CATEGORY_POPULATE_FIELDS = 'name slug'
// in blogs.service.ts) -- not the full BlogCategory record (no
// displayOrder). Same populate-shape bug types/product.ts (Phase 19) and
// types/project.ts (Phase 20) had before their category fields were ever
// rendered; this file carried a bare `category?: string` untouched because
// nothing read `blog.category` until this phase's listing/detail pages
// needed it for the category label and filter link.
export interface BlogCategoryRef {
  _id: string;
  name: string;
  slug: string;
}

// Separate from BlogCategoryRef: `GET /blogs/categories`
// (BlogCategoriesService.findAll, used by the listing page's filter pills)
// returns the full record sorted by displayOrder, so the pills render in
// the order set in the CMS rather than alphabetically or by insertion.
export interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
  displayOrder: number;
}

/** Per-post FAQ pair — distinct from the site-wide homepage FAQs collection. */
export interface BlogFaqItem {
  question: string;
  answer: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: MediaAsset;
  images: MediaAsset[];
  faqs: BlogFaqItem[];
  category?: BlogCategoryRef | string;
  tags: string[];
  publishAt?: string;
  isFeatured: boolean;
  authorName?: string;
  viewCount: number;
  createdAt: string;
}

export interface QueryPublicBlogParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
}
