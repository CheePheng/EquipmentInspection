import { useMemo } from 'react';
import { useCollectionQuery } from '../../db/useFirestoreQuery';
import { inspectionTemplatesRef, inspectionsRef, query, where } from '../../db/collections';
import { addDocument, updateDocument, queryByField } from '../../db/firestore';
import { now, today } from '../../lib/utils';

export function useInspectionTemplate(machineType: string | undefined) {
  const q = useMemo(
    () =>
      machineType
        ? query(inspectionTemplatesRef(), where('machineType', '==', machineType), where('isActive', '==', true))
        : null,
    [machineType],
  );
  const results = useCollectionQuery<any>(q, [machineType]);
  return useMemo(() => (results ? results[0] : undefined), [results]);
}

export function useInspectionsByMachine(machineId: number) {
  const q = useMemo(
    () => query(inspectionsRef(), where('machineId', '==', machineId)),
    [machineId],
  );
  const results = useCollectionQuery<any>(q, [machineId]);
  return useMemo(
    () => results?.slice().sort((a: any, b: any) => (b.date ?? '').localeCompare(a.date ?? '')),
    [results],
  );
}

export async function createInspection(
  machineId: number,
  operatorId: number,
  siteId: number,
  meterReading: number,
  items: { templateItemId: string; result: 'pass' | 'fail' | 'na'; notes: string }[],
) {
  const inspectionId = await addDocument<any>('inspections', {
    machineId,
    operatorId,
    date: today(),
    meterReading,
    status: 'completed',
    completedAt: now(),
    siteId,
  });

  for (const item of items) {
    await addDocument<any>('inspectionItems', {
      inspectionId,
      templateItemId: item.templateItemId,
      result: item.result,
      notes: item.notes,
    });
  }

  await updateDocument('machines', machineId, { currentMeterHours: meterReading });

  return inspectionId;
}

export async function getExistingTodayInspection(machineId: number) {
  const results = await queryByField<any>('inspections', 'machineId', machineId);
  const todayStr = today();
  return results.find((r: any) => r.date === todayStr);
}
