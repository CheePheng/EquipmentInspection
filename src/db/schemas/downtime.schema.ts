import { z } from 'zod';
import { DOWNTIME_CODES } from '../../lib/constants';

export const downtimeEventSchema = z.object({
  id: z.number().optional(),
  machineId: z.number(),
  defectId: z.number().nullable().default(null),
  startTime: z.string(),
  endTime: z.string().nullable().default(null),
  reasonCode: z.enum(DOWNTIME_CODES),
  notes: z.string().default(''),
  siteId: z.number(),
  loggedBy: z.number(),
});

export type DowntimeEvent = z.infer<typeof downtimeEventSchema>;
