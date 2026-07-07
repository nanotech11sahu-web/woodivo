import type { Response } from 'express';
import { SeoService } from './seo.service';
export declare class SeoController {
    private readonly seoService;
    constructor(seoService: SeoService);
    getSitemapData(): Promise<import("./interfaces/sitemap-entry.interface").SitemapData>;
    getSitemapXml(res: Response): Promise<void>;
    getRobotsTxt(res: Response): void;
}
