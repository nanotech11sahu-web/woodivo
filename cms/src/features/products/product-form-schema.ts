import { z } from 'zod';

export const productFormSchema = z
  .object({
    category: z.string().min(1, 'Category is required'),
    subCategory: z.string().optional().or(z.literal('')),
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
    price: z.coerce.number({ invalid_type_error: 'Price is required' }).min(0, 'Price cannot be negative'),
    discountPrice: z.coerce.number().min(0).optional().or(z.literal('')),
    sku: z.string().trim().max(40).optional().or(z.literal('')),
    stockStatus: z.enum(['in_stock', 'out_of_stock', 'made_to_order']),
    displayOrder: z.coerce.number().int().min(0).optional(),
    status: z.enum(['active', 'inactive']),
    isFeatured: z.boolean(),
  })
  .refine(
    (values) => {
      if (values.discountPrice === '' || values.discountPrice === undefined) return true;
      return values.discountPrice < values.price;
    },
    { message: 'Discount price must be lower than price', path: ['discountPrice'] },
  );

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const PRODUCT_FORM_DEFAULTS: ProductFormValues = {
  category: '',
  subCategory: '',
  name: '',
  slug: '',
  description: '',
  specifications: [],
  price: 0,
  discountPrice: '',
  sku: '',
  stockStatus: 'made_to_order',
  displayOrder: 0,
  status: 'active',
  isFeatured: false,
};
