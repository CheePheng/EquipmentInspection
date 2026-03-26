import Dexie, { type Table } from 'dexie';
import type { User } from './schemas/user.schema';
import type { Site } from './schemas/site.schema';
import type { Machine } from './schemas/machine.schema';
import type {
  InspectionTemplate,
  Inspection,
  InspectionItem,
} from './schemas/inspection.schema';
import type { Defect, DefectPhoto } from './schemas/defect.schema';
import type { MaintenanceSchedule, MaintenanceEvent } from './schemas/maintenance.schema';
import type { DowntimeEvent } from './schemas/downtime.schema';
import type { ServiceOrder } from './schemas/service-order.schema';

export interface StatusHistoryEntry {
  id?: number;
  machineId: number;
  fromState: string;
  toState: string;
  changedBy: number;
  changedAt: string;
  reason: string;
}

export interface MetaEntry {
  key: string;
  value: string;
}

export class FieldOpsDB extends Dexie {
  users!: Table<User>;
  sites!: Table<Site>;
  machines!: Table<Machine>;
  inspectionTemplates!: Table<InspectionTemplate>;
  inspections!: Table<Inspection>;
  inspectionItems!: Table<InspectionItem>;
  defects!: Table<Defect>;
  defectPhotos!: Table<DefectPhoto>;
  maintenanceSchedules!: Table<MaintenanceSchedule>;
  maintenanceEvents!: Table<MaintenanceEvent>;
  downtimeEvents!: Table<DowntimeEvent>;
  statusHistory!: Table<StatusHistoryEntry>;
  meta!: Table<MetaEntry>;
  serviceOrders!: Table<ServiceOrder>;

  constructor() {
    super('cct-fieldops');

    this.version(1).stores({
      users: '++id, pin, role, siteId',
      sites: '++id, name, isActive',
      machines: '++id, code, type, siteId, status, availabilityState, assignedOperatorId',
      inspectionTemplates: '++id, machineType, isActive',
      inspections: '++id, machineId, operatorId, [machineId+date], date, status, siteId',
      inspectionItems: '++id, inspectionId, templateItemId, result',
      defects: '++id, machineId, siteId, inspectionId, severity, status, reportedBy, createdAt',
      defectPhotos: '++id, defectId',
      maintenanceSchedules: '++id, machineId, serviceType, dueDate, dueHours, isActive',
      maintenanceEvents: '++id, scheduleId, machineId, completedBy, completedAt',
      downtimeEvents: '++id, machineId, defectId, startTime, endTime, reasonCode, siteId, loggedBy',
      statusHistory: '++id, machineId, changedAt',
      meta: '&key',
    });

    this.version(2).stores({
      serviceOrders: '++id, machineId, defectId, siteId, status, createdAt',
    });
  }
}

export const db = new FieldOpsDB();
