"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var DraftBlogUploaderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftBlogUploaderService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const app_constants_1 = require("../../common/constants/app.constants");
const blogs_service_1 = require("../blogs/blogs.service");
const blog_categories_service_1 = require("../blogs/blog-categories.service");
const media_service_1 = require("../media/media.service");
const seo_entries_service_1 = require("../seo-entries/seo-entries.service");
const seo_entry_schema_1 = require("../seo-entries/schemas/seo-entry.schema");
const blog_schema_1 = require("../blogs/schemas/blog.schema");
const multer_file_util_1 = require("./utils/multer-file.util");
const DRAFT_DIR = path.resolve(process.env.DRAFT_BLOGS_DIR || path.join(process.cwd(), '..', 'draft-blogs'));
const PROCESSED_DIR = path.resolve(process.env.PROCESSED_DIR || path.join(DRAFT_DIR, 'processed'));
const FAILED_DIR = path.resolve(process.env.FAILED_DIR || path.join(DRAFT_DIR, 'failed'));
function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}
let DraftBlogUploaderService = DraftBlogUploaderService_1 = class DraftBlogUploaderService {
    blogsService;
    blogCategoriesService;
    mediaService;
    seoEntriesService;
    logger = new common_1.Logger(DraftBlogUploaderService_1.name);
    constructor(blogsService, blogCategoriesService, mediaService, seoEntriesService) {
        this.blogsService = blogsService;
        this.blogCategoriesService = blogCategoriesService;
        this.mediaService = mediaService;
        this.seoEntriesService = seoEntriesService;
        ensureDir(DRAFT_DIR);
        ensureDir(PROCESSED_DIR);
        ensureDir(FAILED_DIR);
    }
    saveIncomingZip(buffer, originalname) {
        ensureDir(DRAFT_DIR);
        const safeName = path.basename(originalname).endsWith('.zip')
            ? path.basename(originalname)
            : `${path.basename(originalname)}.zip`;
        const destPath = path.join(DRAFT_DIR, safeName);
        fs.writeFileSync(destPath, buffer);
        const stat = fs.statSync(destPath);
        return { filename: safeName, sizeBytes: stat.size, uploadedAt: new Date().toISOString() };
    }
    listPending() {
        ensureDir(DRAFT_DIR);
        return fs
            .readdirSync(DRAFT_DIR)
            .filter((f) => f.toLowerCase().endsWith('.zip'))
            .map((filename) => {
            const stat = fs.statSync(path.join(DRAFT_DIR, filename));
            return { filename, sizeBytes: stat.size, uploadedAt: stat.mtime.toISOString() };
        });
    }
    removePending(filename) {
        const target = path.join(DRAFT_DIR, path.basename(filename));
        if (fs.existsSync(target))
            fs.unlinkSync(target);
    }
    async runAll() {
        const zips = this.listPending();
        if (zips.length === 0)
            return [];
        const categoryMap = await this.fetchCategoryMap();
        const results = [];
        for (const zip of zips) {
            const zipPath = path.join(DRAFT_DIR, zip.filename);
            this.logger.log(`Processing ${zip.filename}...`);
            try {
                const posts = await this.processZip(zipPath, categoryMap);
                fs.renameSync(zipPath, path.join(PROCESSED_DIR, zip.filename));
                results.push({ zipName: zip.filename, status: 'success', posts });
                this.logger.log(`${zip.filename} -> ${posts.length} post(s) created as drafts`);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                this.logger.error(`${zip.filename} failed: ${message}`);
                fs.writeFileSync(path.join(FAILED_DIR, `${zip.filename}.error.log`), `${new Date().toISOString()}\n${message}\n`);
                fs.renameSync(zipPath, path.join(FAILED_DIR, zip.filename));
                results.push({ zipName: zip.filename, status: 'failed', error: message });
            }
        }
        return results;
    }
    async fetchCategoryMap() {
        const categories = await this.blogCategoriesService.findAll();
        const map = new Map();
        for (const category of categories) {
            map.set(category.name.trim().toLowerCase(), category._id.toString());
        }
        return map;
    }
    async processZip(zipPath, categoryMap) {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'woodivo-blog-'));
        try {
            new adm_zip_1.default(zipPath).extractAllTo(tmpDir, true);
            const rootEntries = fs.readdirSync(tmpDir);
            const rootDir = path.join(tmpDir, rootEntries.find((e) => fs.statSync(path.join(tmpDir, e)).isDirectory()) || '.');
            const manifestPath = path.join(rootDir, 'manifest.json');
            if (!fs.existsSync(manifestPath)) {
                throw new Error(`manifest.json not found inside ${path.basename(zipPath)}`);
            }
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            const results = [];
            for (const postEntry of manifest.posts) {
                const blogDir = path.join(rootDir, postEntry.folder);
                this.logger.log(`  processing ${postEntry.folder}...`);
                results.push(await this.processBlogFolder(blogDir, categoryMap));
            }
            return results;
        }
        finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    }
    async processBlogFolder(blogDir, categoryMap) {
        const contentPath = path.join(blogDir, 'content.json');
        if (!fs.existsSync(contentPath)) {
            throw new Error(`content.json missing in ${path.basename(blogDir)}`);
        }
        const post = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
        const heroAsset = await this.uploadLocalImage(path.join(blogDir, post.featuredImage.file), post.featuredImage.alt);
        const refToUrl = {};
        const uploadedImages = [];
        for (const img of post.images || []) {
            const asset = await this.uploadLocalImage(path.join(blogDir, img.file), img.alt);
            refToUrl[img.markdownRef] = asset.url;
            uploadedImages.push({ ...asset, alt: img.alt || asset.alt });
        }
        const finalContent = this.spliceImageUrls(post.content, refToUrl);
        let categoryId;
        if (post.category) {
            categoryId = categoryMap.get(post.category.trim().toLowerCase());
            if (!categoryId) {
                this.logger.warn(`  category "${post.category}" not found — creating post uncategorized`);
            }
        }
        const blog = await this.blogsService.create({
            title: post.title,
            slug: post.slug || undefined,
            excerpt: post.excerpt,
            content: finalContent,
            category: categoryId,
            tags: post.tags || [],
            authorName: post.authorName || 'Woodivo Team',
            status: post.status || blog_schema_1.BlogStatus.DRAFT,
            isFeatured: Boolean(post.isFeatured),
            featuredImage: heroAsset,
            images: uploadedImages,
            faqs: post.faqs || [],
        });
        if (post.seo) {
            const seoEntry = await this.seoEntriesService.findByPath(`/blogs/${blog.slug}`);
            if (seoEntry && seoEntry.pageType === seo_entry_schema_1.SeoPageType.BLOG) {
                await this.seoEntriesService.update(seoEntry._id.toString(), {
                    metaTitle: post.seo.metaTitle,
                    metaDescription: post.seo.metaDescription,
                    metaKeywords: post.seo.metaKeywords || [],
                    ogImage: post.seo.ogImage || heroAsset.url,
                    canonicalUrl: post.seo.canonicalUrl,
                });
            }
            else {
                this.logger.warn(`  could not find auto-created SEO entry for /blogs/${blog.slug} — fix manually in CMS`);
            }
        }
        return { title: post.title, slug: blog.slug, id: blog._id.toString() };
    }
    async uploadLocalImage(absoluteFilePath, alt) {
        const buffer = fs.readFileSync(absoluteFilePath);
        const file = (0, multer_file_util_1.bufferToMulterFile)(buffer, path.basename(absoluteFilePath), (0, multer_file_util_1.mimeFromExtension)(absoluteFilePath));
        return this.mediaService.uploadImage(file, app_constants_1.MediaFolder.BLOGS, alt);
    }
    spliceImageUrls(content, refToUrl) {
        let result = content;
        for (const [ref, url] of Object.entries(refToUrl)) {
            const escaped = ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            result = result.replace(new RegExp(`\\]\\(${escaped}\\)`, 'g'), `](${url})`);
        }
        return result;
    }
};
exports.DraftBlogUploaderService = DraftBlogUploaderService;
exports.DraftBlogUploaderService = DraftBlogUploaderService = DraftBlogUploaderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [blogs_service_1.BlogsService,
        blog_categories_service_1.BlogCategoriesService,
        media_service_1.MediaService,
        seo_entries_service_1.SeoEntriesService])
], DraftBlogUploaderService);
//# sourceMappingURL=draft-blog-uploader.service.js.map