import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { now } from '../../lib/utils';

export function useRepairs(filters?: {
  status?: string[];
  siteId?: number;
  mechanicId?: number;
}) {
  return useLiveQuery(async () => {
    let repairs = await db.repairs.toArray();
    if (filters?.status?.length) {
      repairs = repairs.filter(r => filters.status!.includes(r.status));
    }
    if (filters?.siteId) {
      repairs = repairs.filter(r => r.siteId === filters.siteId);
    }
    if (filters?.mechanicId) {
      repairs = repairs.filter(r => r.mechanicId === filters.mechanicId);
    }
    // Sort by priority (critical > high > medium > low) then by date
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return repairs.sort((a, b) => {
      const pa = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
      const pb = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
      if (pa !== pb) return pa - pb;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [filters?.status?.join(), filters?.siteId, filters?.mechanicId]);
}

export function useRepair(id: number) {
  return useLiveQuery(() => db.repairs.get(id), [id]);
}

export async function claimRepair(repairId: number, mechanicId: number) {
  await db.repairs.update(repairId, {
    mechanicId,
    status: 'assigned',
  });
}

export async function updateRepairStatus(repairId: number, status: string, defectId?: number) {
  const updates: any = { status };
  if (status === 'completed') {
    updates.completedAt = now();
    // Also mark the linked defect as fixed
    if (defectId) {
      await db.defects.update(defectId, { status: 'fixed', updatedAt: now() });
    }
  }
  await db.repairs.update(repairId, updates);
}

export async function addRepairNote(repairId: number, note: string, mechanicId: number) {
  const repair = await db.repairs.get(repairId);
  if (!repair) return;
  const actionsTaken = [...(repair.actionsTaken || []), {
    note,
    timestamp: now(),
    mechanicId,
  }];
  await db.repairs.update(repairId, { actionsTaken });
}

export async function updatePartsNeeded(repairId: number, partsNeeded: string) {
  await db.repairs.update(repairId, { partsNeeded });
}
