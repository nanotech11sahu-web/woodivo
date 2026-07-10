import { BlogsService } from "../blogs/blogs.service";
import { BlogCategoriesService } from "../blogs/blog-categories.service";
import { MediaService } from "../media/media.service";
import { SeoEntriesService } from "../seo-entries/seo-entries.service";
export interface DraftBlogPostResult {
    title: string;
    slug: string;
    id: string;
}
export interface DraftZipResult {
    zipName: string;
    status: 'success' | 'failed';
    posts?: DraftBlogPostResult[];
    error?: string;
}
export interface PendingDraftZip {
    filename: string;
    sizeBytes: number;
    uploadedAt: string;
}
export declare class DraftBlogUploaderService {
    private readonly blogsService;
    private readonly blogCategoriesService;
    private readonly mediaService;
    private readonly seoEntriesService;
    private readonly logger;
    constructor(blogsService: BlogsService, blogCategoriesService: BlogCategoriesService, mediaService: MediaService, seoEntriesService: SeoEntriesService);
    saveIncomingZip(buffer: Buffer, originalname: string): PendingDraftZip;
    listPending(): PendingDraftZip[];
    removePending(filename: string): void;
    runAll(): Promise<DraftZipResult[]>;
    private fetchCategoryMap;
    private processZip;
    private processBlogFolder;
    private uploadLocalImage;
    private spliceImageUrls;
}
