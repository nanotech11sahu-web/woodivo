import { z } from 'zod';

// Mirrors the backend's CreateEnquiryDto exactly (mobile regex included) so
// invalid submissions are caught client-side with the same rule the API
// will apply anyway, rather than a looser client rule that just bounces
// back as a 400 the form has to re-parse.
export const enquiryFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name').max(120),
  mobileNumber: z
    .string()
    .trim()
    .regex(/^[+]?[0-9]{10,15}$/, 'Enter a valid phone number (10–15 digits)'),
  state: z.string().trim().max(80).optional().or(z.literal('')),
  city: z.string().trim().max(80).optional().or(z.literal('')),
  interestedCategory: z.string().optional(),
  interestedProduct: z.string().optional(),
  message: z.string().trim().max(1000).optional().or(z.literal('')),
});

export type EnquiryFormValues = z.infer<typeof enquiryFormSchema>;
