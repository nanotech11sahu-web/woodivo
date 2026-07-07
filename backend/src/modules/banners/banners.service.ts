import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import {
  Banner,
  BannerDocument,
  BannerPlacement,
  BannerStatus,
} from './schemas/banner.schema';
import {
  buildPaginationMeta,
  PaginatedResult,
} from '@common/interfaces/paginated-result.interface';
import { ReorderItemsDto } from '@common/dto/reorder-items.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { QueryBannerDto } from './dto/query-banner.dto';

@Injectable()
export class BannersService {
  constructor(
    @InjectModel(Banner.name)
    private readonly bannerModel: Model<BannerDocument>,
  ) {}

  async create(dto: CreateBannerDto): Promise<BannerDocument> {
    return new this.bannerModel(dto).save();
  }

  async findAllAdmin(
    query: QueryBannerDto,
  ): Promise<PaginatedResult<BannerDocument>> {
    const {
      page = 1,
      limit = 20,
      status,
      placement,
      sortBy = 'displayOrder',
      sortOrder = 'asc',
    } = query;

    const filter: QueryFilter<BannerDocument> = {};
    if (status) filter.status = status;
    if (placement) filter.placement = placement;

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [items, total] = await Promise.all([
      this.bannerModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.bannerModel.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  /** Public: always scoped to a single placement — the frontend never wants all placements at once. */
  async findAllPublicByPlacement(
    placement: BannerPlacement,
  ): Promise<BannerDocument[]> {
    return this.bannerModel
      .find({ placement, status: BannerStatus.ACTIVE })
      .sort({ displayOrder: 1 })
      .exec();
  }

  async findByIdAdmin(id: string): Promise<BannerDocument> {
    const banner = await this.bannerModel.findById(id).exec();
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async update(id: string, dto: UpdateBannerDto): Promise<BannerDocument> {
    const banner = await this.findByIdAdmin(id);
    Object.assign(banner, dto);
    return banner.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.bannerModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Banner not found');
    }
  }

  /**
   * Reorder is scoped per-placement by the caller (CMS sends only the ids
   * belonging to the placement being reordered) — this just applies the
   * given displayOrder values as-is, it doesn't need to know placement.
   */
  async reorder(dto: ReorderItemsDto): Promise<void> {
    const operations = dto.items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

    await this.bannerModel.bulkWrite(operations);
  }

  async setStatus(id: string, status: BannerStatus): Promise<BannerDocument> {
    const banner = await this.findByIdAdmin(id);
    banner.status = status;
    return banner.save();
  }
}
