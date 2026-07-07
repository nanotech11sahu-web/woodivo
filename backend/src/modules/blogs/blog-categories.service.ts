import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import {
  Blog,
  BlogCategory,
  BlogCategoryDocument,
  BlogDocument,
} from './schemas/blog.schema';
import { slugify } from '@common/utils/slugify';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import { ReorderItemsDto } from '@common/dto/reorder-items.dto';

@Injectable()
export class BlogCategoriesService {
  constructor(
    @InjectModel(BlogCategory.name)
    private readonly blogCategoryModel: Model<BlogCategoryDocument>,
    @InjectModel(Blog.name)
    private readonly blogModel: Model<BlogDocument>,
  ) {}

  async create(dto: CreateBlogCategoryDto): Promise<BlogCategoryDocument> {
    const slug = slugify(dto.slug || dto.name);
    await this.ensureSlugAvailable(slug);

    const category = new this.blogCategoryModel({ ...dto, slug });
    return category.save();
  }

  async findAll(): Promise<BlogCategoryDocument[]> {
    return this.blogCategoryModel.find().sort({ displayOrder: 1 }).exec();
  }

  async findByIdAdmin(id: string): Promise<BlogCategoryDocument> {
    const category = await this.blogCategoryModel.findById(id).exec();
    if (!category) throw new NotFoundException('Blog category not found');
    return category;
  }

  async update(
    id: string,
    dto: UpdateBlogCategoryDto,
  ): Promise<BlogCategoryDocument> {
    const category = await this.findByIdAdmin(id);

    if (dto.slug || dto.name) {
      const nextSlug = slugify(dto.slug || dto.name || category.slug);
      if (nextSlug !== category.slug) {
        await this.ensureSlugAvailable(nextSlug, id);
        category.slug = nextSlug;
      }
    }

    Object.assign(category, { ...dto, slug: category.slug });
    return category.save();
  }

  async remove(id: string): Promise<void> {
    const category = await this.findByIdAdmin(id);

    // Blog.category stores the BlogCategory _id as a string (see schema).
    const blogCount = await this.blogModel.countDocuments({
      category: category._id.toString(),
    });
    if (blogCount > 0) {
      throw new ConflictException(
        `Cannot delete blog category: ${blogCount} blog(s) still reference it. Reassign or remove them first.`,
      );
    }

    await this.blogCategoryModel.deleteOne({ _id: category._id });
  }

  async reorder(dto: ReorderItemsDto): Promise<void> {
    const operations = dto.items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

    await this.blogCategoryModel.bulkWrite(operations);
  }

  private async ensureSlugAvailable(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const filter: QueryFilter<BlogCategoryDocument> = { slug };
    if (excludeId) filter._id = { $ne: excludeId };

    const existing = await this.blogCategoryModel.exists(filter);
    if (existing) {
      throw new ConflictException(
        `Blog category slug "${slug}" is already in use`,
      );
    }
  }
}
