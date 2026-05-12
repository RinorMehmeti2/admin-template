import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  role: z.enum(['admin', 'editor', 'viewer']),
  bio: z.string().max(280, 'Max 280 characters').optional(),
});
export type ProfileValues = z.infer<typeof profileSchema>;
