import { useMemo } from 'react';
import { useCollectionQuery } from '../../db/useFirestoreQuery';
import {
  machinesRef, defectsRef, downtimeEventsRef, maintenanceSchedulesRef, serviceOrdersRef,
  query, where,
} from '../../db/collections';
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
  const machinesQ = useMemo(
    () => siteId ? query(machinesRef(), where('siteId', '==', siteId)) : query(machinesRef()),
    [siteId],
  );

  const machines = useCollectionQuery<any>(machinesQ, [siteId]);
  const defects = useCollectionQuery<any>(query(defectsRef()), []);
  const downtimeEvents = useCollectionQuery<any>(query(downtimeEventsRef()), []);
  const schedules = useCollectionQuery<any>(query(maintenanceSchedulesRef()), []);
  const serviceOrders = useCollectionQuery<any>(query(serviceOrdersRef()), []);

  return useMemo(() => {
    if (!machines || !defects || !downtimeEvents || !schedules || !serviceOrders) return undefined;

    const todayStr = today();

    return machines.map((machine: any) => {
      const machineDefects = defects.filter((d: any) => d.machineId === machine.id);
      const machineDowntime = downtimeEvents.filter((d: any) => d.machineId === machine.id);
      const machineSchedules = schedules.filter((s: any) => s.machineId === machine.id);

      let state: AvailabilityState = 'available';

      // Active service order → out-for-service (highest priority)
      const activeOrder = serviceOrders.find(
        (s: any) => s.machineId === machine.id && (s.status === 'pending' || s.status === 'in-service')
      );
      if (activeOrder) {
        state = 'out-for-service';
      }
      // Active downtime → down
      else if (machineDowntime.some((d: any) => !d.endTime)) {
        state = 'down';
      }
      // Open critical defect → down
      else if (machineDefects.some((d: any) => d.severity === 'critical' && (d.status === 'open' || d.status === 'acknowledged'))) {
        state = 'down';
      }
      // Overdue maintenance → service-due
      else if (machineSchedules.some((s: any) =>
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
  }, [machines, defects, downtimeEvents, schedules, serviceOrders]);
}
