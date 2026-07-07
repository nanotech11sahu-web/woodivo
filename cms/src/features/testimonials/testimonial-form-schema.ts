import { z } from 'zod';

export const testimonialFormSchema = z.object({
  clientName: z.string().trim().min(1, 'Client name is required').max(120),
  clientLocation: z.string().max(100).optional().or(z.literal('')),
  projectType: z.string().max(80).optional().or(z.literal('')),
  testimonialText: z.string().trim().min(1, 'Testimonial text is required').max(1200),
  // Select-driven (1-5 or "no rating") rather than a coerced number input —
  // Number('') is 0, not undefined, so a free-text number field would quietly
  // save a 0 rating whenever the field was left blank.
  rating: z.enum(['', '1', '2', '3', '4', '5']),
  displayOrder: z.coerce.number().int().min(0).optional(),
  status: z.enum(['active', 'inactive']),
  isFeatured: z.boolean(),
});

export type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;

export const TESTIMONIAL_FORM_DEFAULTS: TestimonialFormValues = {
  clientName: '',
  clientLocation: '',
  projectType: '',
  testimonialText: '',
  rating: '',
  displayOrder: 0,
  status: 'active',
  isFeatured: false,
};
