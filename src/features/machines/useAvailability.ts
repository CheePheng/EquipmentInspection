import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { AvailabilityState } from '../../lib/constants';
import { today } from '../../lib/utils';

export interface MachineAvailability {
  id: number;
  code: string;
  name: string;
  type: string;
  siteId: number;
  currentMeterHours: number;
  availabilityState: AvailabilityState;
}

export function useAvailabilityBoard(siteId?: number | null) {
  return useLiveQuery(async () => {
    const [machines, defects, downtimeEvents, schedules] = await Promise.all([
      siteId ? db.machines.where('siteId').equals(siteId).toArray() : db.machines.toArray(),
      db.defects.toArray(),
      db.downtimeEvents.toArray(),
      db.maintenanceSchedules.toArray(),
    ]);

    const todayStr = today();

    return machines.map(machine => {
      const machineDefects = defects.filter(d => d.machineId === machine.id);
      const machineDowntime = downtimeEvents.filter(d => d.machineId === machine.id);
      const machineSchedules = schedules.filter(s => s.machineId === machine.id);

      let state: AvailabilityState = 'available';

      // Active downtime → down
      if (machineDowntime.some(d => !d.endTime)) {
        state = 'down';
      }
      // Open critical defect → needs-repair
      else if (machineDefects.some(d => d.status === 'open' && d.severity === 'critical')) {
        state = 'needs-repair';
      }
      // Overdue maintenance → inspection-due
      else if (machineSchedules.some(s =>
        s.isActive && (
          (s.dueDate && s.dueDate <= todayStr) ||
          (s.dueHours && s.dueHours <= machine.currentMeterHours)
        )
      )) {
        state = 'inspection-due';
      }

      return {
        id: machine.id!,
        code: machine.code,
        name: machine.name,
        type: machine.type,
        siteId: machine.siteId,
        currentMeterHours: machine.currentMeterHours,
        availabilityState: state,
      } as MachineAvailability;
    });
  }, [siteId]);
}
