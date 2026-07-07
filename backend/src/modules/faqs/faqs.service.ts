import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { Faq, FaqDocument, FaqStatus } from './schemas/faq.schema';
import {
  buildPaginationMeta,
  PaginatedResult,
} from '@common/interfaces/paginated-result.interface';
import { ReorderItemsDto } from '@common/dto/reorder-items.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { QueryFaqDto } from './dto/query-faq.dto';
import { QueryPublicFaqDto } from './dto/query-public-faq.dto';

@Injectable()
export class FaqsService {
  constructor(
    @InjectModel(Faq.name)
    private readonly faqModel: Model<FaqDocument>,
  ) {}

  async create(dto: CreateFaqDto): Promise<FaqDocument> {
    return new this.faqModel(dto).save();
  }

  async findAllAdmin(
    query: QueryFaqDto,
  ): Promise<PaginatedResult<FaqDocument>> {
    const {
      page = 1,
      limit = 20,
      status,
      group,
      sortBy = 'displayOrder',
      sortOrder = 'asc',
    } = query;

    const filter: QueryFilter<FaqDocument> = {};
    if (status) filter.status = status;
    if (group) filter.group = group;

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [items, total] = await Promise.all([
      this.faqModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.faqModel.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  async findAllPublic(
    query: QueryPublicFaqDto,
  ): Promise<PaginatedResult<FaqDocument>> {
    const { page = 1, limit = 100, group } = query;

    const filter: QueryFilter<FaqDocument> = { status: FaqStatus.ACTIVE };
    if (group) filter.group = group;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.faqModel
        .find(filter)
        .sort({ displayOrder: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.faqModel.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  async findByIdAdmin(id: string): Promise<FaqDocument> {
    const faq = await this.faqModel.findById(id).exec();
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }

  async update(id: string, dto: UpdateFaqDto): Promise<FaqDocument> {
    const faq = await this.findByIdAdmin(id);
    Object.assign(faq, dto);
    return faq.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.faqModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException('FAQ not found');
    }
  }

  async reorder(dto: ReorderItemsDto): Promise<void> {
    const operations = dto.items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

    await this.faqModel.bulkWrite(operations);
  }

  async setStatus(id: string, status: FaqStatus): Promise<FaqDocument> {
    const faq = await this.findByIdAdmin(id);
    faq.status = status;
    return faq.save();
  }
}
