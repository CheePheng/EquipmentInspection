import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { now, today } from '../../lib/utils';

export function useInspectionTemplate(machineType: string | undefined) {
  return useLiveQuery(
    () => {
      if (!machineType) return undefined;
      return db.inspectionTemplates
        .where('machineType')
        .equals(machineType)
        .filter((t) => !!t.isActive)
        .first();
    },
    [machineType]
  );
}

export function useInspectionsByMachine(machineId: number) {
  return useLiveQuery(
    () =>
      db.inspections
        .where('machineId')
        .equals(machineId)
        .reverse()
        .sortBy('date'),
    [machineId]
  );
}

export async function createInspection(
  machineId: number,
  operatorId: number,
  siteId: number,
  meterReading: number,
  items: { templateItemId: string; result: 'pass' | 'fail' | 'na'; notes: string }[]
) {
  return db.transaction('rw', [db.inspections, db.inspectionItems, db.machines], async () => {
    const inspectionId = await db.inspections.add({
      machineId,
      operatorId,
      date: today(),
      meterReading,
      status: 'completed',
      completedAt: now(),
      siteId,
    });

    await db.inspectionItems.bulkAdd(
      items.map((item) => ({
        inspectionId: inspectionId as number,
        templateItemId: item.templateItemId,
        result: item.result,
        notes: item.notes,
      }))
    );

    // Update machine meter hours
    await db.machines.update(machineId, { currentMeterHours: meterReading });

    return inspectionId;
  });
}

export async function getExistingTodayInspection(machineId: number) {
  return db.inspections
    .where('[machineId+date]')
    .equals([machineId, today()])
    .first();
}
