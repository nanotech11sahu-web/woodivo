import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import {
  Project,
  ProjectDocument,
  ProjectStatus,
} from './schemas/project.schema';
import {
  Category,
  CategoryDocument,
  CategoryStatus,
} from '@modules/categories/schemas/category.schema';
import { slugify } from '@common/utils/slugify';
import {
  buildPaginationMeta,
  PaginatedResult,
} from '@common/interfaces/paginated-result.interface';
import { ReorderItemsDto } from '@common/dto/reorder-items.dto';
import { SeoEntriesService } from '@modules/seo-entries/seo-entries.service';
import { SeoPageType } from '@modules/seo-entries/schemas/seo-entry.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { QueryPublicProjectDto } from './dto/query-public-project.dto';

const CATEGORY_POPULATE_FIELDS = 'name slug thumbnail status';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    private readonly seoEntriesService: SeoEntriesService,
  ) {}

  async create(dto: CreateProjectDto): Promise<ProjectDocument> {
    const categoryId = dto.category
      ? (await this.getCategoryOrThrow(dto.category))._id
      : undefined;

    const slug = slugify(dto.slug || dto.title);
    await this.ensureSlugAvailable(slug);

    const project = new this.projectModel({
      ...dto,
      category: categoryId,
      slug,
    });
    const saved = await project.save();
    await this.syncSeoEntry(saved);
    return saved;
  }

  async findAllAdmin(
    query: QueryProjectDto,
  ): Promise<PaginatedResult<ProjectDocument>> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      category,
      isFeatured,
      sortBy = 'displayOrder',
      sortOrder = 'asc',
    } = query;

    const filter: QueryFilter<ProjectDocument> = {};
    if (status) filter.status = status;
    if (category) filter.category = new Types.ObjectId(category);
    if (typeof isFeatured === 'boolean') filter.isFeatured = isFeatured;
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [items, total] = await Promise.all([
      this.projectModel
        .find(filter)
        .populate('category', CATEGORY_POPULATE_FIELDS)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.projectModel.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  async findAllPublic(
    query: QueryPublicProjectDto,
  ): Promise<PaginatedResult<ProjectDocument>> {
    const { page = 1, limit = 20, search, category, featured } = query;

    const filter: QueryFilter<ProjectDocument> = {
      status: ProjectStatus.ACTIVE,
    };
    if (typeof featured === 'boolean') filter.isFeatured = featured;
    if (search) filter.$text = { $search: search };

    if (category) {
      const categoryDoc = await this.categoryModel
        .findOne({ slug: slugify(category), status: CategoryStatus.ACTIVE })
        .exec();
      if (!categoryDoc) {
        return { items: [], meta: buildPaginationMeta(0, page, limit) };
      }
      filter.category = categoryDoc._id;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.projectModel
        .find(filter)
        .populate('category', CATEGORY_POPULATE_FIELDS)
        .sort({ displayOrder: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.projectModel.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  async findByIdAdmin(id: string): Promise<ProjectDocument> {
    const project = await this.projectModel
      .findById(id)
      .populate('category', CATEGORY_POPULATE_FIELDS)
      .exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async findBySlugPublic(slug: string): Promise<ProjectDocument> {
    const project = await this.projectModel
      .findOne({ slug: slugify(slug), status: ProjectStatus.ACTIVE })
      .populate('category', CATEGORY_POPULATE_FIELDS)
      .exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<ProjectDocument> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) throw new NotFoundException('Project not found');

    if (dto.category) {
      const category = await this.getCategoryOrThrow(dto.category);
      project.category = category._id;
    }

    if (dto.slug || dto.title) {
      const nextSlug = slugify(dto.slug || dto.title || project.slug);
      if (nextSlug !== project.slug) {
        await this.ensureSlugAvailable(nextSlug, id);
        project.slug = nextSlug;
      }
    }

    Object.assign(project, {
      ...dto,
      category: project.category,
      slug: project.slug,
    });

    const saved = await project.save();
    await this.syncSeoEntry(saved);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Project not found');
    }
    await this.seoEntriesService.removeForEntity(SeoPageType.PROJECT, id);
  }

  /** Keeps the centralized SEO entry's path/label in step with this project's current slug/title — never touches meta fields an editor has already entered in the SEO CMS section. */
  private async syncSeoEntry(project: ProjectDocument): Promise<void> {
    await this.seoEntriesService.syncForEntity({
      pageType: SeoPageType.PROJECT,
      entityId: project._id,
      entityLabel: project.title,
      path: `/projects/${project.slug}`,
    });
  }

  async reorder(dto: ReorderItemsDto): Promise<void> {
    const operations = dto.items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

    await this.projectModel.bulkWrite(operations);
  }

  async setStatus(id: string, status: ProjectStatus): Promise<ProjectDocument> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) throw new NotFoundException('Project not found');
    project.status = status;
    return project.save();
  }

  private async getCategoryOrThrow(
    categoryId: string,
  ): Promise<CategoryDocument> {
    const category = await this.categoryModel.findById(categoryId).exec();
    if (!category) {
      throw new BadRequestException(`Category "${categoryId}" does not exist`);
    }
    return category;
  }

  private async ensureSlugAvailable(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const filter: QueryFilter<ProjectDocument> = { slug };
    if (excludeId) filter._id = { $ne: excludeId };

    const existing = await this.projectModel.exists(filter);
    if (existing) {
      throw new ConflictException(`Project slug "${slug}" is already in use`);
    }
  }
}
