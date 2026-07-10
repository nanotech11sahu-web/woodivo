export type ProductStatus = 'draft' | 'active' | 'inactive' | 'out_of_stock';
export type BlogStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface EnquiryStatsSummary {
  total: number;
  byStatus: Record<string, number>;
}

export interface DashboardStats {
  categories: { total: number };
  products: { total: number; byStatus: Record<ProductStatus, number> };
  enquiries: EnquiryStatsSummary;
  blogs: { total: number; byStatus: Record<BlogStatus, number> };
  gallery: { total: number };
  testimonials: { total: number };
  faqs: { total: number };
}
