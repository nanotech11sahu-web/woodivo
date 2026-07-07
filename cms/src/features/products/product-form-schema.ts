import { z } from 'zod';

export const productFormSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  name: z.string().trim().min(1, 'Name is required').max(150),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only')
    .optional()
    .or(z.literal('')),
  description: z.string().optional(),
  specifications: z.array(
    z.object({
      key: z.string().trim().min(1, 'Key is required').max(120),
      value: z.string().trim().min(1, 'Value is required').max(500),
    }),
  ),
  displayOrder: z.coerce.number().int().min(0).optional(),
  status: z.enum(['active', 'inactive']),
  isFeatured: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const PRODUCT_FORM_DEFAULTS: ProductFormValues = {
  category: '',
  name: '',
  slug: '',
  description: '',
  specifications: [],
  displayOrder: 0,
  status: 'active',
  isFeatured: false,
};
