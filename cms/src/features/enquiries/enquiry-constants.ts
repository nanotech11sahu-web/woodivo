import type { EnquiryStatus, EnquirySource } from '@/types/enquiry';

// Ordered by the natural lifecycle of a lead, not alphabetically — used
// everywhere a status <Select> needs to render its options.
export const ENQUIRY_STATUSES: EnquiryStatus[] = ['new', 'seen', 'contacted', 'closed'];

export const ENQUIRY_SOURCES: EnquirySource[] = [
  'contact',
  'homepage',
  'product',
  'category',
  'project',
  'floating_cta',
];

export const SOURCE_LABELS: Record<EnquirySource, string> = {
  homepage: 'Homepage',
  product: 'Product page',
  category: 'Category page',
  project: 'Project page',
  contact: 'Contact page',
  floating_cta: 'Floating CTA',
};
