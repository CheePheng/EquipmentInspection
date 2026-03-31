import { collection, doc, query, where, orderBy, limit } from 'firebase/firestore';
import { firestore } from '../lib/firebase';

// ---------------------------------------------------------------------------
// Collection references
// ---------------------------------------------------------------------------

export const usersRef = () => collection(firestore, 'users');
export const sitesRef = () => collection(firestore, 'sites');
export const machinesRef = () => collection(firestore, 'machines');
export const inspectionTemplatesRef = () => collection(firestore, 'inspectionTemplates');
export const inspectionsRef = () => collection(firestore, 'inspections');
export const inspectionItemsRef = () => collection(firestore, 'inspectionItems');
export const defectsRef = () => collection(firestore, 'defects');
export const defectPhotosRef = () => collection(firestore, 'defectPhotos');
export const maintenanceSchedulesRef = () => collection(firestore, 'maintenanceSchedules');
export const maintenanceEventsRef = () => collection(firestore, 'maintenanceEvents');
export const downtimeEventsRef = () => collection(firestore, 'downtimeEvents');
export const statusHistoryRef = () => collection(firestore, 'statusHistory');
export const serviceOrdersRef = () => collection(firestore, 'serviceOrders');
export const metaRef = () => collection(firestore, 'meta');

// ---------------------------------------------------------------------------
// Document reference helpers
// ---------------------------------------------------------------------------

export const userDoc = (id: number) => doc(firestore, 'users', String(id));
export const siteDoc = (id: number) => doc(firestore, 'sites', String(id));
export const machineDoc = (id: number) => doc(firestore, 'machines', String(id));
export const inspectionDoc = (id: number) => doc(firestore, 'inspections', String(id));
export const defectDoc = (id: number) => doc(firestore, 'defects', String(id));
export const serviceOrderDoc = (id: number) => doc(firestore, 'serviceOrders', String(id));
export const maintenanceScheduleDoc = (id: number) => doc(firestore, 'maintenanceSchedules', String(id));
export const maintenanceEventDoc = (id: number) => doc(firestore, 'maintenanceEvents', String(id));
export const downtimeEventDoc = (id: number) => doc(firestore, 'downtimeEvents', String(id));
export const metaDoc = (key: string) => doc(firestore, 'meta', key);

// ---------------------------------------------------------------------------
// Re-export query builders for convenience
// ---------------------------------------------------------------------------

export { query, where, orderBy, limit };
