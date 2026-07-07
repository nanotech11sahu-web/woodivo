import { z } from 'zod';

export const enquiryUpdateFormSchema = z.object({
  status: z.enum(['new', 'seen', 'contacted', 'closed']),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export type EnquiryUpdateFormValues = z.infer<typeof enquiryUpdateFormSchema>;
