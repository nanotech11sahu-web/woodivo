import { z } from 'zod';

// Same fullName/mobileNumber rules as enquiryFormSchema (mirrors the
// backend's CreateEnquiryDto), plus a required description of what the
// customer wants customized and up to 4 in-memory reference images.
export const customizeProductFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name').max(120),
  mobileNumber: z
    .string()
    .trim()
    .regex(/^[+]?[0-9]{10,15}$/, 'Enter a valid phone number (10–15 digits)'),
  description: z
    .string()
    .trim()
    .min(10, 'Tell us a bit about what you want customized')
    .max(1000),
});

export type CustomizeProductFormValues = z.infer<typeof customizeProductFormSchema>;

export const MAX_CUSTOM_ORDER_IMAGES = 4;
