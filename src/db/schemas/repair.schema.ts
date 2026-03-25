import { z } from 'zod';
import { REPAIR_STATUSES, SEVERITY_LEVELS } from '../../lib/constants';

export const repairActionSchema = z.object({
  note: z.string().min(1),
  timestamp: z.string(),
  mechanicId: z.number(),
});

export const repairSchema = z.object({
  id: z.number().optional(),
  defectId: z.number(),
  machineId: z.number(),
  siteId: z.number(),
  mechanicId: z.number().nullable().default(null),
  status: z.enum(REPAIR_STATUSES).default('pending'),
  priority: z.enum(SEVERITY_LEVELS), // Maps from linked defect's severity — used for queue sorting
  partsNeeded: z.string().default(''),
  actionsTaken: z.array(repairActionSchema).default([]),
  completedAt: z.string().nullable().default(null),
  createdAt: z.string(),
});

export type RepairAction = z.infer<typeof repairActionSchema>;
export type Repair = z.infer<typeof repairSchema>;
