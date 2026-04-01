import { useMemo } from 'react';
import { useCollectionQuery } from '../../db/useFirestoreQuery';
import { useDocQuery } from '../../db/useFirestoreQuery';
import {
  maintenanceSchedulesRef,
  maintenanceEventsRef,
  machinesRef,
  maintenanceScheduleDoc,
  query,
  where,
} from '../../db/collections';
import { addDocument, updateDocument, getById } from '../../db/firestore';
import { today, now } from '../../lib/utils';
import { MAINTENANCE_DUE_SOON_DAYS, MAINTENANCE_DUE_SOON_HOURS } from '../../lib/constants';
import { addDays } from 'date-fns';

export type MaintenanceStatus = 'overdue' | 'due-soon' | 'ok';

export function getMaintenanceStatus(
  schedule: { dueDate: string | null; dueHours: number | null },
  machineMeterHours: number,
): MaintenanceStatus {
  const todayStr = today();
  const dueSoonDate = addDays(new Date(), MAINTENANCE_DUE_SOON_DAYS).toISOString().split('T')[0];

  // Check overdue
  if (schedule.dueDate && schedule.dueDate <= todayStr) return 'overdue';
  if (schedule.dueHours && schedule.dueHours <= machineMeterHours) return 'overdue';

  // Check due soon
  if (schedule.dueDate && schedule.dueDate <= dueSoonDate) return 'due-soon';
  if (schedule.dueHours && schedule.dueHours - machineMeterHours <= MAINTENANCE_DUE_SOON_HOURS) return 'due-soon';

  return 'ok';
}

export function useMaintenanceSchedules() {
  const schedulesQuery = useMemo(
    () => query(maintenanceSchedulesRef(), where('isActive', '==', true)),
    [],
  );
  const machinesQuery = useMemo(() => query(machinesRef()), []);

  const schedules = useCollectionQuery<any>(schedulesQuery, []);
  const machines = useCollectionQuery<any>(machinesQuery, []);

  return useMemo(() => {
    if (schedules === undefined || machines === undefined) return undefined;

    const machineMap = new Map(machines.map((m: any) => [m.id, m]));

    return schedules
      .map((s: any) => {
        const machine = machineMap.get(s.machineId);
        const status = getMaintenanceStatus(s, machine?.currentMeterHours ?? 0);
        return { ...s, machine, maintenanceStatus: status };
      })
      .sort((a: any, b: any) => {
        const order: Record<string, number> = { overdue: 0, 'due-soon': 1, ok: 2 };
        return order[a.maintenanceStatus] - order[b.maintenanceStatus];
      });
  }, [schedules, machines]);
}

export function useMaintenanceSchedule(id: number) {
  return useDocQuery<any>(maintenanceScheduleDoc(id), [id]);
}

export function useMaintenanceEvents(scheduleId: number) {
  const q = useMemo(
    () => query(maintenanceEventsRef(), where('scheduleId', '==', scheduleId)),
    [scheduleId],
  );
  const results = useCollectionQuery<any>(q, [scheduleId]);
  return useMemo(
    () => results?.slice().sort((a: any, b: any) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')),
    [results],
  );
}

export async function recordMaintenance(
  scheduleId: number,
  machineId: number,
  completedBy: number,
  meterReading: number,
  notes: string,
  serviceType: string,
) {
  // Add event
  await addDocument<any>('maintenanceEvents', {
    scheduleId,
    machineId,
    completedBy,
    completedAt: now(),
    meterReading,
    notes,
    serviceType,
  });

  // Update schedule's last completed and recalculate due
  const schedule = await getById<any>('maintenanceSchedules', scheduleId);
  if (schedule) {
    const todayStr = today();
    const newDueDate = schedule.intervalDays
      ? addDays(new Date(), schedule.intervalDays).toISOString().split('T')[0]
      : null;
    const newDueHours = schedule.intervalHours ? meterReading + schedule.intervalHours : null;

    await updateDocument('maintenanceSchedules', scheduleId, {
      lastCompletedDate: todayStr,
      lastCompletedHours: meterReading,
      dueDate: newDueDate,
      dueHours: newDueHours,
    });
  }

  // Update machine meter hours
  await updateDocument('machines', machineId, { currentMeterHours: meterReading });
}
