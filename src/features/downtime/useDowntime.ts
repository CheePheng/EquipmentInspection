import { useMemo } from 'react';
import { useCollectionQuery } from '../../db/useFirestoreQuery';
import { downtimeEventsRef, query } from '../../db/collections';
import { addDocument, updateDocument } from '../../db/firestore';
import { now } from '../../lib/utils';
import type { DowntimeCode } from '../../lib/constants';

export function useDowntimeEvents(filters?: { machineId?: number; siteId?: number }) {
  const q = useMemo(() => query(downtimeEventsRef()), []);
  const results = useCollectionQuery<any>(q, []);
  return useMemo(() => {
    if (results === undefined) return undefined;
    let events = results;
    if (filters?.machineId) events = events.filter((e: any) => e.machineId === filters.machineId);
    if (filters?.siteId) events = events.filter((e: any) => e.siteId === filters.siteId);
    return events.slice().sort((a: any, b: any) => {
      if (!a.endTime && b.endTime) return -1;
      if (a.endTime && !b.endTime) return 1;
      return (b.startTime ?? '').localeCompare(a.startTime ?? '');
    });
  }, [results, filters?.machineId, filters?.siteId]);
}

export function useActiveDowntime(machineId?: number) {
  const q = useMemo(() => query(downtimeEventsRef()), []);
  const results = useCollectionQuery<any>(q, []);
  return useMemo(() => {
    if (results === undefined) return undefined;
    return results.filter((e: any) => !e.endTime && (!machineId || e.machineId === machineId));
  }, [results, machineId]);
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
  return addDocument<any>('downtimeEvents', {
    ...data,
    startTime: data.startTime || now(),
    endTime: null,
  });
}

export async function stopDowntime(eventId: number) {
  await updateDocument('downtimeEvents', eventId, { endTime: now() });
}
