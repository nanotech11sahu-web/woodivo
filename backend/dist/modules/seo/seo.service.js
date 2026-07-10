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
const categories_service_1 = require("../categories/categories.service");
const products_service_1 = require("../products/products.service");
const projects_service_1 = require("../projects/projects.service");
const blogs_service_1 = require("../blogs/blogs.service");
const MAX_PAGES_PER_ENTITY = 500;
const PAGE_SIZE = 100;
let SeoService = class SeoService {
    categoriesService;
    productsService;
    projectsService;
    blogsService;
    constructor(categoriesService, productsService, projectsService, blogsService) {
        this.categoriesService = categoriesService;
        this.productsService = productsService;
        this.projectsService = projectsService;
        this.blogsService = blogsService;
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
};
exports.SeoService = SeoService;
exports.SeoService = SeoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService,
        products_service_1.ProductsService,
        projects_service_1.ProjectsService,
        blogs_service_1.BlogsService])
], SeoService);
//# sourceMappingURL=seo.service.js.map