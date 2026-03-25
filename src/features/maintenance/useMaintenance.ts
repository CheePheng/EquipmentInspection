import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { today, now } from '../../lib/utils';
import { MAINTENANCE_DUE_SOON_DAYS, MAINTENANCE_DUE_SOON_HOURS } from '../../lib/constants';
import { addDays } from 'date-fns';

export type MaintenanceStatus = 'overdue' | 'due-soon' | 'ok';

export function getMaintenanceStatus(
  schedule: { dueDate: string | null; dueHours: number | null },
  machineMeterHours: number
): MaintenanceStatus {
  const todayStr = today();
  const dueSoonDate = addDays(new Date(), MAINTENANCE_DUE_SOON_DAYS).toISOString().split('T')[0];

  // Check overdue
  if (schedule.dueDate && schedule.dueDate <= todayStr) return 'overdue';
  if (schedule.dueHours && schedule.dueHours <= machineMeterHours) return 'overdue';

  // Check due soon
  if (schedule.dueDate && schedule.dueDate <= dueSoonDate) return 'due-soon';
  if (schedule.dueHours && (schedule.dueHours - machineMeterHours) <= MAINTENANCE_DUE_SOON_HOURS) return 'due-soon';

  return 'ok';
}

export function useMaintenanceSchedules() {
  return useLiveQuery(async () => {
    const [schedules, machines] = await Promise.all([
      db.maintenanceSchedules.filter(s => !!s.isActive).toArray(),
      db.machines.toArray(),
    ]);

    const machineMap = new Map(machines.map(m => [m.id, m]));

    return schedules.map(s => {
      const machine = machineMap.get(s.machineId);
      const status = getMaintenanceStatus(s, machine?.currentMeterHours ?? 0);
      return { ...s, machine, maintenanceStatus: status };
    }).sort((a, b) => {
      const order = { overdue: 0, 'due-soon': 1, ok: 2 };
      return order[a.maintenanceStatus] - order[b.maintenanceStatus];
    });
  });
}

export function useMaintenanceSchedule(id: number) {
  return useLiveQuery(() => db.maintenanceSchedules.get(id), [id]);
}

export function useMaintenanceEvents(scheduleId: number) {
  return useLiveQuery(
    () => db.maintenanceEvents.where('scheduleId').equals(scheduleId).reverse().sortBy('completedAt'),
    [scheduleId]
  );
}

export async function recordMaintenance(
  scheduleId: number,
  machineId: number,
  completedBy: number,
  meterReading: number,
  notes: string,
  serviceType: string
) {
  return db.transaction('rw', [db.maintenanceEvents, db.maintenanceSchedules, db.machines], async () => {
    // Add event
    await db.maintenanceEvents.add({
      scheduleId,
      machineId,
      completedBy,
      completedAt: now(),
      meterReading,
      notes,
      serviceType,
    });

    // Update schedule's last completed and recalculate due
    const schedule = await db.maintenanceSchedules.get(scheduleId);
    if (schedule) {
      const todayStr = today();
      const newDueDate = schedule.intervalDays
        ? addDays(new Date(), schedule.intervalDays).toISOString().split('T')[0]
        : null;
      const newDueHours = schedule.intervalHours
        ? meterReading + schedule.intervalHours
        : null;

      await db.maintenanceSchedules.update(scheduleId, {
        lastCompletedDate: todayStr,
        lastCompletedHours: meterReading,
        dueDate: newDueDate,
        dueHours: newDueHours,
      });
    }

    // Update machine meter hours
    await db.machines.update(machineId, { currentMeterHours: meterReading });
  });
}
