import { z } from 'zod';
import { USER_ROLES } from '../../lib/constants';

export const userSchema = z.object({
  id: z.number().optional(),
  pin: z.string().min(4).max(6),
  name: z.string().min(1),
  role: z.enum(USER_ROLES),
  siteId: z.number(),
});

export type User = z.infer<typeof userSchema>;
