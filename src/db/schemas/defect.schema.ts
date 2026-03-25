import { z } from 'zod';
import { SEVERITY_LEVELS, DEFECT_STATUSES, DEFECT_CATEGORIES } from '../../lib/constants';

export const defectSchema = z.object({
  id: z.number().optional(),
  machineId: z.number(),
  siteId: z.number(),
  inspectionId: z.number().nullable().default(null),
  category: z.enum(DEFECT_CATEGORIES),
  severity: z.enum(SEVERITY_LEVELS),
  status: z.enum(DEFECT_STATUSES).default('open'),
  description: z.string().default(''),
  safeToOperate: z.boolean(),
  priority: z.boolean().default(false),
  reportedBy: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const defectPhotoSchema = z.object({
  id: z.number().optional(),
  defectId: z.number(),
  data: z.instanceof(Blob),
  mimeType: z.string().default('image/jpeg'),
  capturedAt: z.string(),
  fileSize: z.number(),
});

export type Defect = z.infer<typeof defectSchema>;
export type DefectPhoto = z.infer<typeof defectPhotoSchema>;
