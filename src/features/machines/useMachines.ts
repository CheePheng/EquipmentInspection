import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';

export function useMachines(siteId?: number | null) {
  return useLiveQuery(() => {
    if (siteId) return db.machines.where('siteId').equals(siteId).toArray();
    return db.machines.toArray();
  }, [siteId]);
}

export function useMachine(id: number) {
  return useLiveQuery(() => db.machines.get(id), [id]);
}

export function useSites() {
  return useLiveQuery(() => db.sites.filter((s) => s.isActive).toArray());
}

export function useMachineTimeline(machineId: number) {
  return useLiveQuery(async () => {
    const [inspections, defects, repairs, downtime] = await Promise.all([
      db.inspections.where('machineId').equals(machineId).toArray(),
      db.defects.where('machineId').equals(machineId).toArray(),
      db.repairs.where('machineId').equals(machineId).toArray(),
      db.downtimeEvents.where('machineId').equals(machineId).toArray(),
    ]);

    type TimelineItem = {
      type: 'inspection' | 'defect' | 'repair' | 'downtime';
      date: string;
      id: number;
      data: any;
    };

    const items: TimelineItem[] = [
      ...inspections.map((i) => ({
        type: 'inspection' as const,
        date: i.completedAt || i.date,
        id: i.id!,
        data: i,
      })),
      ...defects.map((d) => ({
        type: 'defect' as const,
        date: d.createdAt,
        id: d.id!,
        data: d,
      })),
      ...repairs.map((r) => ({
        type: 'repair' as const,
        date: r.createdAt,
        id: r.id!,
        data: r,
      })),
      ...downtime.map((dt) => ({
        type: 'downtime' as const,
        date: dt.startTime,
        id: dt.id!,
        data: dt,
      })),
    ];

    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);
  }, [machineId]);
}
