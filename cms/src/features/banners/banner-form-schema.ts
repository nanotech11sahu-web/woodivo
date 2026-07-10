import { z } from 'zod';

export const BANNER_PLACEMENTS = [
  'hero',
  'category',
  'product',
  'blog',
  'contact',
  'about',
] as const;

export const bannerFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(150),
  subtitle: z.string().max(300).optional().or(z.literal('')),
  ctaLabel: z.string().optional().or(z.literal('')),
  ctaLink: z.string().optional().or(z.literal('')),
  placement: z.enum(BANNER_PLACEMENTS),
  displayOrder: z.coerce.number().int().min(0).optional(),
  status: z.enum(['active', 'inactive']),
});

export type BannerFormValues = z.infer<typeof bannerFormSchema>;

export const BANNER_FORM_DEFAULTS: BannerFormValues = {
  title: '',
  subtitle: '',
  ctaLabel: '',
  ctaLink: '',
  placement: 'hero',
  displayOrder: 0,
  status: 'active',
};

export const PLACEMENT_LABELS: Record<(typeof BANNER_PLACEMENTS)[number], string> = {
  hero: 'Hero (homepage)',
  category: 'Category page',
  product: 'Product page',
  blog: 'Blog',
  contact: 'Contact page',
  about: 'About page',
};
