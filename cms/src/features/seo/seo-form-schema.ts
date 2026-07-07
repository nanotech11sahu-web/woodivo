import { z } from 'zod';

export const seoFormSchema = z.object({
  path: z
    .string()
    .trim()
    .min(1, 'Path is required')
    .regex(/^\/[a-zA-Z0-9\-/]*$/, 'Must start with "/" and contain only letters, numbers, hyphens and slashes'),
  metaTitle: z.string().max(70).optional().or(z.literal('')),
  metaDescription: z.string().max(160).optional().or(z.literal('')),
  metaKeywords: z.string().optional(),
  ogImage: z.string().optional().or(z.literal('')),
  canonicalUrl: z.string().optional().or(z.literal('')),
});

export type SeoFormValues = z.infer<typeof seoFormSchema>;

export const SEO_FORM_DEFAULTS: SeoFormValues = {
  path: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  ogImage: '',
  canonicalUrl: '',
};
