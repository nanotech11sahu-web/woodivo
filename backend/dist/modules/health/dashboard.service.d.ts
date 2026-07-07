import { Model } from 'mongoose';
import { CategoryDocument } from "../categories/schemas/category.schema";
import { ProductDocument, ProductStatus } from "../products/schemas/product.schema";
import { BlogDocument, BlogStatus } from "../blogs/schemas/blog.schema";
import { ProjectDocument } from "../projects/schemas/project.schema";
import { GalleryItemDocument } from "../gallery/schemas/gallery-item.schema";
import { TestimonialDocument } from "../testimonials/schemas/testimonial.schema";
import { FaqDocument } from "../faqs/schemas/faq.schema";
import { EnquiriesService, EnquiryStatsSummary } from "../enquiries/enquiries.service";
export interface DashboardStats {
    categories: {
        total: number;
    };
    products: {
        total: number;
        byStatus: Record<ProductStatus, number>;
    };
    enquiries: EnquiryStatsSummary;
    blogs: {
        total: number;
        byStatus: Record<BlogStatus, number>;
    };
    projects: {
        total: number;
    };
    gallery: {
        total: number;
    };
    testimonials: {
        total: number;
    };
    faqs: {
        total: number;
    };
}
export declare class DashboardService {
    private readonly categoryModel;
    private readonly productModel;
    private readonly blogModel;
    private readonly projectModel;
    private readonly galleryItemModel;
    private readonly testimonialModel;
    private readonly faqModel;
    private readonly enquiriesService;
    constructor(categoryModel: Model<CategoryDocument>, productModel: Model<ProductDocument>, blogModel: Model<BlogDocument>, projectModel: Model<ProjectDocument>, galleryItemModel: Model<GalleryItemDocument>, testimonialModel: Model<TestimonialDocument>, faqModel: Model<FaqDocument>, enquiriesService: EnquiriesService);
    getStats(): Promise<DashboardStats>;
    private toStatusSummary;
}
