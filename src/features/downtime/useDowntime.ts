import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { now } from '../../lib/utils';
import type { DowntimeCode } from '../../lib/constants';

export function useDowntimeEvents(filters?: { machineId?: number; siteId?: number }) {
  return useLiveQuery(async () => {
    let events = await db.downtimeEvents.toArray();
    if (filters?.machineId) events = events.filter(e => e.machineId === filters.machineId);
    if (filters?.siteId) events = events.filter(e => e.siteId === filters.siteId);
    // Active first, then by startTime descending
    return events.sort((a, b) => {
      if (!a.endTime && b.endTime) return -1;
      if (a.endTime && !b.endTime) return 1;
      return b.startTime.localeCompare(a.startTime);
    });
  }, [filters?.machineId, filters?.siteId]);
}

export function useActiveDowntime(machineId?: number) {
  return useLiveQuery(async () => {
    const events = await db.downtimeEvents.toArray();
    return events.filter(e => !e.endTime && (!machineId || e.machineId === machineId));
  }, [machineId]);
}

export async function logDowntime(data: {
  machineId: number;
  siteId: number;
  defectId: number | null;
  reasonCode: DowntimeCode;
  notes: string;
  loggedBy: number;
  startTime?: string;
}) {
  return db.downtimeEvents.add({
    ...data,
    startTime: data.startTime || now(),
    endTime: null,
  });
}

export async function stopDowntime(eventId: number) {
  await db.downtimeEvents.update(eventId, { endTime: now() });
}
