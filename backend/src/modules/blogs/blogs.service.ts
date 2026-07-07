import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import {
  Blog,
  BlogCategory,
  BlogCategoryDocument,
  BlogDocument,
  BlogStatus,
} from './schemas/blog.schema';
import { slugify } from '@common/utils/slugify';
import {
  buildPaginationMeta,
  PaginatedResult,
} from '@common/interfaces/paginated-result.interface';
import { SeoEntriesService } from '@modules/seo-entries/seo-entries.service';
import { SeoPageType } from '@modules/seo-entries/schemas/seo-entry.schema';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogDto } from './dto/query-blog.dto';
import { QueryPublicBlogDto } from './dto/query-public-blog.dto';

const CATEGORY_POPULATE_FIELDS = 'name slug';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: Model<BlogDocument>,
    @InjectModel(BlogCategory.name)
    private readonly blogCategoryModel: Model<BlogCategoryDocument>,
    private readonly seoEntriesService: SeoEntriesService,
  ) {}

  async create(dto: CreateBlogDto): Promise<BlogDocument> {
    const categoryId = dto.category
      ? (await this.getCategoryOrThrow(dto.category))._id.toString()
      : undefined;

    const slug = slugify(dto.slug || dto.title);
    await this.ensureSlugAvailable(slug);

    const blog = new this.blogModel({
      ...dto,
      category: categoryId,
      slug,
    });
    const saved = await blog.save();
    await this.syncSeoEntry(saved);
    return saved;
  }

  async findAllAdmin(
    query: QueryBlogDto,
  ): Promise<PaginatedResult<BlogDocument>> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      category,
      isFeatured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: QueryFilter<BlogDocument> = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (typeof isFeatured === 'boolean') filter.isFeatured = isFeatured;
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [items, total] = await Promise.all([
      this.blogModel
        .find(filter)
        .populate('category', CATEGORY_POPULATE_FIELDS)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.blogModel.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  /**
   * Public: published posts, plus scheduled posts whose publishAt has
   * already passed — a scheduled post auto-qualifies as published on read
   * without needing a cron job to flip its status.
   */
  async findAllPublic(
    query: QueryPublicBlogDto,
  ): Promise<PaginatedResult<BlogDocument>> {
    const { page = 1, limit = 20, search, category, tag } = query;

    const filter: QueryFilter<BlogDocument> = this.publishedFilter();
    if (tag) filter.tags = tag;
    if (search) filter.$text = { $search: search };

    if (category) {
      const categoryDoc = await this.blogCategoryModel
        .findOne({ slug: slugify(category) })
        .exec();
      if (!categoryDoc) {
        // Unknown category slug -> empty result set, not an error.
        return { items: [], meta: buildPaginationMeta(0, page, limit) };
      }
      filter.category = categoryDoc._id.toString();
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.blogModel
        .find(filter)
        .populate('category', CATEGORY_POPULATE_FIELDS)
        .sort({ publishAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.blogModel.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  /** Public: homepage "latest blogs" widget. */
  async findLatestPublic(limit = 5): Promise<BlogDocument[]> {
    return this.blogModel
      .find(this.publishedFilter())
      .populate('category', CATEGORY_POPULATE_FIELDS)
      .sort({ publishAt: -1, createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findByIdAdmin(id: string): Promise<BlogDocument> {
    const blog = await this.blogModel
      .findById(id)
      .populate('category', CATEGORY_POPULATE_FIELDS)
      .exec();
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async findBySlugPublic(slug: string): Promise<BlogDocument> {
    const blog = await this.blogModel
      .findOne({ slug: slugify(slug), ...this.publishedFilter() })
      .populate('category', CATEGORY_POPULATE_FIELDS)
      .exec();
    if (!blog) throw new NotFoundException('Blog not found');

    // Fire-and-forget: a view-count write must never fail the page read.
    void this.blogModel
      .updateOne({ _id: blog._id }, { $inc: { viewCount: 1 } })
      .exec()
      .catch(() => undefined);

    return blog;
  }

  async update(id: string, dto: UpdateBlogDto): Promise<BlogDocument> {
    const blog = await this.blogModel.findById(id).exec();
    if (!blog) throw new NotFoundException('Blog not found');

    if (dto.category) {
      const category = await this.getCategoryOrThrow(dto.category);
      blog.category = category._id.toString();
    }

    if (dto.slug || dto.title) {
      const nextSlug = slugify(dto.slug || dto.title || blog.slug);
      if (nextSlug !== blog.slug) {
        await this.ensureSlugAvailable(nextSlug, id);
        blog.slug = nextSlug;
      }
    }

    Object.assign(blog, {
      ...dto,
      category: blog.category,
      slug: blog.slug,
    });

    const saved = await blog.save();
    await this.syncSeoEntry(saved);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const result = await this.blogModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Blog not found');
    }
    await this.seoEntriesService.removeForEntity(SeoPageType.BLOG, id);
  }

  /** Keeps the centralized SEO entry's path/label in step with this post's current slug/title — never touches meta fields an editor has already entered in the SEO CMS section. */
  private async syncSeoEntry(blog: BlogDocument): Promise<void> {
    await this.seoEntriesService.syncForEntity({
      pageType: SeoPageType.BLOG,
      entityId: blog._id,
      entityLabel: blog.title,
      path: `/blogs/${blog.slug}`,
    });
  }

  private publishedFilter(): QueryFilter<BlogDocument> {
    const now = new Date();
    return {
      $or: [
        { status: BlogStatus.PUBLISHED },
        { status: BlogStatus.SCHEDULED, publishAt: { $lte: now } },
      ],
    };
  }

  private async getCategoryOrThrow(
    categoryId: string,
  ): Promise<BlogCategoryDocument> {
    const category = await this.blogCategoryModel.findById(categoryId).exec();
    if (!category) {
      throw new BadRequestException(
        `Blog category "${categoryId}" does not exist`,
      );
    }
    return category;
  }

  private async ensureSlugAvailable(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const filter: QueryFilter<BlogDocument> = { slug };
    if (excludeId) filter._id = { $ne: excludeId };

    const existing = await this.blogModel.exists(filter);
    if (existing) {
      throw new ConflictException(`Blog slug "${slug}" is already in use`);
    }
  }
}
