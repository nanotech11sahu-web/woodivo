import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import {
  GalleryItem,
  GalleryItemDocument,
  GalleryItemStatus,
} from './schemas/gallery-item.schema';
import {
  buildPaginationMeta,
  PaginatedResult,
} from '@common/interfaces/paginated-result.interface';
import { ReorderItemsDto } from '@common/dto/reorder-items.dto';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { CreateManyGalleryItemsDto } from './dto/create-many-gallery-items.dto';
import { QueryGalleryItemDto } from './dto/query-gallery-item.dto';
import { QueryPublicGalleryItemDto } from './dto/query-public-gallery-item.dto';

@Injectable()
export class GalleryService {
  constructor(
    @InjectModel(GalleryItem.name)
    private readonly galleryItemModel: Model<GalleryItemDocument>,
  ) {}

  async create(dto: CreateGalleryItemDto): Promise<GalleryItemDocument> {
    return new this.galleryItemModel(dto).save();
  }

  /** Bulk-add — pairs with Media's upload-multiple, which returns an array. */
  async createMany(
    dto: CreateManyGalleryItemsDto,
  ): Promise<GalleryItemDocument[]> {
    const docs = dto.items.map((item) => new this.galleryItemModel(item));
    await this.galleryItemModel.bulkSave(docs);
    return docs;
  }

  async findAllAdmin(
    query: QueryGalleryItemDto,
  ): Promise<PaginatedResult<GalleryItemDocument>> {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      tag,
      sortBy = 'displayOrder',
      sortOrder = 'asc',
    } = query;

    const filter: QueryFilter<GalleryItemDocument> = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (tag) filter.tags = tag;

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [items, total] = await Promise.all([
      this.galleryItemModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.galleryItemModel.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  async findAllPublic(
    query: QueryPublicGalleryItemDto,
  ): Promise<PaginatedResult<GalleryItemDocument>> {
    const { page = 1, limit = 40, type, tag } = query;

    const filter: QueryFilter<GalleryItemDocument> = {
      status: GalleryItemStatus.ACTIVE,
    };
    if (type) filter.type = type;
    if (tag) filter.tags = tag;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.galleryItemModel
        .find(filter)
        .sort({ displayOrder: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.galleryItemModel.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  async findByIdAdmin(id: string): Promise<GalleryItemDocument> {
    const item = await this.galleryItemModel.findById(id).exec();
    if (!item) throw new NotFoundException('Gallery item not found');
    return item;
  }

  async update(
    id: string,
    dto: UpdateGalleryItemDto,
  ): Promise<GalleryItemDocument> {
    const item = await this.findByIdAdmin(id);
    Object.assign(item, dto);
    return item.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.galleryItemModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Gallery item not found');
    }
  }

  async reorder(dto: ReorderItemsDto): Promise<void> {
    const operations = dto.items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

    await this.galleryItemModel.bulkWrite(operations);
  }

  async setStatus(
    id: string,
    status: GalleryItemStatus,
  ): Promise<GalleryItemDocument> {
    const item = await this.findByIdAdmin(id);
    item.status = status;
    return item.save();
  }
}
