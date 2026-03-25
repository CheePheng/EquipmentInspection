import { z } from 'zod';

export const maintenanceScheduleSchema = z.object({
  id: z.number().optional(),
  machineId: z.number(),
  serviceType: z.string().min(1),
  intervalDays: z.number().nullable().default(null),
  intervalHours: z.number().nullable().default(null),
  lastCompletedDate: z.string().nullable().default(null),
  lastCompletedHours: z.number().nullable().default(null),
  dueDate: z.string().nullable().default(null),
  dueHours: z.number().nullable().default(null),
  isActive: z.boolean().default(true),
});

export const maintenanceEventSchema = z.object({
  id: z.number().optional(),
  scheduleId: z.number(),
  machineId: z.number(),
  completedBy: z.number(),
  completedAt: z.string(),
  meterReading: z.number(),
  notes: z.string().default(''),
  serviceType: z.string(),
});

export type MaintenanceSchedule = z.infer<typeof maintenanceScheduleSchema>;
export type MaintenanceEvent = z.infer<typeof maintenanceEventSchema>;
