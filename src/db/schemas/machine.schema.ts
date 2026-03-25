import { z } from 'zod';
import { MACHINE_TYPES, MACHINE_STATUSES, AVAILABILITY_STATES } from '../../lib/constants';

export const machineSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(MACHINE_TYPES),
  siteId: z.number(),
  status: z.enum(MACHINE_STATUSES).default('active'),
  availabilityState: z.enum(AVAILABILITY_STATES).default('available'),
  currentMeterHours: z.number().default(0),
  assignedOperatorId: z.number().nullable().default(null),
});

export type Machine = z.infer<typeof machineSchema>;
