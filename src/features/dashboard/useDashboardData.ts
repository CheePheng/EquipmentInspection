import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { today } from '../../lib/utils';

export function useDashboardData() {
  return useLiveQuery(async () => {
    const todayStr = today();

    const [defects, machines, inspections, downtimeEvents, maintenanceSchedules] = await Promise.all([
      db.defects.toArray(),
      db.machines.toArray(),
      db.inspections.toArray(),
      db.downtimeEvents.toArray(),
      db.maintenanceSchedules.toArray(),
    ]);

    // KPI 1: Critical unresolved defects
    const criticalDefects = defects.filter(d =>
      d.severity === 'critical' && (d.status === 'open' || d.status === 'acknowledged')
    ).length;

    // KPI 2: Machines down (active downtime)
    const machinesDown = new Set(
      downtimeEvents.filter(d => !d.endTime).map(d => d.machineId)
    ).size;

    // KPI 3: Inspections completed today (percentage)
    const activeMachines = machines.filter(m => m.status === 'active').length;
    const inspectionsToday = inspections.filter(i => i.date === todayStr).length;
    const inspectionRate = activeMachines > 0 ? Math.round((inspectionsToday / activeMachines) * 100) : 0;

    // KPI 4: Overdue maintenance
    const overdueMaintenanceCount = maintenanceSchedules.filter(s => {
      if (!s.isActive) return false;
      const machine = machines.find(m => m.id === s.machineId);
      if (!machine) return false;
      return (s.dueDate && s.dueDate <= todayStr) ||
        (s.dueHours && s.dueHours <= machine.currentMeterHours);
    }).length;

    // Chart: Downtime by reason code
    const completedDowntime = downtimeEvents.filter(d => d.endTime);
    const downtimeByCode: Record<string, number> = {};
    completedDowntime.forEach(d => {
      const duration = (new Date(d.endTime!).getTime() - new Date(d.startTime).getTime()) / (1000 * 60 * 60);
      downtimeByCode[d.reasonCode] = (downtimeByCode[d.reasonCode] || 0) + duration;
    });

    // Chart: Defect severity distribution
    const defectsBySeverity: Record<string, number> = {};
    defects.forEach(d => {
      defectsBySeverity[d.severity] = (defectsBySeverity[d.severity] || 0) + 1;
    });

    // Chart: Inspection compliance over last 7 days
    const complianceData: { date: string; rate: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayInspections = inspections.filter(ins => ins.date === dateStr).length;
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
      downtimeByCode,
      defectsBySeverity,
      complianceData,
      totalDefectsOpen: defects.filter(d => d.status === 'open').length,
    };
  });
}
