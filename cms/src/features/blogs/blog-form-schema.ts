import { z } from 'zod';

export const blogFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only')
      .optional()
      .or(z.literal('')),
    excerpt: z.string().max(300).optional().or(z.literal('')),
    content: z.string().trim().min(1, 'Content is required'),
    authorName: z.string().max(100).optional().or(z.literal('')),
    category: z.string().optional().or(z.literal('')),
    status: z.enum(['draft', 'published', 'scheduled', 'archived']),
    publishAt: z.string().optional().or(z.literal('')),
    isFeatured: z.boolean(),
  })
  .refine((values) => values.status !== 'scheduled' || Boolean(values.publishAt), {
    message: 'Publish date is required when status is Scheduled',
    path: ['publishAt'],
  });

export type BlogFormValues = z.infer<typeof blogFormSchema>;

export const BLOG_FORM_DEFAULTS: BlogFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  authorName: '',
  category: '',
  status: 'draft',
  publishAt: '',
  isFeatured: false,
};
