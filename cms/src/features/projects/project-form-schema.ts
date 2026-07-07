import { z } from 'zod';

export const projectFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(150),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only')
    .optional()
    .or(z.literal('')),
  description: z.string().optional(),
  clientName: z.string().max(100).optional().or(z.literal('')),
  location: z.string().max(100).optional().or(z.literal('')),
  completionYear: z.string().max(50).optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
  displayOrder: z.coerce.number().int().min(0).optional(),
  status: z.enum(['active', 'inactive']),
  isFeatured: z.boolean(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const PROJECT_FORM_DEFAULTS: ProjectFormValues = {
  title: '',
  slug: '',
  description: '',
  clientName: '',
  location: '',
  completionYear: '',
  category: '',
  displayOrder: 0,
  status: 'active',
  isFeatured: false,
};
