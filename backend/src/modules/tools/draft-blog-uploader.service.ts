import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import AdmZip from 'adm-zip';
import { MediaFolder } from '@common/constants/app.constants';
import { BlogsService } from '@modules/blogs/blogs.service';
import { BlogCategoriesService } from '@modules/blogs/blog-categories.service';
import { MediaService } from '@modules/media/media.service';
import { SeoEntriesService } from '@modules/seo-entries/seo-entries.service';
import { SeoPageType } from '@modules/seo-entries/schemas/seo-entry.schema';
import { BlogStatus } from '@modules/blogs/schemas/blog.schema';
import { bufferToMulterFile, mimeFromExtension } from './utils/multer-file.util';

const DRAFT_DIR = path.resolve(process.env.DRAFT_BLOGS_DIR || path.join(process.cwd(), '..', 'draft-blogs'));
const PROCESSED_DIR = path.resolve(process.env.PROCESSED_DIR || path.join(DRAFT_DIR, 'processed'));
const FAILED_DIR = path.resolve(process.env.FAILED_DIR || path.join(DRAFT_DIR, 'failed'));

interface BlogFactoryPost {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  category?: string;
  tags?: string[];
  authorName?: string;
  status?: BlogStatus;
  isFeatured?: boolean;
  featuredImage: { file: string; alt?: string };
  images?: { file: string; alt?: string; markdownRef: string }[];
  faqs?: { question: string; answer: string }[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
    canonicalUrl?: string;
  };
}

interface BlogFactoryManifest {
  posts: { folder: string }[];
}

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

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

