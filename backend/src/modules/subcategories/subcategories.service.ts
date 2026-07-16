import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import {
  SubCategory,
  SubCategoryDocument,
  SubCategoryStatus,
} from './schemas/subcategory.schema';
import {
  Category,
  CategoryDocument,
  CategoryStatus,
} from '@modules/categories/schemas/category.schema';
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
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';
import { QuerySubCategoryDto } from './dto/query-subcategory.dto';
import { ReorderSubCategoriesDto } from './dto/reorder-subcategories.dto';

const CATEGORY_POPULATE_FIELDS = 'name slug thumbnail status';

@Injectable()
export class SubCategoriesService {
  constructor(
    @InjectModel(SubCategory.name)
    private readonly subCategoryModel: Model<SubCategoryDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly seoEntriesService: SeoEntriesService,
  ) {}

  async create(dto: CreateSubCategoryDto): Promise<SubCategoryDocument> {
    await this.getCategoryOrThrow(dto.category);
    const slug = slugify(dto.slug || dto.name);
    await this.ensureSlugAvailable(slug);

    const subCategory = new this.subCategoryModel({ ...dto, slug });
    const saved = await subCategory.save();
    await this.syncSeoEntry(saved);
    return saved;
  }

  async findAllAdmin(
    query: QuerySubCategoryDto,
  ): Promise<PaginatedResult<SubCategoryDocument>> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      isFeatured,
      category,
      sortBy = 'displayOrder',
      sortOrder = 'asc',
    } = query;

    const filter: QueryFilter<SubCategoryDocument> = {};
    if (status) filter.status = status;
    if (typeof isFeatured === 'boolean') filter.isFeatured = isFeatured;
    if (category) filter.category = new Types.ObjectId(category);
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
      this.subCategoryModel
        .find(filter)
        .populate('category', CATEGORY_POPULATE_FIELDS)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.subCategoryModel.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  /** Public: all active subcategories, optionally scoped to one category slug. */
  async findAllPublic(categorySlug?: string): Promise<SubCategoryDocument[]> {
    const filter: QueryFilter<SubCategoryDocument> = {
      status: SubCategoryStatus.ACTIVE,
    };

    if (categorySlug) {
      const category = await this.categoryModel
        .findOne({ slug: slugify(categorySlug), status: CategoryStatus.ACTIVE })
        .exec();
      if (!category) return [];
      filter.category = category._id;
    }

    return this.subCategoryModel
      .find(filter)
      .populate('category', CATEGORY_POPULATE_FIELDS)
      .sort({ displayOrder: 1 })
      .exec();
  }

  async findByIdAdmin(id: string): Promise<SubCategoryDocument> {
    const subCategory = await this.subCategoryModel
      .findById(id)
      .populate('category', CATEGORY_POPULATE_FIELDS)
      .exec();
    if (!subCategory) throw new NotFoundException('Subcategory not found');
    return subCategory;
  }

  async findBySlugPublic(slug: string): Promise<SubCategoryDocument> {
    const subCategory = await this.subCategoryModel
      .findOne({ slug: slugify(slug), status: SubCategoryStatus.ACTIVE })
      .populate('category', CATEGORY_POPULATE_FIELDS)
      .exec();
    if (!subCategory) throw new NotFoundException('Subcategory not found');
    return subCategory;
  }

  async update(
    id: string,
    dto: UpdateSubCategoryDto,
  ): Promise<SubCategoryDocument> {
    const subCategory = await this.subCategoryModel.findById(id).exec();
    if (!subCategory) throw new NotFoundException('Subcategory not found');

    if (dto.category) {
      const category = await this.getCategoryOrThrow(dto.category);
      subCategory.category = category._id;
    }

    if (dto.slug || dto.name) {
      const nextSlug = slugify(dto.slug || dto.name || subCategory.slug);
      if (nextSlug !== subCategory.slug) {
        await this.ensureSlugAvailable(nextSlug, id);
        subCategory.slug = nextSlug;
      }
    }

    Object.assign(subCategory, {
      ...dto,
      category: subCategory.category,
      slug: subCategory.slug,
    });

    const saved = await subCategory.save();
    await this.syncSeoEntry(saved);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const subCategory = await this.subCategoryModel.findById(id).exec();
    if (!subCategory) throw new NotFoundException('Subcategory not found');

    const productCount = await this.productModel.countDocuments({
      subCategory: subCategory._id,
    });
    if (productCount > 0) {
      throw new ConflictException(
        `Cannot delete subcategory: ${productCount} product(s) still reference it. Reassign or remove them first.`,
      );
    }

    await this.subCategoryModel.deleteOne({ _id: subCategory._id });
    await this.seoEntriesService.removeForEntity(
      SeoPageType.SUBCATEGORY,
      subCategory._id,
    );
  }

  async reorder(dto: ReorderSubCategoriesDto): Promise<void> {
    const operations = dto.items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

    await this.subCategoryModel.bulkWrite(operations);
  }

  async setStatus(
    id: string,
    status: SubCategoryStatus,
  ): Promise<SubCategoryDocument> {
    const subCategory = await this.subCategoryModel.findById(id).exec();
    if (!subCategory) throw new NotFoundException('Subcategory not found');
    subCategory.status = status;
    return subCategory.save();
  }

  /** Used by CategoriesService to block deleting a category that still has subcategories. */
  async countByCategory(categoryId: Types.ObjectId): Promise<number> {
    return this.subCategoryModel.countDocuments({ category: categoryId });
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

  /** Keeps the centralized SEO entry's path/label in step with this subcategory's current slug/name. */
  private async syncSeoEntry(subCategory: SubCategoryDocument): Promise<void> {
    await this.seoEntriesService.syncForEntity({
      pageType: SeoPageType.SUBCATEGORY,
      entityId: subCategory._id,
      entityLabel: subCategory.name,
      path: `/subcategories/${subCategory.slug}`,
    });
  }

  private async ensureSlugAvailable(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const filter: QueryFilter<SubCategoryDocument> = { slug };
    if (excludeId) filter._id = { $ne: excludeId };

    const existing = await this.subCategoryModel.exists(filter);
    if (existing) {
      throw new ConflictException(
        `Subcategory slug "${slug}" is already in use`,
      );
    }
  }
}
