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
    const [machines, defects, downtimeEvents, schedules, serviceOrders] = await Promise.all([
      siteId ? db.machines.where('siteId').equals(siteId).toArray() : db.machines.toArray(),
      db.defects.toArray(),
      db.downtimeEvents.toArray(),
      db.maintenanceSchedules.toArray(),
      db.serviceOrders.toArray(),
    ]);

    const todayStr = today();

    return machines.map(machine => {
      const machineDefects = defects.filter(d => d.machineId === machine.id);
      const machineDowntime = downtimeEvents.filter(d => d.machineId === machine.id);
      const machineSchedules = schedules.filter(s => s.machineId === machine.id);

      let state: AvailabilityState = 'available';

      // Active service order → out-for-service (highest priority)
      const activeOrder = serviceOrders.find(
        s => s.machineId === machine.id && (s.status === 'pending' || s.status === 'in-service')
      );
      if (activeOrder) {
        state = 'out-for-service';
      }
      // Active downtime → down
      else if (machineDowntime.some(d => !d.endTime)) {
        state = 'down';
      }
      // Open critical defect → down
      else if (machineDefects.some(d => d.severity === 'critical' && (d.status === 'open' || d.status === 'acknowledged'))) {
        state = 'down';
      }
      // Overdue maintenance → service-due
      else if (machineSchedules.some(s =>
        s.isActive && (
          (s.dueDate && s.dueDate <= todayStr) ||
          (s.dueHours && s.dueHours <= machine.currentMeterHours)
        )
      )) {
        state = 'service-due';
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
