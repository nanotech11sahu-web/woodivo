"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const categories_service_1 = require("../categories/categories.service");
const products_service_1 = require("../products/products.service");
const projects_service_1 = require("../projects/projects.service");
const blogs_service_1 = require("../blogs/blogs.service");
const MAX_PAGES_PER_ENTITY = 500;
const PAGE_SIZE = 100;
const STATIC_ROUTES = [
    { path: '/', changefreq: 'daily', priority: 1.0 },
    { path: '/about', changefreq: 'monthly', priority: 0.6 },
    { path: '/projects', changefreq: 'weekly', priority: 0.7 },
    { path: '/gallery', changefreq: 'monthly', priority: 0.5 },
    { path: '/blogs', changefreq: 'daily', priority: 0.7 },
    { path: '/contact', changefreq: 'monthly', priority: 0.5 },
];
let SeoService = class SeoService {
    configService;
    categoriesService;
    productsService;
    projectsService;
    blogsService;
    siteUrl;
    constructor(configService, categoriesService, productsService, projectsService, blogsService) {
        this.configService = configService;
        this.categoriesService = categoriesService;
        this.productsService = productsService;
        this.projectsService = projectsService;
        this.blogsService = blogsService;
        const configured = this.configService.get('app')?.publicSiteUrl ?? '';
        this.siteUrl = configured.replace(/\/+$/, '');
    }
    async collectAll(fetchPage) {
        const items = [];
        let page = 1;
        for (; page <= MAX_PAGES_PER_ENTITY; page++) {
            const result = await fetchPage(page);
            items.push(...result.items);
            if (!result.meta.hasNextPage)
                break;
        }
        return items;
    }
    async getSitemapData() {
        const [categories, products, blogs, projects] = await Promise.all([
            this.categoriesService.findAllPublic(),
            this.collectAll((page) => this.productsService.findAllPublic({ page, limit: PAGE_SIZE })),
            this.collectAll((page) => this.blogsService.findAllPublic({ page, limit: PAGE_SIZE })),
            this.collectAll((page) => this.projectsService.findAllPublic({ page, limit: PAGE_SIZE })),
        ]);
        const toEntry = (doc) => ({
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
    async getSitemapXml() {
        const data = await this.getSitemapData();
        const staticUrls = STATIC_ROUTES.map((route) => `  <url>\n` +
            `    <loc>${this.escapeXml(this.absoluteUrl(route.path))}</loc>\n` +
            `    <changefreq>${route.changefreq}</changefreq>\n` +
            `    <priority>${route.priority.toFixed(1)}</priority>\n` +
            `  </url>`);
        const entityUrls = [
            ...this.buildEntityUrls(data.categories, '/categories', 0.8, 'weekly'),
            ...this.buildEntityUrls(data.products, '/products', 0.8, 'weekly'),
            ...this.buildEntityUrls(data.blogs, '/blogs', 0.6, 'monthly'),
            ...this.buildEntityUrls(data.projects, '/projects', 0.6, 'monthly'),
        ];
        return (`<?xml version="1.0" encoding="UTF-8"?>\n` +
            `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
            [...staticUrls, ...entityUrls].join('\n') +
            `\n</urlset>\n`);
    }
    getRobotsTxt() {
        return (`User-agent: *\n` +
            `Allow: /\n` +
            `Disallow: /admin\n` +
            `\n` +
            `Sitemap: ${this.absoluteUrl('/sitemap.xml')}\n`);
    }
    buildEntityUrls(entries, basePath, priority, changefreq) {
        return entries.map((entry) => {
            const loc = this.absoluteUrl(`${basePath}/${entry.slug}`);
            const lastmod = entry.updatedAt.toISOString().split('T')[0];
            return (`  <url>\n` +
                `    <loc>${this.escapeXml(loc)}</loc>\n` +
                `    <lastmod>${lastmod}</lastmod>\n` +
                `    <changefreq>${changefreq}</changefreq>\n` +
                `    <priority>${priority.toFixed(1)}</priority>\n` +
                `  </url>`);
        });
    }
    absoluteUrl(path) {
        return `${this.siteUrl}${path}`;
    }
    escapeXml(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
};
exports.SeoService = SeoService;
exports.SeoService = SeoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        categories_service_1.CategoriesService,
        products_service_1.ProductsService,
        projects_service_1.ProjectsService,
        blogs_service_1.BlogsService])
], SeoService);
//# sourceMappingURL=seo.service.js.map