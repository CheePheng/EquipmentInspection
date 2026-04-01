import { useMemo } from 'react';
import { useCollectionQuery, useDocQuery } from '../../db/useFirestoreQuery';
import {
  machinesRef, machineDoc, sitesRef, inspectionsRef, defectsRef, downtimeEventsRef,
  query, where,
} from '../../db/collections';

export function useMachines(siteId?: number | null) {
  const q = useMemo(
    () => siteId ? query(machinesRef(), where('siteId', '==', siteId)) : query(machinesRef()),
    [siteId],
  );
  return useCollectionQuery<any>(q, [siteId]);
}

export function useMachine(id: number) {
  return useDocQuery<any>(machineDoc(id), [id]);
}

export function useSites() {
  const q = useMemo(() => query(sitesRef(), where('isActive', '==', true)), []);
  return useCollectionQuery<any>(q, []);
}

export function useMachineTimeline(machineId: number) {
  const inspQ = useMemo(() => query(inspectionsRef(), where('machineId', '==', machineId)), [machineId]);
  const defQ = useMemo(() => query(defectsRef(), where('machineId', '==', machineId)), [machineId]);
  const dtQ = useMemo(() => query(downtimeEventsRef(), where('machineId', '==', machineId)), [machineId]);

  const inspections = useCollectionQuery<any>(inspQ, [machineId]);
  const defects = useCollectionQuery<any>(defQ, [machineId]);
  const downtime = useCollectionQuery<any>(dtQ, [machineId]);

  return useMemo(() => {
    if (!inspections || !defects || !downtime) return undefined;

    type TimelineItem = {
      type: 'inspection' | 'defect' | 'downtime';
      date: string;
      id: number;
      data: any;
    };

    const items: TimelineItem[] = [
      ...inspections.map((i: any) => ({
        type: 'inspection' as const,
        date: i.completedAt || i.date,
        id: i.id!,
        data: i,
      })),
      ...defects.map((d: any) => ({
        type: 'defect' as const,
        date: d.createdAt,
        id: d.id!,
        data: d,
      })),
      ...downtime.map((dt: any) => ({
        type: 'downtime' as const,
        date: dt.startTime,
        id: dt.id!,
        data: dt,
      })),
    ];

    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);
  }, [inspections, defects, downtime]);
}
