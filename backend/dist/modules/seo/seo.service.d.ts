import { CategoriesService } from "../categories/categories.service";
import { ProductsService } from "../products/products.service";
import { ProjectsService } from "../projects/projects.service";
import { BlogsService } from "../blogs/blogs.service";
import { SitemapData } from './interfaces/sitemap-entry.interface';
export declare class SeoService {
    private readonly categoriesService;
    private readonly productsService;
    private readonly projectsService;
    private readonly blogsService;
    constructor(categoriesService: CategoriesService, productsService: ProductsService, projectsService: ProjectsService, blogsService: BlogsService);
    private collectAll;
    getSitemapData(): Promise<SitemapData>;
}
