import { z } from 'zod';

export const siteSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  location: z.string().default(''),
  isActive: z.boolean().default(true),
});

export type Site = z.infer<typeof siteSchema>;
