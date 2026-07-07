export interface SitemapEntry {
  slug: string;
  updatedAt: Date;
}

export interface SitemapData {
  categories: SitemapEntry[];
  products: SitemapEntry[];
  blogs: SitemapEntry[];
  projects: SitemapEntry[];
}
