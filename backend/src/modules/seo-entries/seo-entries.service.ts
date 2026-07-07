import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import {
  SeoEntry,
  SeoEntryDocument,
  SeoPageType,
} from './schemas/seo-entry.schema';
import { SeoMetaDto } from '@common/dto/seo-meta.dto';
import { CreateSeoEntryDto } from './dto/create-seo-entry.dto';
import { QuerySeoEntryDto } from './dto/query-seo-entry.dto';
import {
  buildPaginationMeta,
  PaginatedResult,
} from '@common/interfaces/paginated-result.interface';

// Fixed-path pages that always exist regardless of content — seeded once
// on boot so there's always a row to edit in the CMS even before anyone's
// touched it. Kept here (not in a seeder file) since SeoEntriesService is
// the only thing that owns the shape of a "static page" entry.
const STATIC_PAGES: {
  path: string;
  pageType: SeoPageType;
  entityLabel: string;
}[] = [
  { path: '/', pageType: SeoPageType.HOME, entityLabel: 'Home' },
  { path: '/about', pageType: SeoPageType.ABOUT, entityLabel: 'About' },
  { path: '/contact', pageType: SeoPageType.CONTACT, entityLabel: 'Contact' },
  { path: '/gallery', pageType: SeoPageType.GALLERY, entityLabel: 'Gallery' },
  {
    path: '/projects',
    pageType: SeoPageType.PROJECTS_LISTING,
    entityLabel: 'Projects',
  },
  { path: '/blogs', pageType: SeoPageType.BLOGS_LISTING, entityLabel: 'Blogs' },
];

@Injectable()
export class SeoEntriesService {
  constructor(
    @InjectModel(SeoEntry.name)
    private readonly seoEntryModel: Model<SeoEntryDocument>,
  ) {}

  async findAllAdmin(
    query: QuerySeoEntryDto,
  ): Promise<PaginatedResult<SeoEntryDocument>> {
    const { page = 1, limit = 20, search, pageType } = query;

    const filter: QueryFilter<SeoEntryDocument> = {};
    if (pageType) filter.pageType = pageType;
    if (search) {
      filter.$or = [
        { path: { $regex: search, $options: 'i' } },
        { entityLabel: { $regex: search, $options: 'i' } },
        { metaTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.seoEntryModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.seoEntryModel.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  async findByIdAdmin(id: string): Promise<SeoEntryDocument> {
    const entry = await this.seoEntryModel.findById(id).exec();
    if (!entry) throw new NotFoundException('SEO entry not found');
    return entry;
  }

  /**
   * Public lookup used by the frontend's `useSeoMeta` hook. Returns null
   * (not a 404) when nothing's been entered for a path yet — that's the
   * normal state for most pages until an editor opens the SEO section, not
   * an error, so the frontend just falls back to its own page-level
   * defaults.
   */
  async findByPath(path: string): Promise<SeoEntryDocument | null> {
    return this.seoEntryModel
      .findOne({ path: this.normalizePath(path) })
      .exec();
  }

  /** CMS edit: only the meta fields are ever mutable here — path, pageType and entityId are derived, never hand-edited. */
  async update(id: string, dto: SeoMetaDto): Promise<SeoEntryDocument> {
    const entry = await this.findByIdAdmin(id);
    Object.assign(entry, dto);
    return entry.save();
  }

  /** Admin-added entry for a path with no backing content entity (e.g. a bespoke landing page). */
  async createCustom(dto: CreateSeoEntryDto): Promise<SeoEntryDocument> {
    const path = this.normalizePath(dto.path);
    const existing = await this.seoEntryModel.exists({ path });
    if (existing) {
      throw new ConflictException(`An SEO entry for "${path}" already exists`);
    }

    const entry = new this.seoEntryModel({
      ...dto,
      path,
      pageType: SeoPageType.CUSTOM,
    });
    return entry.save();
  }

  async remove(id: string): Promise<void> {
    const entry = await this.findByIdAdmin(id);
    if (entry.pageType !== SeoPageType.CUSTOM) {
      throw new ConflictException(
        "Only custom SEO entries can be deleted directly — entries generated from a product, blog, category or project follow that content's own lifecycle and disappear when it does.",
      );
    }
    await this.seoEntryModel.deleteOne({ _id: entry._id });
  }

  /**
   * Called by Products/Blogs/Categories/Projects services after every
   * create AND update — a rename changes the URL, so this keeps the
   * entry's `path` and `entityLabel` in sync without ever touching a meta
   * field an editor has already typed into the central SEO screen.
   */
  async syncForEntity(params: {
    pageType: (typeof STATIC_PAGES)[number]['pageType'];
    entityId: Types.ObjectId | string;
    entityLabel: string;
    path: string;
  }): Promise<void> {
    const { pageType, entityId, entityLabel, path } = params;
    const normalized = this.normalizePath(path);

    const existing = await this.seoEntryModel
      .findOne({ entityId, pageType })
      .exec();

    if (existing) {
      if (
        existing.path !== normalized ||
        existing.entityLabel !== entityLabel
      ) {
        // A stale row could theoretically already sit on the new path if a
        // slug got reused after an old entity was deleted — clear it first
        // so this save doesn't trip the unique index on `path`.
        await this.seoEntryModel.deleteOne({
          path: normalized,
          _id: { $ne: existing._id },
        });
        existing.path = normalized;
        existing.entityLabel = entityLabel;
        await existing.save();
      }
      return;
    }

    await this.seoEntryModel.deleteOne({ path: normalized });
    await this.seoEntryModel.create({
      path: normalized,
      pageType,
      entityId,
      entityLabel,
    });
  }

  /** Called on entity delete so its SEO row doesn't linger as an orphan the CMS list can never resolve back to real content. */
  async removeForEntity(
    pageType: SeoPageType,
    entityId: Types.ObjectId | string,
  ): Promise<void> {
    await this.seoEntryModel.deleteOne({ pageType, entityId });
  }

  /** Idempotent — safe to call on every application boot (same pattern as SeederService.seedSuperAdmin). */
  async ensureStaticPages(): Promise<void> {
    await Promise.all(
      STATIC_PAGES.map(({ path, pageType, entityLabel }) =>
        this.seoEntryModel.updateOne(
          { path },
          { $setOnInsert: { path, pageType, entityLabel } },
          { upsert: true },
        ),
      ),
    );
  }

  private normalizePath(path: string): string {
    const trimmed = path.trim();
    if (trimmed === '' || trimmed === '/') return '/';
    const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return withLeadingSlash.replace(/\/+$/, '');
  }
}
