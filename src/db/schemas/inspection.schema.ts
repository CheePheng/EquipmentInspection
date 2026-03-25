import { z } from 'zod';
import { MACHINE_TYPES, INSPECTION_STATUSES } from '../../lib/constants';

export const inspectionTemplateItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  category: z.string().min(1),
  required: z.boolean().default(true),
  order: z.number(),
});

export const inspectionTemplateSchema = z.object({
  id: z.number().optional(),
  machineType: z.enum(MACHINE_TYPES),
  name: z.string().min(1),
  isActive: z.boolean().default(true),
  items: z.array(inspectionTemplateItemSchema),
});

export const inspectionSchema = z.object({
  id: z.number().optional(),
  machineId: z.number(),
  operatorId: z.number(),
  date: z.string(),
  meterReading: z.number(),
  status: z.enum(INSPECTION_STATUSES).default('in-progress'),
  completedAt: z.string().nullable().default(null),
  siteId: z.number(),
});

export const inspectionItemSchema = z.object({
  id: z.number().optional(),
  inspectionId: z.number(),
  templateItemId: z.string(),
  result: z.enum(['pass', 'fail', 'na']),
  notes: z.string().default(''),
});

export type InspectionTemplate = z.infer<typeof inspectionTemplateSchema>;
export type InspectionTemplateItem = z.infer<typeof inspectionTemplateItemSchema>;
export type Inspection = z.infer<typeof inspectionSchema>;
export type InspectionItem = z.infer<typeof inspectionItemSchema>;
