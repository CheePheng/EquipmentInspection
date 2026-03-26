import { z } from 'zod';

export const SERVICE_ORDER_STATUSES = ['pending', 'in-service', 'returned', 'completed', 'cancelled'] as const;
export type ServiceOrderStatus = typeof SERVICE_ORDER_STATUSES[number];

export const serviceOrderSchema = z.object({
  id: z.number().optional(),
  machineId: z.number(),
  defectId: z.number().nullable().default(null),
  siteId: z.number(),
  workshopName: z.string().min(1),
  dateSent: z.string(),
  expectedReturnDate: z.string().nullable().default(null),
  dateReturned: z.string().nullable().default(null),
  status: z.enum(SERVICE_ORDER_STATUSES).default('pending'),
  notes: z.string().default(''),
  repairSummary: z.string().default(''),
  cost: z.number().nullable().default(null),
  createdAt: z.string(),
  completedAt: z.string().nullable().default(null),
});

export type ServiceOrder = z.infer<typeof serviceOrderSchema>;
