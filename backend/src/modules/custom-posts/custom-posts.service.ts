import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import {
  CustomPost,
  CustomPostDocument,
  CustomPostStatus,
} from './schemas/custom-post.schema';
import {
  buildPaginationMeta,
  PaginatedResult,
} from '@common/interfaces/paginated-result.interface';
import { CreateCustomPostDto } from './dto/create-custom-post.dto';
import { UpdateCustomPostDto } from './dto/update-custom-post.dto';
import { QueryCustomPostDto } from './dto/query-custom-post.dto';

/**
 * CMS-only content type - no public-facing counterpart, so this service has
 * no findAllPublic()/findBySlug() the way Products/Blogs do.
 */
@Injectable()
export class CustomPostsService {
  constructor(
    @InjectModel(CustomPost.name)
    private readonly customPostModel: Model<CustomPostDocument>,
  ) {}

  async create(dto: CreateCustomPostDto): Promise<CustomPostDocument> {
    return new this.customPostModel(dto).save();
  }

  async findAllAdmin(
    query: QueryCustomPostDto,
  ): Promise<PaginatedResult<CustomPostDocument>> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: QueryFilter<CustomPostDocument> = {};
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [items, total] = await Promise.all([
      this.customPostModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.customPostModel.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  async findByIdAdmin(id: string): Promise<CustomPostDocument> {
    const post = await this.customPostModel.findById(id).exec();
    if (!post) throw new NotFoundException('Custom post not found');
    return post;
  }

  async update(id: string, dto: UpdateCustomPostDto): Promise<CustomPostDocument> {
    const post = await this.findByIdAdmin(id);
    Object.assign(post, dto);
    return post.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.customPostModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Custom post not found');
    }
  }

  /** Marks a post POSTED once it's been successfully submitted to social at least once. */
  async markPosted(id: string): Promise<void> {
    await this.customPostModel.updateOne(
      { _id: id },
      { $set: { status: CustomPostStatus.POSTED } },
    );
  }
}
