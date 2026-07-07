import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import {
  Category,
  CategoryDocument,
  CategoryStatus,
} from './schemas/category.schema';
import {
  Product,
  ProductDocument,
} from '@modules/products/schemas/product.schema';
import { slugify } from '@common/utils/slugify';
import {
  buildPaginationMeta,
  PaginatedResult,
} from '@common/interfaces/paginated-result.interface';
import { SeoEntriesService } from '@modules/seo-entries/seo-entries.service';
import { SeoPageType } from '@modules/seo-entries/schemas/seo-entry.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly seoEntriesService: SeoEntriesService,
  ) {}

  async create(dto: CreateCategoryDto): Promise<CategoryDocument> {
    const slug = slugify(dto.slug || dto.name);
    await this.ensureSlugAvailable(slug);

    const category = new this.categoryModel({ ...dto, slug });
    const saved = await category.save();
    await this.syncSeoEntry(saved);
    return saved;
  }

  async findAllAdmin(
    query: QueryCategoryDto,
  ): Promise<PaginatedResult<CategoryDocument>> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      isFeatured,
      sortBy = 'displayOrder',
      sortOrder = 'asc',
    } = query;

    const filter: QueryFilter<CategoryDocument> = {};
    if (status) filter.status = status;
    if (typeof isFeatured === 'boolean') filter.isFeatured = isFeatured;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [items, total] = await Promise.all([
      this.categoryModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.categoryModel.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  /** Public: all active categories, ordered for nav/header/footer/homepage. */
  async findAllPublic(featuredOnly = false): Promise<CategoryDocument[]> {
    const filter: QueryFilter<CategoryDocument> = {
      status: CategoryStatus.ACTIVE,
    };
    if (featuredOnly) filter.isFeatured = true;

    return this.categoryModel.find(filter).sort({ displayOrder: 1 }).exec();
  }

  async findByIdAdmin(id: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findBySlugPublic(slug: string): Promise<CategoryDocument> {
    const category = await this.categoryModel
      .findOne({ slug: slugify(slug), status: CategoryStatus.ACTIVE })
      .exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryDocument> {
    const category = await this.findByIdAdmin(id);

    if (dto.slug || dto.name) {
      const nextSlug = slugify(dto.slug || dto.name || category.slug);
      if (nextSlug !== category.slug) {
        await this.ensureSlugAvailable(nextSlug, id);
        category.slug = nextSlug;
      }
    }

    Object.assign(category, {
      ...dto,
      slug: category.slug, // keep the resolved slug, ignore raw dto.slug casing
    });

    const saved = await category.save();
    await this.syncSeoEntry(saved);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const category = await this.findByIdAdmin(id);

    const productCount = await this.productModel.countDocuments({
      category: category._id,
    });
    if (productCount > 0) {
      throw new ConflictException(
        `Cannot delete category: ${productCount} product(s) still reference it. Reassign or remove them first.`,
      );
    }

    await this.categoryModel.deleteOne({ _id: category._id });
    await this.seoEntriesService.removeForEntity(
      SeoPageType.CATEGORY,
      category._id,
    );
  }

  async reorder(dto: ReorderCategoriesDto): Promise<void> {
    const operations = dto.items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

    await this.categoryModel.bulkWrite(operations);
  }

  async setStatus(
    id: string,
    status: CategoryStatus,
  ): Promise<CategoryDocument> {
    const category = await this.findByIdAdmin(id);
    category.status = status;
    return category.save();
  }

  /** Keeps the centralized SEO entry's path/label in step with this category's current slug/name — never touches meta fields an editor has already entered in the SEO CMS section. */
  private async syncSeoEntry(category: CategoryDocument): Promise<void> {
    await this.seoEntriesService.syncForEntity({
      pageType: SeoPageType.CATEGORY,
      entityId: category._id,
      entityLabel: category.name,
      path: `/categories/${category.slug}`,
    });
  }

  private async ensureSlugAvailable(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const filter: QueryFilter<CategoryDocument> = { slug };
    if (excludeId) filter._id = { $ne: excludeId };

    const existing = await this.categoryModel.exists(filter);
    if (existing) {
      throw new ConflictException(`Category slug "${slug}" is already in use`);
    }
  }
}
