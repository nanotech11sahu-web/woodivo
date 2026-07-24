import { z } from 'zod';

export const customPostFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  caption: z.string().min(1, 'Caption is required'),
  // Comma-separated free text in the UI; split into string[] on submit -
  // same pattern as Gallery's `tags` field.
  keywords: z.string().max(300).optional().or(z.literal('')),
  tone: z.string().max(150).optional().or(z.literal('')),
  cta: z.string().max(150).optional().or(z.literal('')),
  status: z.enum(['draft', 'posted']),
});

export type CustomPostFormValues = z.infer<typeof customPostFormSchema>;

export const CUSTOM_POST_FORM_DEFAULTS: CustomPostFormValues = {
  title: '',
  caption: '',
  keywords: '',
  tone: '',
  cta: '',
  status: 'draft',
};

export function parseKeywords(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    ),
  );
}
