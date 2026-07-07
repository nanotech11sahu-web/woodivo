import { z } from 'zod';

export const faqFormSchema = z.object({
  question: z.string().trim().min(1, 'Question is required').max(300),
  answer: z.string().trim().min(1, 'Answer is required'),
  group: z.string().max(80).optional().or(z.literal('')),
  displayOrder: z.coerce.number().int().min(0).optional(),
  status: z.enum(['active', 'inactive']),
});

export type FaqFormValues = z.infer<typeof faqFormSchema>;

export const FAQ_FORM_DEFAULTS: FaqFormValues = {
  question: '',
  answer: '',
  group: '',
  displayOrder: 0,
  status: 'active',
};
