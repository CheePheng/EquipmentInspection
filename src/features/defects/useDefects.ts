import { useMemo } from 'react';
import { useCollectionQuery, useDocQuery } from '../../db/useFirestoreQuery';
import { defectsRef, defectPhotosRef, defectDoc, query, where } from '../../db/collections';
import { addDocument, updateDocument } from '../../db/firestore';
import { now } from '../../lib/utils';

export function useDefects(filters?: {
  severity?: string[];
  status?: string[];
  siteId?: number;
  machineId?: number;
}) {
  const q = useMemo(() => query(defectsRef()), []);
  const defects = useCollectionQuery<any>(q, []);

  return useMemo(() => {
    if (!defects) return undefined;

    let result = [...defects];
    if (filters?.severity?.length) {
      result = result.filter(d => filters.severity!.includes(d.severity));
    }
    if (filters?.status?.length) {
      result = result.filter(d => filters.status!.includes(d.status));
    }
    if (filters?.siteId) {
      result = result.filter(d => d.siteId === filters.siteId);
    }
    if (filters?.machineId) {
      result = result.filter(d => d.machineId === filters.machineId);
    }
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [defects, filters?.severity?.join(), filters?.status?.join(), filters?.siteId, filters?.machineId]);
}

export function useDefect(id: number) {
  return useDocQuery<any>(defectDoc(id), [id]);
}

export function useDefectPhotos(defectId: number) {
  const q = useMemo(() => query(defectPhotosRef(), where('defectId', '==', defectId)), [defectId]);
  return useCollectionQuery<any>(q, [defectId]);
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
  const defectId = await addDocument('defects', {
    ...data,
    status: 'open',
    priority: data.severity === 'critical' || data.severity === 'high',
    createdAt: now(),
    updatedAt: now(),
  });

  // Add photos
  for (const blob of photos) {
    await addDocument('defectPhotos', {
      defectId,
      data: blob,
      mimeType: 'image/jpeg',
      capturedAt: now(),
      fileSize: blob.size,
    });
  }

  return defectId;
}

export async function updateDefectStatus(id: number, status: string) {
  await updateDocument('defects', id, { status, updatedAt: now() });
}
