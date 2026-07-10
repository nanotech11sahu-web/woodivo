import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import {
  Enquiry,
  EnquiryDocument,
  EnquiryStatus,
} from './schemas/enquiry.schema';
import {
  Category,
  CategoryDocument,
  CategoryStatus,
} from '@modules/categories/schemas/category.schema';
import {
  Product,
  ProductDocument,
  ProductStatus,
} from '@modules/products/schemas/product.schema';
import { MailService } from '@modules/mail/mail.service';
import { slugify } from '@common/utils/slugify';
import {
  buildPaginationMeta,
  PaginatedResult,
} from '@common/interfaces/paginated-result.interface';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { QueryEnquiryDto } from './dto/query-enquiry.dto';

export interface EnquiryStatsSummary {
  total: number;
  byStatus: Record<EnquiryStatus, number>;
}

@Injectable()
export class EnquiriesService {
  constructor(
    @InjectModel(Enquiry.name)
    private readonly enquiryModel: Model<EnquiryDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateEnquiryDto): Promise<EnquiryDocument> {
    let categoryDoc: CategoryDocument | null = null;
    let productDoc: ProductDocument | null = null;

    if (dto.interestedCategory) {
      categoryDoc = await this.categoryModel
        .findOne({
          slug: slugify(dto.interestedCategory),
          status: CategoryStatus.ACTIVE,
        })
        .exec();
      // Unknown/inactive category slug is not fatal — we still want to
      // capture the lead, just without the category link.
    }

    if (dto.interestedProduct) {
      productDoc = await this.productModel
        .findOne({
          slug: slugify(dto.interestedProduct),
          status: ProductStatus.ACTIVE,
        })
        .exec();
      // Same non-fatal treatment as category above.
    }

    const enquiry = await new this.enquiryModel({
      fullName: dto.fullName,
      mobileNumber: dto.mobileNumber,
      state: dto.state,
      city: dto.city,
      message: dto.message,
      source: dto.source,
      interestedCategory: categoryDoc?._id,
      interestedProduct: productDoc?._id,
      referenceImages: dto.referenceImages,
    }).save();

    // Fire-and-forget: never let a slow/broken mailbox fail the enquiry.
    void this.mailService.sendEnquiryNotification({
      fullName: enquiry.fullName,
      mobileNumber: enquiry.mobileNumber,
      state: enquiry.state,
      city: enquiry.city,
      categoryName: categoryDoc?.name,
      productName: productDoc?.name,
      referenceImageCount: enquiry.referenceImages?.length ?? 0,
      message: enquiry.message,
      source: enquiry.source,
      submittedAt: enquiry.createdAt ?? new Date(),
    });

    return enquiry;
  }

  async findAllAdmin(
    query: QueryEnquiryDto,
  ): Promise<PaginatedResult<EnquiryDocument>> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      source,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: QueryFilter<EnquiryDocument> = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (category) filter.interestedCategory = category;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [items, total] = await Promise.all([
      this.enquiryModel
        .find(filter)
        .populate('interestedCategory', 'name slug')
        .populate('interestedProduct', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.enquiryModel.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  async findByIdAdmin(id: string): Promise<EnquiryDocument> {
    const enquiry = await this.enquiryModel
      .findById(id)
      .populate('interestedCategory', 'name slug')
      .populate('interestedProduct', 'name slug')
      .exec();
    if (!enquiry) throw new NotFoundException('Enquiry not found');
    return enquiry;
  }

  async update(id: string, dto: UpdateEnquiryDto): Promise<EnquiryDocument> {
    const enquiry = await this.enquiryModel.findById(id).exec();
    if (!enquiry) throw new NotFoundException('Enquiry not found');

    Object.assign(enquiry, dto);
    return enquiry.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.enquiryModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Enquiry not found');
    }
  }

  async getStats(): Promise<EnquiryStatsSummary> {
    const counts = await this.enquiryModel.aggregate<{
      _id: EnquiryStatus;
      count: number;
    }>([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

    const byStatus = Object.values(EnquiryStatus).reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<EnquiryStatus, number>,
    );

    let total = 0;
    for (const { _id, count } of counts) {
      byStatus[_id] = count;
      total += count;
    }

    return { total, byStatus };
  }
}
