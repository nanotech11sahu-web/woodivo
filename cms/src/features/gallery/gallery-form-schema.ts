import { z } from 'zod';

export const galleryItemFormSchema = z.object({
  caption: z.string().max(150).optional().or(z.literal('')),
  type: z.enum(['image', 'video']),
  // Comma-separated free text in the UI; split into string[] on submit
  // (backend stores `tags: string[]`, no dedicated tag-picker endpoint yet —
  // same reasoning as FAQ's free-text `group` field).
  tags: z.string().max(300).optional().or(z.literal('')),
  displayOrder: z.coerce.number().int().min(0).optional(),
  status: z.enum(['active', 'inactive']),
});

export type GalleryItemFormValues = z.infer<typeof galleryItemFormSchema>;

export const GALLERY_ITEM_FORM_DEFAULTS: GalleryItemFormValues = {
  caption: '',
  type: 'image',
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