@Injectable()
export class DraftBlogUploaderService {
  private readonly logger = new Logger(DraftBlogUploaderService.name);

  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogCategoriesService: BlogCategoriesService,
    private readonly mediaService: MediaService,
    private readonly seoEntriesService: SeoEntriesService,
  ) {
    ensureDir(DRAFT_DIR);
    ensureDir(PROCESSED_DIR);
    ensureDir(FAILED_DIR);
  }

  /** Saves an uploaded zip into the pending draft-blogs queue. */
  saveIncomingZip(buffer: Buffer, originalname: string): PendingDraftZip {
    ensureDir(DRAFT_DIR);
    const safeName = path.basename(originalname).endsWith('.zip')
      ? path.basename(originalname)
      : `${path.basename(originalname)}.zip`;

    const destPath = path.join(DRAFT_DIR, safeName);
    fs.writeFileSync(destPath, buffer);
    const stat = fs.statSync(destPath);
    return { filename: safeName, sizeBytes: stat.size, uploadedAt: new Date().toISOString() };
  }

  /** Lists zips waiting in the draft-blogs queue (excludes processed/failed). */
  listPending(): PendingDraftZip[] {
    ensureDir(DRAFT_DIR);
    return fs
      .readdirSync(DRAFT_DIR)
      .filter((f) => f.toLowerCase().endsWith('.zip'))
      .map((filename) => {
        const stat = fs.statSync(path.join(DRAFT_DIR, filename));
        return { filename, sizeBytes: stat.size, uploadedAt: stat.mtime.toISOString() };
      });
  }

  removePending(filename: string): void {
    const target = path.join(DRAFT_DIR, path.basename(filename));
    if (fs.existsSync(target)) fs.unlinkSync(target);
  }

  /** Processes every pending zip: uploads images, creates each post as a draft blog, patches its SEO entry. */
  async runAll(): Promise<DraftZipResult[]> {
    const zips = this.listPending();
    if (zips.length === 0) return [];

    const categoryMap = await this.fetchCategoryMap();
    const results: DraftZipResult[] = [];

    for (const zip of zips) {
      const zipPath = path.join(DRAFT_DIR, zip.filename);
      this.logger.log(`Processing ${zip.filename}...`);
      try {
        const posts = await this.processZip(zipPath, categoryMap);
        fs.renameSync(zipPath, path.join(PROCESSED_DIR, zip.filename));
        results.push({ zipName: zip.filename, status: 'success', posts });
        this.logger.log(`${zip.filename} -> ${posts.length} post(s) created as drafts`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`${zip.filename} failed: ${message}`);
        fs.writeFileSync(
          path.join(FAILED_DIR, `${zip.filename}.error.log`),
          `${new Date().toISOString()}\n${message}\n`,
        );
        fs.renameSync(zipPath, path.join(FAILED_DIR, zip.filename));
        results.push({ zipName: zip.filename, status: 'failed', error: message });
      }
    }

    return results;
  }

  private async fetchCategoryMap(): Promise<Map<string, string>> {
    const categories = await this.blogCategoriesService.findAll();
    const map = new Map<string, string>();
    for (const category of categories) {
      map.set(category.name.trim().toLowerCase(), category._id.toString());
    }
    return map;
  }

  private async processZip(zipPath: string, categoryMap: Map<string, string>): Promise<DraftBlogPostResult[]> {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'woodivo-blog-'));
    try {
      new AdmZip(zipPath).extractAllTo(tmpDir, true);

      const rootEntries = fs.readdirSync(tmpDir);
      const rootDir = path.join(
        tmpDir,
        rootEntries.find((e) => fs.statSync(path.join(tmpDir, e)).isDirectory()) || '.',
      );

      const manifestPath = path.join(rootDir, 'manifest.json');
      if (!fs.existsSync(manifestPath)) {
        throw new Error(`manifest.json not found inside ${path.basename(zipPath)}`);
      }
      const manifest: BlogFactoryManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      const results: DraftBlogPostResult[] = [];
      for (const postEntry of manifest.posts) {
        const blogDir = path.join(rootDir, postEntry.folder);
        this.logger.log(`  processing ${postEntry.folder}...`);
        results.push(await this.processBlogFolder(blogDir, categoryMap));
      }
      return results;
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }

  private async processBlogFolder(
    blogDir: string,
    categoryMap: Map<string, string>,
  ): Promise<DraftBlogPostResult> {
    const contentPath = path.join(blogDir, 'content.json');
    if (!fs.existsSync(contentPath)) {
      throw new Error(`content.json missing in ${path.basename(blogDir)}`);
    }
    const post: BlogFactoryPost = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

    const heroAsset = await this.uploadLocalImage(
      path.join(blogDir, post.featuredImage.file),
      post.featuredImage.alt,
    );

    const refToUrl: Record<string, string> = {};
    const uploadedImages: (Awaited<ReturnType<MediaService['uploadImage']>> & { alt?: string })[] = [];
    for (const img of post.images || []) {
      const asset = await this.uploadLocalImage(path.join(blogDir, img.file), img.alt);
      refToUrl[img.markdownRef] = asset.url;
      uploadedImages.push({ ...asset, alt: img.alt || asset.alt });
    }

    const finalContent = this.spliceImageUrls(post.content, refToUrl);

    let categoryId: string | undefined;
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
      status: post.status || BlogStatus.DRAFT,
      isFeatured: Boolean(post.isFeatured),
      featuredImage: heroAsset,
      images: uploadedImages,
      faqs: post.faqs || [],
    });

    if (post.seo) {
      const seoEntry = await this.seoEntriesService.findByPath(`/blogs/${blog.slug}`);
      if (seoEntry && seoEntry.pageType === SeoPageType.BLOG) {
        await this.seoEntriesService.update(seoEntry._id.toString(), {
          metaTitle: post.seo.metaTitle,
          metaDescription: post.seo.metaDescription,
          metaKeywords: post.seo.metaKeywords || [],
          ogImage: post.seo.ogImage || heroAsset.url,
          canonicalUrl: post.seo.canonicalUrl,
        });
      } else {
        this.logger.warn(`  could not find auto-created SEO entry for /blogs/${blog.slug} — fix manually in CMS`);
      }
    }

    return { title: post.title, slug: blog.slug, id: blog._id.toString() };
  }

  private async uploadLocalImage(absoluteFilePath: string, alt?: string) {
    const buffer = fs.readFileSync(absoluteFilePath);
    const file = bufferToMulterFile(buffer, path.basename(absoluteFilePath), mimeFromExtension(absoluteFilePath));
    return this.mediaService.uploadImage(file, MediaFolder.BLOGS, alt);
  }

  private spliceImageUrls(content: string, refToUrl: Record<string, string>): string {
    let result = content;
    for (const [ref, url] of Object.entries(refToUrl)) {
      const escaped = ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(`\\]\\(${escaped}\\)`, 'g'), `](${url})`);
    }
    return result;
  }
}
