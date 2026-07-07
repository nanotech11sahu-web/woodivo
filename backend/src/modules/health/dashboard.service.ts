import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Category,
  CategoryDocument,
} from '@modules/categories/schemas/category.schema';
import {
  Product,
  ProductDocument,
  ProductStatus,
} from '@modules/products/schemas/product.schema';
import {
  Blog,
  BlogDocument,
  BlogStatus,
} from '@modules/blogs/schemas/blog.schema';
import {
  Project,
  ProjectDocument,
} from '@modules/projects/schemas/project.schema';
import {
  GalleryItem,
  GalleryItemDocument,
} from '@modules/gallery/schemas/gallery-item.schema';
import {
  Testimonial,
  TestimonialDocument,
} from '@modules/testimonials/schemas/testimonial.schema';
import { Faq, FaqDocument } from '@modules/faqs/schemas/faq.schema';
import {
  EnquiriesService,
  EnquiryStatsSummary,
} from '@modules/enquiries/enquiries.service';

export interface DashboardStats {
  categories: { total: number };
  products: { total: number; byStatus: Record<ProductStatus, number> };
  enquiries: EnquiryStatsSummary;
  blogs: { total: number; byStatus: Record<BlogStatus, number> };
  projects: { total: number };
  gallery: { total: number };
  testimonials: { total: number };
  faqs: { total: number };
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Blog.name)
    private readonly blogModel: Model<BlogDocument>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(GalleryItem.name)
    private readonly galleryItemModel: Model<GalleryItemDocument>,
    @InjectModel(Testimonial.name)
    private readonly testimonialModel: Model<TestimonialDocument>,
    @InjectModel(Faq.name)
    private readonly faqModel: Model<FaqDocument>,
    private readonly enquiriesService: EnquiriesService,
  ) {}

  async getStats(): Promise<DashboardStats> {
    const [
      categoriesTotal,
      productStatusCounts,
      enquiries,
      blogStatusCounts,
      projectsTotal,
      galleryTotal,
      testimonialsTotal,
      faqsTotal,
    ] = await Promise.all([
      this.categoryModel.countDocuments(),
      this.productModel.aggregate<{ _id: ProductStatus; count: number }>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.enquiriesService.getStats(),
      this.blogModel.aggregate<{ _id: BlogStatus; count: number }>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.projectModel.countDocuments(),
      this.galleryItemModel.countDocuments(),
      this.testimonialModel.countDocuments(),
      this.faqModel.countDocuments(),
    ]);

    const products = this.toStatusSummary(ProductStatus, productStatusCounts);
    const blogs = this.toStatusSummary(BlogStatus, blogStatusCounts);

    return {
      categories: { total: categoriesTotal },
      products,
      enquiries,
      blogs,
      projects: { total: projectsTotal },
      gallery: { total: galleryTotal },
      testimonials: { total: testimonialsTotal },
      faqs: { total: faqsTotal },
    };
  }

  private toStatusSummary<TStatus extends string>(
    statusEnum: Record<string, TStatus>,
    counts: { _id: TStatus; count: number }[],
  ): { total: number; byStatus: Record<TStatus, number> } {
    const byStatus = Object.values(statusEnum).reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<TStatus, number>,
    );

    let total = 0;
    for (const { _id, count } of counts) {
      byStatus[_id] = count;
      total += count;
    }

    return { total, byStatus };
  }
}
