import { Injectable } from '@nestjs/common';
import { CategoriesService } from '@modules/categories/categories.service';
import { ProductsService } from '@modules/products/products.service';
import { BlogsService } from '@modules/blogs/blogs.service';
import type { PaginatedResult } from '@common/interfaces/paginated-result.interface';
import { SitemapData, SitemapEntry } from './interfaces/sitemap-entry.interface';

const MAX_PAGES_PER_ENTITY = 500;
const PAGE_SIZE = 100;

// Aggregates every public category/product/blog (slug + updatedAt)
// for the sitemap. This is the ONLY thing the backend does for SEO now —
// the actual sitemap.xml/sitemap-*.xml/robots.txt files are generated on
// every request by frontend serverless functions (frontend/api/sitemap.js,
// sitemap-index.js, robots.js) that call this endpoint live, not baked
// into a static file at frontend build time.
@Injectable()
export class SeoService {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
    private readonly blogsService: BlogsService,
  ) {}

  /**
   * Walks a paginated findAllPublic()-style method to collect every page,
   * not just the default first page — a sitemap needs the full set
   * regardless of the 100-item page cap findAllPublic() enforces for
   * normal listing requests.
   */
  private async collectAll<T>(
    fetchPage: (page: number) => Promise<PaginatedResult<T>>,
  ): Promise<T[]> {
    const items: T[] = [];
    let page = 1;

    for (; page <= MAX_PAGES_PER_ENTITY; page++) {
      const result = await fetchPage(page);
      items.push(...result.items);
      if (!result.meta.hasNextPage) break;
    }

    return items;
  }

  async getSitemapData(): Promise<SitemapData> {
    const [categories, products, blogs] = await Promise.all([
      this.categoriesService.findAllPublic(),
      this.collectAll((page) =>
        this.productsService.findAllPublic({ page, limit: PAGE_SIZE }),
      ),
      this.collectAll((page) =>
        this.blogsService.findAllPublic({ page, limit: PAGE_SIZE }),
      ),
    ]);

    const toEntry = (doc: {
      slug: string;
      updatedAt?: Date;
    }): SitemapEntry => ({
      slug: doc.slug,
      updatedAt: doc.updatedAt ?? new Date(),
    });

    return {
      categories: categories.map(toEntry),
      products: products.map(toEntry),
      blogs: blogs.map(toEntry),
    };
  }
}
