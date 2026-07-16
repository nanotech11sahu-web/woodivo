import { z } from 'zod';

export const customizationFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().max(1000).optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
  // Comma-separated free text in the UI; split into string[] on submit —
  // same pattern as gallery's `tags` field (no dedicated tag-picker
  // endpoint exists for either module).
  tags: z.string().max(300).optional().or(z.literal('')),
  displayOrder: z.coerce.number().int().min(0).optional(),
  status: z.enum(['active', 'inactive']),
});

export type CustomizationFormValues = z.infer<typeof customizationFormSchema>;

export const CUSTOMIZATION_FORM_DEFAULTS: CustomizationFormValues = {
  title: '',
  description: '',
  category: '',
  tags: '',
  displayOrder: 0,
  status: 'active',
};

export function parseTags(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
}
