import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CategoriesService } from '@modules/categories/categories.service';
import { ProductsService } from '@modules/products/products.service';
import { ProjectsService } from '@modules/projects/projects.service';
import { BlogsService } from '@modules/blogs/blogs.service';
import type { PaginatedResult } from '@common/interfaces/paginated-result.interface';
import type { AppConfig } from '@config/configuration';
import {
  SitemapData,
  SitemapEntry,
} from './interfaces/sitemap-entry.interface';

// Sitemap protocol has no hard URL-count limit worth enforcing until a
// site nears ~50,000 URLs (the point a sitemap index becomes necessary).
// Woodivo's catalog is nowhere close, so a single <urlset> is fine — this
// constant only bounds how many pages collectAll() will walk per entity
// type as a safety net against an unbounded loop, not a product limit.
const MAX_PAGES_PER_ENTITY = 500;
const PAGE_SIZE = 100;

interface StaticRoute {
  path: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: number;
}

// Mirrors the top-level routes in frontend/src/routes.tsx that don't take
// a :slug — entity routes are appended separately from live DB data.
const STATIC_ROUTES: StaticRoute[] = [
  { path: '/', changefreq: 'daily', priority: 1.0 },
  { path: '/about', changefreq: 'monthly', priority: 0.6 },
  { path: '/projects', changefreq: 'weekly', priority: 0.7 },
  { path: '/gallery', changefreq: 'monthly', priority: 0.5 },
  { path: '/blogs', changefreq: 'daily', priority: 0.7 },
  { path: '/contact', changefreq: 'monthly', priority: 0.5 },
];

@Injectable()
export class SeoService {
  private readonly siteUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
    private readonly projectsService: ProjectsService,
    private readonly blogsService: BlogsService,
  ) {
    // Trim any trailing slash so every join below can safely do
    // `${this.siteUrl}${path}` without a double slash.
    const configured =
      this.configService.get<AppConfig>('app')?.publicSiteUrl ?? '';
    this.siteUrl = configured.replace(/\/+$/, '');
  }

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
    const [categories, products, blogs, projects] = await Promise.all([
      this.categoriesService.findAllPublic(),
      this.collectAll((page) =>
        this.productsService.findAllPublic({ page, limit: PAGE_SIZE }),
      ),
      this.collectAll((page) =>
        this.blogsService.findAllPublic({ page, limit: PAGE_SIZE }),
      ),
      this.collectAll((page) =>
        this.projectsService.findAllPublic({ page, limit: PAGE_SIZE }),
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
      projects: projects.map(toEntry),
    };
  }

  async getSitemapXml(): Promise<string> {
    const data = await this.getSitemapData();

    const staticUrls = STATIC_ROUTES.map(
      (route) =>
        `  <url>\n` +
        `    <loc>${this.escapeXml(this.absoluteUrl(route.path))}</loc>\n` +
        `    <changefreq>${route.changefreq}</changefreq>\n` +
        `    <priority>${route.priority.toFixed(1)}</priority>\n` +
        `  </url>`,
    );

    const entityUrls = [
      ...this.buildEntityUrls(data.categories, '/categories', 0.8, 'weekly'),
      ...this.buildEntityUrls(data.products, '/products', 0.8, 'weekly'),
      ...this.buildEntityUrls(data.blogs, '/blogs', 0.6, 'monthly'),
      ...this.buildEntityUrls(data.projects, '/projects', 0.6, 'monthly'),
    ];

    return (
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      [...staticUrls, ...entityUrls].join('\n') +
      `\n</urlset>\n`
    );
  }

  getRobotsTxt(): string {
    return (
      `User-agent: *\n` +
      `Allow: /\n` +
      `Disallow: /admin\n` +
      `\n` +
      `Sitemap: ${this.absoluteUrl('/sitemap.xml')}\n`
    );
  }

  private buildEntityUrls(
    entries: SitemapEntry[],
    basePath: string,
    priority: number,
    changefreq: StaticRoute['changefreq'],
  ): string[] {
    return entries.map((entry) => {
      const loc = this.absoluteUrl(`${basePath}/${entry.slug}`);
      const lastmod = entry.updatedAt.toISOString().split('T')[0];
      return (
        `  <url>\n` +
        `    <loc>${this.escapeXml(loc)}</loc>\n` +
        `    <lastmod>${lastmod}</lastmod>\n` +
        `    <changefreq>${changefreq}</changefreq>\n` +
        `    <priority>${priority.toFixed(1)}</priority>\n` +
        `  </url>`
      );
    });
  }

  private absoluteUrl(path: string): string {
    return `${this.siteUrl}${path}`;
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
