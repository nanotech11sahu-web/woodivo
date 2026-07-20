import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import {
  Product,
  ProductDocument,
  ProductStatus,
} from './schemas/product.schema';
import {
  Category,
  CategoryDocument,
  CategoryStatus,
} from '@modules/categories/schemas/category.schema';
import {
  SubCategory,
  SubCategoryDocument,
  SubCategoryStatus,
} from '@modules/subcategories/schemas/subcategory.schema';
import { Blog, BlogDocument, BlogStatus } from '@modules/blogs/schemas/blog.schema';
import { slugify } from '@common/utils/slugify';
import {
  buildPaginationMeta,
  PaginatedResult,
} from '@common/interfaces/paginated-result.interface';
import { SeoEntriesService } from '@modules/seo-entries/seo-entries.service';
import { SeoPageType } from '@modules/seo-entries/schemas/seo-entry.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { QueryPublicProductDto, PublicProductSort } from './dto/query-public-product.dto';

const CATEGORY_POPULATE_FIELDS = 'name slug thumbnail status';
const SUBCATEGORY_POPULATE_FIELDS = 'name slug thumbnail status category';
const RELATED_FALLBACK_LIMIT = 8;
const RELATED_BLOGS_FALLBACK_LIMIT = 3;

/**
 * Shown on a product's detail page only when that product has no FAQs of
 * its own in the CMS — generic enough to apply to any piece of furniture,
 * so a product never ships with a bare FAQ section. As soon as an editor
 * adds even one FAQ row in the CMS, these are fully replaced (never
 * merged) by that product's own list.
 */
