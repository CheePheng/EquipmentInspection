import { useMemo } from 'react';
import { useCollectionQuery } from '../../db/useFirestoreQuery';
import {
  defectsRef,
  machinesRef,
  inspectionsRef,
  downtimeEventsRef,
  maintenanceSchedulesRef,
  serviceOrdersRef,
  query,
} from '../../db/collections';
import { today } from '../../lib/utils';

export function useDashboardData() {
  const defects = useCollectionQuery<any>(query(defectsRef()), []);
  const machines = useCollectionQuery<any>(query(machinesRef()), []);
  const inspections = useCollectionQuery<any>(query(inspectionsRef()), []);
  const downtimeEvents = useCollectionQuery<any>(query(downtimeEventsRef()), []);
  const maintenanceSchedules = useCollectionQuery<any>(query(maintenanceSchedulesRef()), []);
  const serviceOrders = useCollectionQuery<any>(query(serviceOrdersRef()), []);

  return useMemo(() => {
    if (
      defects === undefined ||
      machines === undefined ||
      inspections === undefined ||
      downtimeEvents === undefined ||
      maintenanceSchedules === undefined ||
      serviceOrders === undefined
    )
      return undefined;

    const todayStr = today();

    // KPI 1: Critical unresolved defects
    const criticalDefects = defects.filter(
      (d: any) => d.severity === 'critical' && (d.status === 'open' || d.status === 'acknowledged'),
    ).length;

    // KPI 2: Machines down (active downtime)
    const machinesDown = new Set(downtimeEvents.filter((d: any) => !d.endTime).map((d: any) => d.machineId)).size;

    // KPI 3: Inspections completed today (percentage)
    const activeMachines = machines.filter((m: any) => m.status === 'active').length;
    const inspectionsToday = inspections.filter((i: any) => i.date === todayStr).length;
    const inspectionRate = activeMachines > 0 ? Math.round((inspectionsToday / activeMachines) * 100) : 0;

    // KPI 4: Overdue maintenance
    const overdueMaintenanceCount = maintenanceSchedules.filter((s: any) => {
      if (!s.isActive) return false;
      const machine = machines.find((m: any) => m.id === s.machineId);
      if (!machine) return false;
      return (s.dueDate && s.dueDate <= todayStr) || (s.dueHours && s.dueHours <= machine.currentMeterHours);
    }).length;

    // KPI 5: Machines out for service
    const machinesOutForService = new Set(
      serviceOrders.filter((o: any) => o.status === 'pending' || o.status === 'in-service').map((o: any) => o.machineId),
    ).size;

    // Chart: Downtime by reason code
    const completedDowntime = downtimeEvents.filter((d: any) => d.endTime);
    const downtimeByCode: Record<string, number> = {};
    completedDowntime.forEach((d: any) => {
      const duration = (new Date(d.endTime!).getTime() - new Date(d.startTime).getTime()) / (1000 * 60 * 60);
      downtimeByCode[d.reasonCode] = (downtimeByCode[d.reasonCode] || 0) + duration;
    });

    // Chart: Defect severity distribution
    const defectsBySeverity: Record<string, number> = {};
    defects.forEach((d: any) => {
      defectsBySeverity[d.severity] = (defectsBySeverity[d.severity] || 0) + 1;
    });

    // Chart: Inspection compliance over last 7 days
    const complianceData: { date: string; rate: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayInspections = inspections.filter((ins: any) => ins.date === dateStr).length;
      const rate = activeMachines > 0 ? Math.round((dayInspections / activeMachines) * 100) : 0;
      complianceData.push({ date: dateStr, rate, count: dayInspections });
    }

    return {
      criticalDefects,
      machinesDown,
      inspectionRate,
      inspectionsToday,
      activeMachines,
      overdueMaintenanceCount,
      machinesOutForService,
      downtimeByCode,
      defectsBySeverity,
      complianceData,
      totalDefectsOpen: defects.filter((d: any) => d.status === 'open').length,
    };
  }, [defects, machines, inspections, downtimeEvents, maintenanceSchedules, serviceOrders]);
}
