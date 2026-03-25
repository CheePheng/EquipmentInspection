import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { now } from '../../lib/utils';

export function useDefects(filters?: {
  severity?: string[];
  status?: string[];
  siteId?: number;
  machineId?: number;
}) {
  return useLiveQuery(async () => {
    let defects = await db.defects.toArray();
    if (filters?.severity?.length) {
      defects = defects.filter(d => filters.severity!.includes(d.severity));
    }
    if (filters?.status?.length) {
      defects = defects.filter(d => filters.status!.includes(d.status));
    }
    if (filters?.siteId) {
      defects = defects.filter(d => d.siteId === filters.siteId);
    }
    if (filters?.machineId) {
      defects = defects.filter(d => d.machineId === filters.machineId);
    }
    return defects.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [filters?.severity?.join(), filters?.status?.join(), filters?.siteId, filters?.machineId]);
}

export function useDefect(id: number) {
  return useLiveQuery(() => db.defects.get(id), [id]);
}

export function useDefectPhotos(defectId: number) {
  return useLiveQuery(
    () => db.defectPhotos.where('defectId').equals(defectId).toArray(),
    [defectId]
  );
}

export async function createDefect(
  data: {
    machineId: number;
    siteId: number;
    inspectionId: number | null;
    category: string;
    severity: string;
    description: string;
    safeToOperate: boolean;
    reportedBy: number;
  },
  photos: Blob[]
) {
  return db.transaction('rw', [db.defects, db.defectPhotos, db.repairs], async () => {
    const defectId = await db.defects.add({
      ...data,
      status: 'open',
      priority: data.severity === 'critical' || data.severity === 'high',
      createdAt: now(),
      updatedAt: now(),
    } as any);

    // Add photos
    if (photos.length > 0) {
      await db.defectPhotos.bulkAdd(
        photos.map(blob => ({
          defectId: defectId as number,
          data: blob,
          mimeType: 'image/jpeg',
          capturedAt: now(),
          fileSize: blob.size,
        }))
      );
    }

    // Auto-create pending repair
    await db.repairs.add({
      defectId: defectId as number,
      machineId: data.machineId,
      siteId: data.siteId,
      mechanicId: null,
      status: 'pending',
      priority: data.severity as any,
      partsNeeded: '',
      actionsTaken: [],
      completedAt: null,
      createdAt: now(),
    });

    return defectId;
  });
}

export async function updateDefectStatus(id: number, status: string) {
  await db.defects.update(id, { status: status as any, updatedAt: now() });
}