const DEFAULT_PRODUCT_FAQS = [
  {
    question: 'What wood is this piece made from?',
    answer:
      'Every piece is solid wood, hand-selected and finished to order — get in touch and we can confirm the exact species and finish options for this product.',
  },
  {
    question: 'Can I customize the size, wood, or finish?',
    answer:
      'Yes — most pieces can be made to your preferred dimensions, wood type, and finish. Use the Enquire or Get Quote button above and we\u2019ll work out the details with you.',
  },
  {
    question: 'How long does delivery take?',
    answer:
      'Since each piece is made to order, timelines vary by design and customization. Reach out via the enquiry form and we\u2019ll give you an estimate for this specific product.',
  },
  {
    question: 'Do you offer a warranty?',
    answer:
      'Our handcrafted furniture is built to last generations. Contact us for details on the warranty coverage for this product.',
  },
  {
    question: 'How do I care for solid wood furniture?',
    answer:
      'Keep it out of direct, prolonged sunlight and away from excess moisture, and dust with a soft, dry cloth. We\u2019re happy to share wood-specific care tips for this piece on request.',
  },
];

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(SubCategory.name)
    private readonly subCategoryModel: Model<SubCategoryDocument>,
    @InjectModel(Blog.name)
    private readonly blogModel: Model<BlogDocument>,
    private readonly seoEntriesService: SeoEntriesService,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductDocument> {
    const category = await this.getCategoryOrThrow(dto.category);
    if (dto.subCategories?.length) {
      await this.ensureSubCategoriesExist(dto.subCategories, category._id);
    }
    const slug = slugify(dto.slug || dto.name);
    await this.ensureSlugAvailable(slug);
    await this.ensureRelatedProductsExist(dto.relatedProducts);
    await this.ensureRelatedBlogsExist(dto.relatedBlogs);
    this.assertDiscountPriceValid(dto.price, dto.discountPrice);

    const product = new this.productModel({
      ...dto,
      category: category._id,
      slug,
    });
    const saved = await product.save();
    await this.syncSeoEntry(saved);
    return saved;
  }

  async findAllAdmin(
    query: QueryProductDto,
  ): Promise<PaginatedResult<ProductDocument>> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      isFeatured,
      category,
      subCategory,
      needsPriceReview,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: QueryFilter<ProductDocument> = {};
    if (status) filter.status = status;
    if (typeof isFeatured === 'boolean') filter.isFeatured = isFeatured;
    if (typeof needsPriceReview === 'boolean') {
      filter.needsPriceReview = needsPriceReview;
    }
    if (category) filter.category = new Types.ObjectId(category);
    if (subCategory) filter.subCategories = new Types.ObjectId(subCategory);
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('category', CATEGORY_POPULATE_FIELDS)
        .populate('subCategories', SUBCATEGORY_POPULATE_FIELDS)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  async findAllPublic(
    query: QueryPublicProductDto,
  ): Promise<PaginatedResult<ProductDocument>> {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      subCategory,
      featured,
      sort,
      minPrice,
      maxPrice,
    } = query;

    const filter: QueryFilter<ProductDocument> = {
      status: ProductStatus.ACTIVE,
    };
    if (typeof featured === 'boolean') filter.isFeatured = featured;
    if (search) filter.$text = { $search: search };

    if (typeof minPrice === 'number' || typeof maxPrice === 'number') {
      const priceFilter: Record<string, number> = {};
      if (typeof minPrice === 'number') priceFilter.$gte = minPrice;
      if (typeof maxPrice === 'number') priceFilter.$lte = maxPrice;
      filter.effectivePrice = priceFilter;
    }

    if (category) {
      const categoryDoc = await this.categoryModel
        .findOne({ slug: slugify(category), status: CategoryStatus.ACTIVE })
        .exec();
      if (!categoryDoc) {
        // Unknown category slug -> empty result set, not an error.
        return { items: [], meta: buildPaginationMeta(0, page, limit) };
      }
      filter.category = categoryDoc._id;
    }

    if (subCategory) {
      const slugs = subCategory
        .split(',')
        .map((s) => slugify(s.trim()))
        .filter(Boolean);
      const subCategoryDocs = await this.subCategoryModel
        .find({
          slug: { $in: slugs },
          status: SubCategoryStatus.ACTIVE,
        })
        .exec();
      if (subCategoryDocs.length === 0) {
        // No matching subcategory slug -> empty result set, not an error.
        return { items: [], meta: buildPaginationMeta(0, page, limit) };
      }
      filter.subCategories = { $in: subCategoryDocs.map((sc) => sc._id) };
    }

    const skip = (page - 1) * limit;
    const sortSpec = this.resolvePublicSort(sort);

    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('category', CATEGORY_POPULATE_FIELDS)
        .populate('subCategories', SUBCATEGORY_POPULATE_FIELDS)
        .sort(sortSpec)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  /** Maps the storefront-facing `sort` enum to an actual Mongo sort spec. Defaults to the same featured-first ordering the listing used before `sort` existed. */
  private resolvePublicSort(
    sort: PublicProductSort | undefined,
  ): Record<string, 1 | -1> {
    switch (sort) {
      case PublicProductSort.LATEST:
        return { createdAt: -1 };
      case PublicProductSort.POPULAR:
        return { viewCount: -1 };
      case PublicProductSort.MOST_PURCHASED:
        return { purchaseCount: -1 };
      case PublicProductSort.PRICE_ASC:
        return { effectivePrice: 1 };
      case PublicProductSort.PRICE_DESC:
        return { effectivePrice: -1 };
      case PublicProductSort.NAME_ASC:
        return { name: 1 };
      case PublicProductSort.NAME_DESC:
        return { name: -1 };
      case PublicProductSort.FEATURED:
      default:
        return { isFeatured: -1, displayOrder: 1 };
    }
  }

  async findByIdAdmin(id: string): Promise<ProductDocument> {
    const product = await this.productModel
      .findById(id)
      .populate('category', CATEGORY_POPULATE_FIELDS)
      .populate('subCategories', SUBCATEGORY_POPULATE_FIELDS)
      .populate('relatedProducts', 'name slug images price status')
      .populate('relatedBlogs', 'title slug featuredImage status')
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  /**
   * Public product detail. Three fields fall back to sensible defaults
   * whenever the CMS hasn't set them for this specific product, so a
   * freshly-created product never shows a bare "no related items"/"no
   * FAQs" page:
   *  - `relatedProducts` empty -> other active products in the same category
   *  - `relatedBlogs` empty    -> the most recently published blog posts
   *  - `faqs` empty            -> `DEFAULT_PRODUCT_FAQS` (generic, not saved)
   * The moment a CMS editor adds even one item to any of these, that
   * product's own picks are used instead — fallbacks never merge with
   * real editorial choices.
   */
  async findBySlugPublic(slug: string): Promise<Record<string, unknown>> {
    const product = await this.productModel
      .findOne({ slug: slugify(slug), status: ProductStatus.ACTIVE })
      .populate('category', CATEGORY_POPULATE_FIELDS)
      .populate('subCategories', SUBCATEGORY_POPULATE_FIELDS)
      .populate({
        path: 'relatedProducts',
        match: { status: ProductStatus.ACTIVE },
        select: 'name slug images price discountPrice',
      })
      .populate({
        path: 'relatedBlogs',
        match: { status: BlogStatus.PUBLISHED },
        select: 'title slug excerpt featuredImage publishAt createdAt',
      })
      .exec();
    if (!product) throw new NotFoundException('Product not found');

    // Fire-and-forget popularity signal — never blocks or fails the
    // response if it errors, this is a "nice to have" metric only.
    this.productModel
      .updateOne({ _id: product._id }, { $inc: { viewCount: 1 } })
      .exec()
      .catch(() => undefined);

    const result = product.toObject() as unknown as Record<string, unknown>;

    // populate() with `match` leaves a `null` in the array for any ref that
    // didn't match (e.g. a related product that went inactive) rather than
    // shortening it — filter those out before deciding whether the CMS
    // picks are actually "empty".
    const pickedRelatedProducts = (
      result.relatedProducts as Array<unknown> | undefined
    )?.filter(Boolean) ?? [];
    const pickedRelatedBlogs = (
      result.relatedBlogs as Array<unknown> | undefined
    )?.filter(Boolean) ?? [];

    if (pickedRelatedProducts.length > 0) {
      result.relatedProducts = pickedRelatedProducts;
    } else {
      const categoryId =
        typeof product.category === 'object' && product.category !== null
          ? (product.category as { _id: Types.ObjectId })._id
          : product.category;
      result.relatedProducts = await this.productModel
        .find({
          category: categoryId,
          status: ProductStatus.ACTIVE,
          _id: { $ne: product._id },
        })
        .select('name slug images price discountPrice')
        .sort({ displayOrder: 1 })
        .limit(RELATED_FALLBACK_LIMIT)
        .exec();
    }

    if (pickedRelatedBlogs.length > 0) {
      result.relatedBlogs = pickedRelatedBlogs;
    } else {
      result.relatedBlogs = await this.blogModel
        .find({ status: BlogStatus.PUBLISHED })
        .select('title slug excerpt featuredImage publishAt createdAt')
        .sort({ publishAt: -1, createdAt: -1 })
        .limit(RELATED_BLOGS_FALLBACK_LIMIT)
        .exec();
    }

    if (!Array.isArray(result.faqs) || result.faqs.length === 0) {
      result.faqs = DEFAULT_PRODUCT_FAQS;
    }

    return result;
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');

    if (dto.category) {
      const category = await this.getCategoryOrThrow(dto.category);
      product.category = category._id;
    }

    if (dto.subCategories) {
      // Empty array explicitly clears; a non-empty array is validated
      // against whatever category the product ends up in (just-updated
      // above, or its existing one).
      if (dto.subCategories.length) {
        await this.ensureSubCategoriesExist(dto.subCategories, product.category);
      }
      product.subCategories = dto.subCategories.map((id) => new Types.ObjectId(id));
    }

    if (dto.slug || dto.name) {
      const nextSlug = slugify(dto.slug || dto.name || product.slug);
      if (nextSlug !== product.slug) {
        await this.ensureSlugAvailable(nextSlug, id);
        product.slug = nextSlug;
      }
    }

    if (dto.relatedProducts) {
      await this.ensureRelatedProductsExist(dto.relatedProducts, id);
    }

    if (dto.relatedBlogs) {
      await this.ensureRelatedBlogsExist(dto.relatedBlogs);
    }

    const resolvedPrice = dto.price ?? product.price;
    const resolvedDiscountPrice =
      dto.discountPrice === null
        ? undefined
        : (dto.discountPrice ?? product.discountPrice);
    this.assertDiscountPriceValid(resolvedPrice, resolvedDiscountPrice);

    Object.assign(product, {
      ...dto,
      category: product.category,
      subCategories: product.subCategories,
      slug: product.slug,
      discountPrice: resolvedDiscountPrice,
    });

    // A product only carries `needsPriceReview` because the migration
    // script gave it a placeholder — the moment someone actually chooses
    // a price for it here, that placeholder concern is resolved.
    if (typeof dto.price === 'number') {
      product.needsPriceReview = false;
    }

    // Same reasoning as needsPriceReview above — the flag only exists
    // because the migration script couldn't confidently auto-assign one;
    // an explicit choice here resolves it.
    if (dto.subCategories?.length) {
      product.needsSubCategoryReview = false;
    }

    const saved = await product.save();
    await this.syncSeoEntry(saved);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');

    // Detach this product from any other product's relatedProducts list.
    await this.productModel.updateMany(
      { relatedProducts: product._id },
      { $pull: { relatedProducts: product._id } },
    );

    await this.productModel.deleteOne({ _id: product._id });
    await this.seoEntriesService.removeForEntity(
      SeoPageType.PRODUCT,
      product._id,
    );
  }

  async setStatus(id: string, status: ProductStatus): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    product.status = status;
    return product.save();
  }

  private assertDiscountPriceValid(
    price: number | undefined,
    discountPrice: number | undefined,
  ): void {
    if (typeof discountPrice !== 'number') return;
    if (typeof price !== 'number' || discountPrice >= price) {
      throw new BadRequestException(
        'discountPrice must be lower than price',
      );
    }
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

  private async ensureSubCategoriesExist(
    subCategoryIds: string[],
    categoryId: Types.ObjectId,
  ): Promise<void> {
    const subCategories = await this.subCategoryModel
      .find({ _id: { $in: subCategoryIds } })
      .exec();
    if (subCategories.length !== new Set(subCategoryIds).size) {
      throw new BadRequestException('One or more subcategories do not exist');
    }
    const belongsToOtherCategory = subCategories.some(
      (sc) => !sc.category.equals(categoryId),
    );
    if (belongsToOtherCategory) {
      throw new BadRequestException(
        'One or more subcategories do not belong to the selected category',
      );
    }
  }

  private async ensureRelatedProductsExist(
    ids: string[] | undefined,
    excludeId?: string,
  ): Promise<void> {
    if (!ids?.length) return;

    if (excludeId && ids.includes(excludeId)) {
      throw new BadRequestException('A product cannot relate to itself');
    }

    const count = await this.productModel.countDocuments({
      _id: { $in: ids },
    });
    if (count !== new Set(ids).size) {
      throw new BadRequestException(
        'One or more relatedProducts ids do not exist',
      );
    }
  }

  private async ensureRelatedBlogsExist(
    ids: string[] | undefined,
  ): Promise<void> {
    if (!ids?.length) return;

    const count = await this.blogModel.countDocuments({ _id: { $in: ids } });
    if (count !== new Set(ids).size) {
      throw new BadRequestException(
        'One or more relatedBlogs ids do not exist',
      );
    }
  }

  /** Keeps the centralized SEO entry's path/label in step with this product's current slug/name — never touches meta fields an editor has already entered in the SEO CMS section. */
  private async syncSeoEntry(product: ProductDocument): Promise<void> {
    await this.seoEntriesService.syncForEntity({
      pageType: SeoPageType.PRODUCT,
      entityId: product._id,
      entityLabel: product.name,
      path: `/products/${product.slug}`,
    });
  }

  private async ensureSlugAvailable(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const filter: QueryFilter<ProductDocument> = { slug };
    if (excludeId) filter._id = { $ne: excludeId };

    const existing = await this.productModel.exists(filter);
    if (existing) {
      throw new ConflictException(`Product slug "${slug}" is already in use`);
    }
  }
}
