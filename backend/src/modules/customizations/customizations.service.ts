import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import {
  Customization,
  CustomizationDocument,
  CustomizationStatus,
} from './schemas/customization.schema';
import {
  Category,
  CategoryDocument,
} from '@modules/categories/schemas/category.schema';
import { slugify } from '@common/utils/slugify';
import {
  buildPaginationMeta,
  PaginatedResult,
} from '@common/interfaces/paginated-result.interface';
import { ReorderItemsDto } from '@common/dto/reorder-items.dto';
import { CreateCustomizationDto } from './dto/create-customization.dto';
import { UpdateCustomizationDto } from './dto/update-customization.dto';
import { QueryCustomizationDto } from './dto/query-customization.dto';
import { QueryPublicCustomizationDto } from './dto/query-public-customization.dto';

const CATEGORY_POPULATE_FIELDS = 'name slug';

@Injectable()
export class CustomizationsService {
  constructor(
    @InjectModel(Customization.name)
    private readonly customizationModel: Model<CustomizationDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(dto: CreateCustomizationDto): Promise<CustomizationDocument> {
    if (dto.category) await this.getCategoryOrThrow(dto.category);
    return new this.customizationModel(dto).save();
  }

  async findAllAdmin(
    query: QueryCustomizationDto,
  ): Promise<PaginatedResult<CustomizationDocument>> {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      tag,
      sortBy = 'displayOrder',
      sortOrder = 'asc',
    } = query;

    const filter: QueryFilter<CustomizationDocument> = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (tag) filter.tags = tag;

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [items, total] = await Promise.all([
      this.customizationModel
        .find(filter)
        .populate('category', CATEGORY_POPULATE_FIELDS)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.customizationModel.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  /** Public: the showcase grid shown under the "Customize" request form. */
  async findAllPublic(
    query: QueryPublicCustomizationDto,
  ): Promise<PaginatedResult<CustomizationDocument>> {
    const { page = 1, limit = 20, category, tag } = query;

    const filter: QueryFilter<CustomizationDocument> = {
      status: CustomizationStatus.ACTIVE,
    };
    if (tag) filter.tags = tag;

    if (category) {
      const categoryDoc = await this.categoryModel
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
      this.customizationModel
        .find(filter)
        .populate('category', CATEGORY_POPULATE_FIELDS)
        .sort({ displayOrder: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.customizationModel.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  async findByIdAdmin(id: string): Promise<CustomizationDocument> {
    const item = await this.customizationModel
      .findById(id)
      .populate('category', CATEGORY_POPULATE_FIELDS)
      .exec();
    if (!item) throw new NotFoundException('Customization not found');
    return item;
  }

  async update(
    id: string,
    dto: UpdateCustomizationDto,
  ): Promise<CustomizationDocument> {
    const item = await this.customizationModel.findById(id).exec();
    if (!item) throw new NotFoundException('Customization not found');

    if (dto.category) await this.getCategoryOrThrow(dto.category);

    Object.assign(item, dto);
    return item.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.customizationModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Customization not found');
    }
  }

  async reorder(dto: ReorderItemsDto): Promise<void> {
    const operations = dto.items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

    await this.customizationModel.bulkWrite(operations);
  }

  async setStatus(
    id: string,
    status: CustomizationStatus,
  ): Promise<CustomizationDocument> {
    const item = await this.customizationModel.findById(id).exec();
    if (!item) throw new NotFoundException('Customization not found');
    item.status = status;
    return item.save();
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
}
