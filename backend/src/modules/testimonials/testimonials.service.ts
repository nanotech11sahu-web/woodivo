import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import {
  Testimonial,
  TestimonialDocument,
  TestimonialStatus,
} from './schemas/testimonial.schema';
import {
  buildPaginationMeta,
  PaginatedResult,
} from '@common/interfaces/paginated-result.interface';
import { ReorderItemsDto } from '@common/dto/reorder-items.dto';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { QueryTestimonialDto } from './dto/query-testimonial.dto';
import { QueryPublicTestimonialDto } from './dto/query-public-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectModel(Testimonial.name)
    private readonly testimonialModel: Model<TestimonialDocument>,
  ) {}

  async create(dto: CreateTestimonialDto): Promise<TestimonialDocument> {
    return new this.testimonialModel(dto).save();
  }

  async findAllAdmin(
    query: QueryTestimonialDto,
  ): Promise<PaginatedResult<TestimonialDocument>> {
    const {
      page = 1,
      limit = 20,
      status,
      isFeatured,
      sortBy = 'displayOrder',
      sortOrder = 'asc',
    } = query;

    const filter: QueryFilter<TestimonialDocument> = {};
    if (status) filter.status = status;
    if (typeof isFeatured === 'boolean') filter.isFeatured = isFeatured;

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [items, total] = await Promise.all([
      this.testimonialModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.testimonialModel.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  async findAllPublic(
    query: QueryPublicTestimonialDto,
  ): Promise<PaginatedResult<TestimonialDocument>> {
    const { page = 1, limit = 20, featuredOnly } = query;

    const filter: QueryFilter<TestimonialDocument> = {
      status: TestimonialStatus.ACTIVE,
    };
    if (featuredOnly) filter.isFeatured = true;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.testimonialModel
        .find(filter)
        .sort({ displayOrder: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.testimonialModel.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  async findByIdAdmin(id: string): Promise<TestimonialDocument> {
    const testimonial = await this.testimonialModel.findById(id).exec();
    if (!testimonial) throw new NotFoundException('Testimonial not found');
    return testimonial;
  }

  async update(
    id: string,
    dto: UpdateTestimonialDto,
  ): Promise<TestimonialDocument> {
    const testimonial = await this.findByIdAdmin(id);
    Object.assign(testimonial, dto);
    return testimonial.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.testimonialModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Testimonial not found');
    }
  }

  async reorder(dto: ReorderItemsDto): Promise<void> {
    const operations = dto.items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

    await this.testimonialModel.bulkWrite(operations);
  }

  async setStatus(
    id: string,
    status: TestimonialStatus,
  ): Promise<TestimonialDocument> {
    const testimonial = await this.findByIdAdmin(id);
    testimonial.status = status;
    return testimonial.save();
  }
}
