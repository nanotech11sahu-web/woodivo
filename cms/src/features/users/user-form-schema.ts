import { z } from 'zod';

export const userFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['super_admin', 'admin', 'editor']),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

export const USER_FORM_DEFAULTS: UserFormValues = {
  name: '',
  email: '',
  password: '',
  role: 'editor',
};
