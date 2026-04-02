export const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
export type Severity = typeof SEVERITY_LEVELS[number];

export const DEFECT_STATUSES = ['open', 'acknowledged', 'sent-out', 'resolved', 'deferred'] as const;
export type DefectStatus = typeof DEFECT_STATUSES[number];

export const AVAILABILITY_STATES = [
  'available', 'service-due', 'down', 'out-for-service'
] as const;
export type AvailabilityState = typeof AVAILABILITY_STATES[number];

export const INSPECTION_STATUSES = ['in-progress', 'completed', 'submitted'] as const;
export type InspectionStatus = typeof INSPECTION_STATUSES[number];

export const DOWNTIME_CODES = [
  'mechanical', 'hydraulic', 'electrical', 'tire-track',
  'waiting-parts', 'scheduled-service', 'weather-access', 'other'
] as const;
export type DowntimeCode = typeof DOWNTIME_CODES[number];

export const MACHINE_TYPES = [
  'harvester', 'forwarder', 'skidder', 'excavator',
  'loader', 'dozer', 'truck', 'generator', 'chainsaw-small-equipment'
] as const;
export type MachineType = typeof MACHINE_TYPES[number];

export const DEFECT_CATEGORIES = [
  'engine', 'hydraulic', 'electrical', 'structural',
  'safety', 'tires-tracks', 'cab-controls', 'lights-signals',
  'fluid-leaks', 'other'
] as const;
export type DefectCategory = typeof DEFECT_CATEGORIES[number];

export const USER_ROLES = ['worker', 'supervisor', 'boss'] as const;
export type UserRole = typeof USER_ROLES[number];

export const MACHINE_STATUSES = ['active', 'inactive'] as const;
export type MachineStatus = typeof MACHINE_STATUSES[number];

export const DOWNTIME_CODE_LABELS: Record<DowntimeCode, string> = {
  'mechanical': 'Mechanical',
  'hydraulic': 'Hydraulic',
  'electrical': 'Electrical',
  'tire-track': 'Tire / Track',
  'waiting-parts': 'Waiting for Parts',
  'scheduled-service': 'Scheduled Service',
  'weather-access': 'Weather / Access',
  'other': 'Other',
};

export const MACHINE_TYPE_LABELS: Record<MachineType, string> = {
  'harvester': 'Harvester',
  'forwarder': 'Forwarder',
  'skidder': 'Skidder',
  'excavator': 'Excavator',
  'loader': 'Loader',
  'dozer': 'Dozer',
  'truck': 'Truck',
  'generator': 'Generator',
  'chainsaw-small-equipment': 'Chainsaw / Small Equipment',
};

export const SEVERITY_COLORS: Record<Severity, { bg: string; text: string; border: string }> = {
  low: { bg: 'bg-slate-700', text: 'text-slate-200', border: 'border-slate-600' },
  medium: { bg: 'bg-amber-900/50', text: 'text-amber-200', border: 'border-amber-700' },
  high: { bg: 'bg-orange-900/50', text: 'text-orange-200', border: 'border-orange-700' },
  critical: { bg: 'bg-red-900/50', text: 'text-red-200', border: 'border-red-700' },
};

export const AVAILABILITY_STATE_COLORS: Record<AvailabilityState, { bg: string; text: string; dot: string }> = {
  'available': { bg: 'bg-emerald-900/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'service-due': { bg: 'bg-amber-900/30', text: 'text-amber-400', dot: 'bg-amber-400' },
  'down': { bg: 'bg-red-900/30', text: 'text-red-400', dot: 'bg-red-400' },
  'out-for-service': { bg: 'bg-orange-900/30', text: 'text-orange-400', dot: 'bg-orange-400' },
};

export const MAINTENANCE_DUE_SOON_DAYS = 7;
export const MAINTENANCE_DUE_SOON_HOURS = 50;
export const MAX_PHOTOS_PER_DEFECT = 5;
