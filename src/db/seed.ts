import { firestore } from '../lib/firebase';
import { doc, getDoc, writeBatch, setDoc } from 'firebase/firestore';

// ---------------------------------------------------------------------------
// Date helpers (relative to today: 2026-03-25)
// ---------------------------------------------------------------------------
function daysAgo(n: number): string {
  const d = new Date('2026-03-25T00:00:00.000Z');
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString();
}

function dateStrDaysAgo(n: number): string {
  const d = new Date('2026-03-25T00:00:00.000Z');
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function dateStrDaysFromNow(n: number): string {
  const d = new Date('2026-03-25T00:00:00.000Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function hoursAgo(n: number): string {
  const d = new Date('2026-03-25T08:00:00.000Z');
  d.setTime(d.getTime() - n * 3_600_000);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Batch helper — Firestore batches max 500 ops; we flush at 450.
// ---------------------------------------------------------------------------
let currentBatch = writeBatch(firestore);
let opCount = 0;
const MAX_OPS = 450;

async function batchSet(collection: string, id: number, data: Record<string, unknown>) {
  currentBatch.set(doc(firestore, collection, String(id)), { id, ...data });
  opCount++;
  if (opCount >= MAX_OPS) {
    await currentBatch.commit();
    currentBatch = writeBatch(firestore);
    opCount = 0;
  }
}

async function flushBatch() {
  if (opCount > 0) {
    await currentBatch.commit();
    currentBatch = writeBatch(firestore);
    opCount = 0;
  }
}

// ---------------------------------------------------------------------------
// Seed entry point
// ---------------------------------------------------------------------------
export async function seedDatabase(): Promise<void> {
  const seededDoc = await getDoc(doc(firestore, 'meta', 'seeded'));
  if (seededDoc.exists()) return;

  // -----------------------------------------------------------------------
  // SITES
  // -----------------------------------------------------------------------
  const site1Id = 1;
  const site2Id = 2;
  const site3Id = 3;

  await batchSet('sites', site1Id, { name: 'Compartment 14 - Acacia Block', location: 'Sabah, Malaysia', isActive: true });
  await batchSet('sites', site2Id, { name: 'Block 7 - Eucalyptus', location: 'Sarawak, Malaysia', isActive: true });
  await batchSet('sites', site3Id, { name: 'Equipment Yard - Mill', location: 'Sandakan, Sabah', isActive: true });

  // -----------------------------------------------------------------------
  // USERS
  // Workers: 1-Ahmad, 2-Lim Wei Jie, 3-Siti, 4-Tan Chee Keong
  // Supervisors: 5-Razak, 6-Chen Mei Ling
  // -----------------------------------------------------------------------
  const johanId = 1;
  const siphoId = 2;
  const mariaId = 3;
  const thaboId = 4;

  await batchSet('users', johanId, { pin: '1111', name: 'Ahmad bin Ismail', role: 'worker', siteId: site1Id });
  await batchSet('users', siphoId, { pin: '1112', name: 'Lim Wei Jie', role: 'worker', siteId: site1Id });
  await batchSet('users', mariaId, { pin: '1113', name: 'Siti Nurhaliza', role: 'worker', siteId: site2Id });
  await batchSet('users', thaboId, { pin: '1114', name: 'Tan Chee Keong', role: 'worker', siteId: site2Id });
  await batchSet('users', 5, { pin: '3333', name: 'Razak bin Osman', role: 'supervisor', siteId: site1Id });
  await batchSet('users', 6, { pin: '3334', name: 'Chen Mei Ling', role: 'supervisor', siteId: site2Id });
  await batchSet('users', 7, { pin: '888888', name: "Dato' Chai", role: 'boss', siteId: site1Id });

  // -----------------------------------------------------------------------
  // MACHINES  (18 total) — all availabilityState: 'available'
  // -----------------------------------------------------------------------
  const hv001Id = 1;
  const hv002Id = 2;
  const fw001Id = 3;
  const fw002Id = 4;
  const fw003Id = 5;
  const sk001Id = 6;
  const sk002Id = 7;
  const ex001Id = 8;
  const ex002Id = 9;
  const ld001Id = 10;
  const ld002Id = 11;
  const dz001Id = 12;
  const tk001Id = 13;
  const tk002Id = 14;
  const tk003Id = 15;
  const gn001Id = 16;
  const cs001Id = 17;
  const cs002Id = 18;

  await batchSet('machines', hv001Id, { code: 'HV-001', name: 'Ponsse Scorpion', type: 'harvester', siteId: site1Id, status: 'active', availabilityState: 'available', currentMeterHours: 4200, assignedOperatorId: johanId });
  await batchSet('machines', hv002Id, { code: 'HV-002', name: 'John Deere 1270G', type: 'harvester', siteId: site2Id, status: 'active', availabilityState: 'available', currentMeterHours: 3800, assignedOperatorId: mariaId });
  await batchSet('machines', fw001Id, { code: 'FW-001', name: 'Ponsse Elephant', type: 'forwarder', siteId: site1Id, status: 'active', availabilityState: 'available', currentMeterHours: 5100, assignedOperatorId: siphoId });
  await batchSet('machines', fw002Id, { code: 'FW-002', name: 'Komatsu 875', type: 'forwarder', siteId: site1Id, status: 'active', availabilityState: 'available', currentMeterHours: 3200, assignedOperatorId: null });
  await batchSet('machines', fw003Id, { code: 'FW-003', name: 'John Deere 1510G', type: 'forwarder', siteId: site2Id, status: 'active', availabilityState: 'available', currentMeterHours: 4600, assignedOperatorId: thaboId });
  await batchSet('machines', sk001Id, { code: 'SK-001', name: 'Cat 535D', type: 'skidder', siteId: site1Id, status: 'active', availabilityState: 'available', currentMeterHours: 6200, assignedOperatorId: null });
  await batchSet('machines', sk002Id, { code: 'SK-002', name: 'Tigercat 632E', type: 'skidder', siteId: site2Id, status: 'active', availabilityState: 'available', currentMeterHours: 2800, assignedOperatorId: null });
  await batchSet('machines', ex001Id, { code: 'EX-001', name: 'Cat 320', type: 'excavator', siteId: site1Id, status: 'active', availabilityState: 'available', currentMeterHours: 4800, assignedOperatorId: null });
  await batchSet('machines', ex002Id, { code: 'EX-002', name: 'Komatsu PC200', type: 'excavator', siteId: site2Id, status: 'active', availabilityState: 'available', currentMeterHours: 3500, assignedOperatorId: null });
  await batchSet('machines', ld001Id, { code: 'LD-001', name: 'Cat 950M', type: 'loader', siteId: site1Id, status: 'active', availabilityState: 'available', currentMeterHours: 5500, assignedOperatorId: null });
  await batchSet('machines', ld002Id, { code: 'LD-002', name: 'Volvo L120H', type: 'loader', siteId: site3Id, status: 'active', availabilityState: 'available', currentMeterHours: 4100, assignedOperatorId: null });
  await batchSet('machines', dz001Id, { code: 'DZ-001', name: 'Cat D6T', type: 'dozer', siteId: site1Id, status: 'active', availabilityState: 'available', currentMeterHours: 7200, assignedOperatorId: null });
  await batchSet('machines', tk001Id, { code: 'TK-001', name: 'Scania R500', type: 'truck', siteId: site3Id, status: 'active', availabilityState: 'available', currentMeterHours: 3400, assignedOperatorId: null });
  await batchSet('machines', tk002Id, { code: 'TK-002', name: 'Volvo FH16', type: 'truck', siteId: site3Id, status: 'active', availabilityState: 'available', currentMeterHours: 2900, assignedOperatorId: null });
  await batchSet('machines', tk003Id, { code: 'TK-003', name: 'MAN TGS', type: 'truck', siteId: site2Id, status: 'active', availabilityState: 'available', currentMeterHours: 4500, assignedOperatorId: null });
  await batchSet('machines', gn001Id, { code: 'GN-001', name: 'Atlas Copco QAS 150', type: 'generator', siteId: site1Id, status: 'active', availabilityState: 'available', currentMeterHours: 1200, assignedOperatorId: null });
  await batchSet('machines', cs001Id, { code: 'CS-001', name: 'Stihl MS 881', type: 'chainsaw-small-equipment', siteId: site1Id, status: 'active', availabilityState: 'available', currentMeterHours: 800, assignedOperatorId: null });
  await batchSet('machines', cs002Id, { code: 'CS-002', name: 'Husqvarna 572XP', type: 'chainsaw-small-equipment', siteId: site2Id, status: 'active', availabilityState: 'available', currentMeterHours: 600, assignedOperatorId: null });

  // -----------------------------------------------------------------------
  // INSPECTION TEMPLATES (9 — one per machine type)
  // -----------------------------------------------------------------------
  const tplHarvesterId = 1;
  const tplForwarderId = 2;
  const tplSkidderId = 3;
  const tplExcavatorId = 4;
  const tplLoaderId = 5;
  const tplDozerId = 6;
  const tplTruckId = 7;
  const tplGeneratorId = 8;
  const tplChainsawId = 9;

  // Build template items with stable UUIDs (generated once at seed time)
  const tplItems: Record<number, { id: string; label: string; category: string; required: boolean; order: number }[]> = {};

  tplItems[tplHarvesterId] = [
    { id: crypto.randomUUID(), label: 'Engine oil level', category: 'engine', required: true, order: 1 },
    { id: crypto.randomUUID(), label: 'Hydraulic hoses — no leaks or chafing', category: 'hydraulic', required: true, order: 2 },
    { id: crypto.randomUUID(), label: 'Cab safety glass — no cracks', category: 'cab-controls', required: true, order: 3 },
    { id: crypto.randomUUID(), label: 'Felling head condition and function', category: 'structural', required: true, order: 4 },
    { id: crypto.randomUUID(), label: 'Warning lights and beacon operational', category: 'lights-signals', required: true, order: 5 },
    { id: crypto.randomUUID(), label: 'Fire extinguisher — charged and accessible', category: 'safety', required: true, order: 6 },
    { id: crypto.randomUUID(), label: 'Track tension and condition', category: 'tires-tracks', required: true, order: 7 },
    { id: crypto.randomUUID(), label: 'Boom play and pivot pins', category: 'structural', required: true, order: 8 },
    { id: crypto.randomUUID(), label: 'Coolant level', category: 'engine', required: true, order: 9 },
    { id: crypto.randomUUID(), label: 'Emergency stop function', category: 'safety', required: true, order: 10 },
  ];

  tplItems[tplForwarderId] = [
    { id: crypto.randomUUID(), label: 'Engine oil level', category: 'engine', required: true, order: 1 },
    { id: crypto.randomUUID(), label: 'Hydraulic system — fluid level and hoses', category: 'hydraulic', required: true, order: 2 },
    { id: crypto.randomUUID(), label: 'Crane function and slew bearing', category: 'structural', required: true, order: 3 },
    { id: crypto.randomUUID(), label: 'Bunk stakes — secure and undamaged', category: 'structural', required: true, order: 4 },
    { id: crypto.randomUUID(), label: 'Tire pressure and condition', category: 'tires-tracks', required: true, order: 5 },
    { id: crypto.randomUUID(), label: 'Head and tail lights operational', category: 'lights-signals', required: true, order: 6 },
    { id: crypto.randomUUID(), label: 'Brakes — park and service', category: 'safety', required: true, order: 7 },
    { id: crypto.randomUUID(), label: 'Cab condition and seat belt', category: 'cab-controls', required: true, order: 8 },
    { id: crypto.randomUUID(), label: 'Coolant level', category: 'engine', required: true, order: 9 },
  ];

  tplItems[tplSkidderId] = [
    { id: crypto.randomUUID(), label: 'Engine oil level and condition', category: 'engine', required: true, order: 1 },
    { id: crypto.randomUUID(), label: 'Hydraulic fluid level and hoses', category: 'hydraulic', required: true, order: 2 },
    { id: crypto.randomUUID(), label: 'Winch cable — no kinks, fraying or twists', category: 'structural', required: true, order: 3 },
    { id: crypto.randomUUID(), label: 'Blade condition and mounting', category: 'structural', required: true, order: 4 },
    { id: crypto.randomUUID(), label: 'Tire / track condition and pressure', category: 'tires-tracks', required: true, order: 5 },
    { id: crypto.randomUUID(), label: 'Lights operational', category: 'lights-signals', required: true, order: 6 },
    { id: crypto.randomUUID(), label: 'Rollover protection structure (ROPS)', category: 'safety', required: true, order: 7 },
    { id: crypto.randomUUID(), label: 'Steering response and articulation', category: 'cab-controls', required: true, order: 8 },
  ];

  tplItems[tplExcavatorId] = [
    { id: crypto.randomUUID(), label: 'Engine oil level', category: 'engine', required: true, order: 1 },
    { id: crypto.randomUUID(), label: 'Hydraulic fluid level and hose integrity', category: 'hydraulic', required: true, order: 2 },
    { id: crypto.randomUUID(), label: 'Bucket teeth — wear and attachment pins', category: 'structural', required: true, order: 3 },
    { id: crypto.randomUUID(), label: 'Track tension and pad condition', category: 'tires-tracks', required: true, order: 4 },
    { id: crypto.randomUUID(), label: 'Cab glass — no cracks or obstructions', category: 'cab-controls', required: true, order: 5 },
    { id: crypto.randomUUID(), label: 'Lights and warning devices', category: 'lights-signals', required: true, order: 6 },
    { id: crypto.randomUUID(), label: 'Swing bearing — play and lubrication', category: 'structural', required: true, order: 7 },
    { id: crypto.randomUUID(), label: 'Boom and stick cylinder seals', category: 'hydraulic', required: true, order: 8 },
    { id: crypto.randomUUID(), label: 'Fire suppression system', category: 'safety', required: true, order: 9 },
  ];

  tplItems[tplLoaderId] = [
    { id: crypto.randomUUID(), label: 'Engine oil level', category: 'engine', required: true, order: 1 },
    { id: crypto.randomUUID(), label: 'Hydraulic fluid level and hoses', category: 'hydraulic', required: true, order: 2 },
    { id: crypto.randomUUID(), label: 'Bucket and cutting edge condition', category: 'structural', required: true, order: 3 },
    { id: crypto.randomUUID(), label: 'Tire pressure and sidewall condition', category: 'tires-tracks', required: true, order: 4 },
    { id: crypto.randomUUID(), label: 'All lights and beacon', category: 'lights-signals', required: true, order: 5 },
    { id: crypto.randomUUID(), label: 'Brakes — park and service', category: 'safety', required: true, order: 6 },
    { id: crypto.randomUUID(), label: 'Steering function and lock-to-lock', category: 'cab-controls', required: true, order: 7 },
    { id: crypto.randomUUID(), label: 'Cab condition and ROPS integrity', category: 'safety', required: true, order: 8 },
  ];

  tplItems[tplDozerId] = [
    { id: crypto.randomUUID(), label: 'Engine oil level and condition', category: 'engine', required: true, order: 1 },
    { id: crypto.randomUUID(), label: 'Hydraulic fluid level', category: 'hydraulic', required: true, order: 2 },
    { id: crypto.randomUUID(), label: 'Blade condition and lift cylinders', category: 'structural', required: true, order: 3 },
    { id: crypto.randomUUID(), label: 'Track tension, rollers and sprockets', category: 'tires-tracks', required: true, order: 4 },
    { id: crypto.randomUUID(), label: 'Lights — head, work and tail', category: 'lights-signals', required: true, order: 5 },
    { id: crypto.randomUUID(), label: 'Steering clutches and brakes', category: 'cab-controls', required: true, order: 6 },
    { id: crypto.randomUUID(), label: 'ROPS integrity — no cracks or repairs', category: 'safety', required: true, order: 7 },
    { id: crypto.randomUUID(), label: 'Ripper condition and shank pins', category: 'structural', required: true, order: 8 },
  ];

  tplItems[tplTruckId] = [
    { id: crypto.randomUUID(), label: 'Engine oil level', category: 'engine', required: true, order: 1 },
    { id: crypto.randomUUID(), label: 'Brakes — park, service and trailer', category: 'safety', required: true, order: 2 },
    { id: crypto.randomUUID(), label: 'Tire condition and pressure — all axles', category: 'tires-tracks', required: true, order: 3 },
    { id: crypto.randomUUID(), label: 'Lights — head, tail, indicator, brake', category: 'lights-signals', required: true, order: 4 },
    { id: crypto.randomUUID(), label: 'Load body and stanchion condition', category: 'structural', required: true, order: 5 },
    { id: crypto.randomUUID(), label: 'Mirrors — all adjusted and undamaged', category: 'cab-controls', required: true, order: 6 },
    { id: crypto.randomUUID(), label: 'Steering play and function', category: 'cab-controls', required: true, order: 7 },
    { id: crypto.randomUUID(), label: 'Suspension — no visible damage or sag', category: 'structural', required: true, order: 8 },
    { id: crypto.randomUUID(), label: 'Coolant level', category: 'engine', required: true, order: 9 },
  ];

  tplItems[tplGeneratorId] = [
    { id: crypto.randomUUID(), label: 'Engine oil level', category: 'engine', required: true, order: 1 },
    { id: crypto.randomUUID(), label: 'Fuel level and fuel line integrity', category: 'fluid-leaks', required: true, order: 2 },
    { id: crypto.randomUUID(), label: 'Coolant level', category: 'engine', required: true, order: 3 },
    { id: crypto.randomUUID(), label: 'Output voltage and frequency check', category: 'electrical', required: true, order: 4 },
    { id: crypto.randomUUID(), label: 'Circuit breakers — all in correct position', category: 'electrical', required: true, order: 5 },
    { id: crypto.randomUUID(), label: 'Enclosure — secure and ventilation clear', category: 'structural', required: true, order: 6 },
    { id: crypto.randomUUID(), label: 'Emergency stop button test', category: 'safety', required: true, order: 7 },
    { id: crypto.randomUUID(), label: 'Fuel lines — no leaks', category: 'fluid-leaks', required: true, order: 8 },
  ];

  tplItems[tplChainsawId] = [
    { id: crypto.randomUUID(), label: 'Chain tension — correct and secure', category: 'structural', required: true, order: 1 },
    { id: crypto.randomUUID(), label: 'Bar condition — no cracks or bends', category: 'structural', required: true, order: 2 },
    { id: crypto.randomUUID(), label: 'Chain safety brake function', category: 'safety', required: true, order: 3 },
    { id: crypto.randomUUID(), label: 'Air filter — clean and correctly fitted', category: 'engine', required: true, order: 4 },
    { id: crypto.randomUUID(), label: 'Fuel mix ratio correct', category: 'engine', required: true, order: 5 },
    { id: crypto.randomUUID(), label: 'Handle grip — no cracks or looseness', category: 'structural', required: true, order: 6 },
    { id: crypto.randomUUID(), label: 'Chain sharpness adequate', category: 'structural', required: true, order: 7 },
  ];

  await batchSet('inspectionTemplates', tplHarvesterId, { machineType: 'harvester', name: 'Harvester Daily Pre-Shift Inspection', isActive: true, items: tplItems[tplHarvesterId] });
  await batchSet('inspectionTemplates', tplForwarderId, { machineType: 'forwarder', name: 'Forwarder Daily Pre-Shift Inspection', isActive: true, items: tplItems[tplForwarderId] });
  await batchSet('inspectionTemplates', tplSkidderId, { machineType: 'skidder', name: 'Skidder Daily Pre-Shift Inspection', isActive: true, items: tplItems[tplSkidderId] });
  await batchSet('inspectionTemplates', tplExcavatorId, { machineType: 'excavator', name: 'Excavator Daily Pre-Shift Inspection', isActive: true, items: tplItems[tplExcavatorId] });
  await batchSet('inspectionTemplates', tplLoaderId, { machineType: 'loader', name: 'Loader Daily Pre-Shift Inspection', isActive: true, items: tplItems[tplLoaderId] });
  await batchSet('inspectionTemplates', tplDozerId, { machineType: 'dozer', name: 'Dozer Daily Pre-Shift Inspection', isActive: true, items: tplItems[tplDozerId] });
  await batchSet('inspectionTemplates', tplTruckId, { machineType: 'truck', name: 'Timber Truck Daily Pre-Trip Inspection', isActive: true, items: tplItems[tplTruckId] });
  await batchSet('inspectionTemplates', tplGeneratorId, { machineType: 'generator', name: 'Generator Pre-Start Inspection', isActive: true, items: tplItems[tplGeneratorId] });
  await batchSet('inspectionTemplates', tplChainsawId, { machineType: 'chainsaw-small-equipment', name: 'Chainsaw / Small Equipment Pre-Use Inspection', isActive: true, items: tplItems[tplChainsawId] });

  // -----------------------------------------------------------------------
  // INSPECTIONS — 30 over past 14 days
  // -----------------------------------------------------------------------
  // Helper to add inspection items inline
  let nextItemId = 1;
  async function addItems(
    inspectionId: number,
    templateId: number,
    failIndices: number[] = [],
    naIndices: number[] = [],
  ) {
    const items = tplItems[templateId];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let result: 'pass' | 'fail' | 'na' = 'pass';
      if (failIndices.includes(i)) result = 'fail';
      else if (naIndices.includes(i)) result = 'na';
      await batchSet('inspectionItems', nextItemId++, {
        inspectionId,
        templateItemId: item.id,
        result,
        notes: result === 'fail' ? 'Requires attention — noted during inspection.' : '',
      });
    }
  }

  // ---- Day 14 ago ----
  await batchSet('inspections', 1, { machineId: hv001Id, operatorId: johanId, date: dateStrDaysAgo(14), meterReading: 4175, status: 'completed', completedAt: daysAgo(14), siteId: site1Id });
  await addItems(1, tplHarvesterId, [], [8]);

  await batchSet('inspections', 2, { machineId: fw001Id, operatorId: siphoId, date: dateStrDaysAgo(14), meterReading: 5075, status: 'completed', completedAt: daysAgo(14), siteId: site1Id });
  await addItems(2, tplForwarderId, [1]);

  // ---- Day 13 ago ----
  await batchSet('inspections', 3, { machineId: hv002Id, operatorId: mariaId, date: dateStrDaysAgo(13), meterReading: 3768, status: 'completed', completedAt: daysAgo(13), siteId: site2Id });
  await addItems(3, tplHarvesterId, [], []);

  await batchSet('inspections', 4, { machineId: sk001Id, operatorId: johanId, date: dateStrDaysAgo(13), meterReading: 6178, status: 'completed', completedAt: daysAgo(13), siteId: site1Id });
  await addItems(4, tplSkidderId, [1, 2]);

  // ---- Day 12 ago ----
  await batchSet('inspections', 5, { machineId: fw002Id, operatorId: siphoId, date: dateStrDaysAgo(12), meterReading: 3180, status: 'completed', completedAt: daysAgo(12), siteId: site1Id });
  await addItems(5, tplForwarderId, [], [7]);

  await batchSet('inspections', 6, { machineId: ex001Id, operatorId: johanId, date: dateStrDaysAgo(12), meterReading: 4778, status: 'completed', completedAt: daysAgo(12), siteId: site1Id });
  await addItems(6, tplExcavatorId, [], []);

  // ---- Day 11 ago ----
  await batchSet('inspections', 7, { machineId: tk001Id, operatorId: siphoId, date: dateStrDaysAgo(11), meterReading: 3382, status: 'completed', completedAt: daysAgo(11), siteId: site3Id });
  await addItems(7, tplTruckId, [2]);

  await batchSet('inspections', 8, { machineId: fw003Id, operatorId: thaboId, date: dateStrDaysAgo(11), meterReading: 4573, status: 'completed', completedAt: daysAgo(11), siteId: site2Id });
  await addItems(8, tplForwarderId, [], []);

  // ---- Day 10 ago ----
  await batchSet('inspections', 9, { machineId: ld001Id, operatorId: johanId, date: dateStrDaysAgo(10), meterReading: 5475, status: 'completed', completedAt: daysAgo(10), siteId: site1Id });
  await addItems(9, tplLoaderId, [3]);

  await batchSet('inspections', 10, { machineId: sk002Id, operatorId: thaboId, date: dateStrDaysAgo(10), meterReading: 2778, status: 'completed', completedAt: daysAgo(10), siteId: site2Id });
  await addItems(10, tplSkidderId, [], []);

  // ---- Day 9 ago ----
  await batchSet('inspections', 11, { machineId: ex002Id, operatorId: thaboId, date: dateStrDaysAgo(9), meterReading: 3486, status: 'completed', completedAt: daysAgo(9), siteId: site2Id });
  await addItems(11, tplExcavatorId, [0, 1], []);

  await batchSet('inspections', 12, { machineId: gn001Id, operatorId: siphoId, date: dateStrDaysAgo(9), meterReading: 1188, status: 'completed', completedAt: daysAgo(9), siteId: site1Id });
  await addItems(12, tplGeneratorId, [], []);

  // ---- Day 8 ago ----
  await batchSet('inspections', 13, { machineId: hv001Id, operatorId: johanId, date: dateStrDaysAgo(8), meterReading: 4188, status: 'completed', completedAt: daysAgo(8), siteId: site1Id });
  await addItems(13, tplHarvesterId, [], []);

  await batchSet('inspections', 14, { machineId: cs001Id, operatorId: siphoId, date: dateStrDaysAgo(8), meterReading: 793, status: 'completed', completedAt: daysAgo(8), siteId: site1Id });
  await addItems(14, tplChainsawId, [0]);

  // ---- Day 7 ago ----
  await batchSet('inspections', 15, { machineId: dz001Id, operatorId: johanId, date: dateStrDaysAgo(7), meterReading: 7183, status: 'completed', completedAt: daysAgo(7), siteId: site1Id });
  await addItems(15, tplDozerId, [0, 3]);

  await batchSet('inspections', 16, { machineId: tk002Id, operatorId: siphoId, date: dateStrDaysAgo(7), meterReading: 2887, status: 'completed', completedAt: daysAgo(7), siteId: site3Id });
  await addItems(16, tplTruckId, [], [5]);

  // ---- Day 6 ago ----
  await batchSet('inspections', 17, { machineId: hv002Id, operatorId: mariaId, date: dateStrDaysAgo(6), meterReading: 3783, status: 'completed', completedAt: daysAgo(6), siteId: site2Id });
  await addItems(17, tplHarvesterId, [], []);

  await batchSet('inspections', 18, { machineId: fw001Id, operatorId: siphoId, date: dateStrDaysAgo(6), meterReading: 5088, status: 'completed', completedAt: daysAgo(6), siteId: site1Id });
  await addItems(18, tplForwarderId, [], []);

  // ---- Day 5 ago ----
  await batchSet('inspections', 19, { machineId: ld002Id, operatorId: mariaId, date: dateStrDaysAgo(5), meterReading: 4086, status: 'completed', completedAt: daysAgo(5), siteId: site3Id });
  await addItems(19, tplLoaderId, [1]);

  await batchSet('inspections', 20, { machineId: cs002Id, operatorId: thaboId, date: dateStrDaysAgo(5), meterReading: 594, status: 'completed', completedAt: daysAgo(5), siteId: site2Id });
  await addItems(20, tplChainsawId, [], []);

  // ---- Day 4 ago ----
  await batchSet('inspections', 21, { machineId: sk001Id, operatorId: johanId, date: dateStrDaysAgo(4), meterReading: 6193, status: 'completed', completedAt: daysAgo(4), siteId: site1Id });
  await addItems(21, tplSkidderId, [1], []);

  await batchSet('inspections', 22, { machineId: tk003Id, operatorId: thaboId, date: dateStrDaysAgo(4), meterReading: 4488, status: 'completed', completedAt: daysAgo(4), siteId: site2Id });
  await addItems(22, tplTruckId, [], []);

  // ---- Day 3 ago ----
  await batchSet('inspections', 23, { machineId: hv001Id, operatorId: johanId, date: dateStrDaysAgo(3), meterReading: 4196, status: 'completed', completedAt: daysAgo(3), siteId: site1Id });
  await addItems(23, tplHarvesterId, [], []);

  await batchSet('inspections', 24, { machineId: fw003Id, operatorId: thaboId, date: dateStrDaysAgo(3), meterReading: 4592, status: 'completed', completedAt: daysAgo(3), siteId: site2Id });
  await addItems(24, tplForwarderId, [], [6]);

  // ---- Day 2 ago ----
  await batchSet('inspections', 25, { machineId: ex001Id, operatorId: johanId, date: dateStrDaysAgo(2), meterReading: 4796, status: 'completed', completedAt: daysAgo(2), siteId: site1Id });
  await addItems(25, tplExcavatorId, [], []);

  await batchSet('inspections', 26, { machineId: gn001Id, operatorId: siphoId, date: dateStrDaysAgo(2), meterReading: 1196, status: 'completed', completedAt: daysAgo(2), siteId: site1Id });
  await addItems(26, tplGeneratorId, [3]);

  // ---- Day 1 ago ----
  await batchSet('inspections', 27, { machineId: hv002Id, operatorId: mariaId, date: dateStrDaysAgo(1), meterReading: 3796, status: 'submitted', completedAt: daysAgo(1), siteId: site2Id });
  await addItems(27, tplHarvesterId, [], []);

  await batchSet('inspections', 28, { machineId: tk001Id, operatorId: siphoId, date: dateStrDaysAgo(1), meterReading: 3397, status: 'submitted', completedAt: daysAgo(1), siteId: site3Id });
  await addItems(28, tplTruckId, [1]);

  await batchSet('inspections', 29, { machineId: ld001Id, operatorId: johanId, date: dateStrDaysAgo(1), meterReading: 5496, status: 'completed', completedAt: daysAgo(1), siteId: site1Id });
  await addItems(29, tplLoaderId, [], []);

  await batchSet('inspections', 30, { machineId: cs001Id, operatorId: siphoId, date: dateStrDaysAgo(1), meterReading: 798, status: 'completed', completedAt: daysAgo(1), siteId: site1Id });
  await addItems(30, tplChainsawId, [], []);

  // Wait for any pending addItems batchSet calls
  await flushBatch();

  // -----------------------------------------------------------------------
  // DEFECTS — 12 total
  // -----------------------------------------------------------------------
  const def1Id = 1;
  const def2Id = 2;
  const def3Id = 3;
  const def5Id = 5;
  const def7Id = 7;
  const def8Id = 8;

  await batchSet('defects', 1, { machineId: ex002Id, siteId: site2Id, inspectionId: 11, category: 'engine', severity: 'critical', status: 'open', description: 'Severe engine oil leak detected — oil visible pooling under machine. Machine deemed unsafe to operate.', safeToOperate: false, priority: true, reportedBy: thaboId, createdAt: daysAgo(9), updatedAt: daysAgo(9) });
  await batchSet('defects', 2, { machineId: sk001Id, siteId: site1Id, inspectionId: 4, category: 'hydraulic', severity: 'critical', status: 'open', description: 'Hydraulic hose burst on winch circuit. Fluid spraying — fire and injury risk. Machine pulled from service.', safeToOperate: false, priority: true, reportedBy: johanId, createdAt: daysAgo(13), updatedAt: daysAgo(4) });
  await batchSet('defects', 3, { machineId: fw001Id, siteId: site1Id, inspectionId: 2, category: 'hydraulic', severity: 'high', status: 'open', description: 'Hydraulic fluid seeping from boom cylinder rod seal. Minor leak increasing over shift.', safeToOperate: true, priority: false, reportedBy: siphoId, createdAt: daysAgo(14), updatedAt: daysAgo(14) });
  await batchSet('defects', 4, { machineId: dz001Id, siteId: site1Id, inspectionId: 15, category: 'engine', severity: 'high', status: 'acknowledged', description: 'Engine oil level below minimum on dipstick. Excessive consumption suspected. Machine scheduled for service.', safeToOperate: true, priority: false, reportedBy: johanId, createdAt: daysAgo(7), updatedAt: daysAgo(3) });
  await batchSet('defects', 5, { machineId: tk001Id, siteId: site3Id, inspectionId: 7, category: 'tires-tracks', severity: 'high', status: 'resolved', description: 'Right rear steer axle tire showing deep sidewall cut — risk of blowout under load.', safeToOperate: false, priority: true, reportedBy: siphoId, createdAt: daysAgo(11), updatedAt: daysAgo(8) });
  await batchSet('defects', 6, { machineId: ld001Id, siteId: site1Id, inspectionId: 9, category: 'tires-tracks', severity: 'medium', status: 'open', description: 'Front left tire tread below 20% — approaching replacement threshold.', safeToOperate: true, priority: false, reportedBy: johanId, createdAt: daysAgo(10), updatedAt: daysAgo(10) });
  await batchSet('defects', 7, { machineId: gn001Id, siteId: site1Id, inspectionId: 26, category: 'electrical', severity: 'medium', status: 'acknowledged', description: 'Output voltage fluctuating ±8V under load. AVR may require adjustment or replacement.', safeToOperate: true, priority: false, reportedBy: siphoId, createdAt: daysAgo(2), updatedAt: daysAgo(1) });
  await batchSet('defects', 8, { machineId: cs001Id, siteId: site1Id, inspectionId: 14, category: 'structural', severity: 'medium', status: 'resolved', description: 'Chain tension out of spec — excessive sag on bar. Chain adjusted and re-tensioned.', safeToOperate: false, priority: false, reportedBy: siphoId, createdAt: daysAgo(8), updatedAt: daysAgo(7) });
  await batchSet('defects', 9, { machineId: ld002Id, siteId: site3Id, inspectionId: 19, category: 'fluid-leaks', severity: 'medium', status: 'open', description: 'Small hydraulic fluid weep from tilt cylinder base seal. Requires monitoring.', safeToOperate: true, priority: false, reportedBy: mariaId, createdAt: daysAgo(5), updatedAt: daysAgo(5) });
  await batchSet('defects', 10, { machineId: fw003Id, siteId: site2Id, inspectionId: 8, category: 'cab-controls', severity: 'low', status: 'resolved', description: 'Door seal worn on operator cab — minor noise intrusion and dust ingress.', safeToOperate: true, priority: false, reportedBy: thaboId, createdAt: daysAgo(11), updatedAt: daysAgo(5) });
  await batchSet('defects', 11, { machineId: tk001Id, siteId: site3Id, inspectionId: 28, category: 'lights-signals', severity: 'low', status: 'resolved', description: 'Brake warning indicator lamp intermittent — confirmed bulb failure, not brake fault.', safeToOperate: true, priority: false, reportedBy: siphoId, createdAt: daysAgo(1), updatedAt: daysAgo(1) });
  await batchSet('defects', 12, { machineId: sk001Id, siteId: site1Id, inspectionId: null, category: 'structural', severity: 'low', status: 'open', description: 'Minor surface crack on rear chassis cross-member. Monitoring required — not structurally critical.', safeToOperate: true, priority: false, reportedBy: siphoId, createdAt: daysAgo(6), updatedAt: daysAgo(6) });

  // -----------------------------------------------------------------------
  // DOWNTIME EVENTS — 15 total (2 active, 13 completed)
  // -----------------------------------------------------------------------
  await batchSet('downtimeEvents', 1, { machineId: ex002Id, defectId: def1Id, startTime: hoursAgo(48), endTime: null, reasonCode: 'mechanical', notes: 'Machine pulled from service — critical engine oil leak. Awaiting parts.', siteId: site2Id, loggedBy: thaboId });
  await batchSet('downtimeEvents', 2, { machineId: sk001Id, defectId: def2Id, startTime: hoursAgo(72), endTime: null, reasonCode: 'hydraulic', notes: 'Hydraulic hose failure on winch circuit. Machine isolated and tagged out.', siteId: site1Id, loggedBy: johanId });
  await batchSet('downtimeEvents', 3, { machineId: dz001Id, defectId: null, startTime: daysAgo(7), endTime: daysAgo(6), reasonCode: 'scheduled-service', notes: '1000-hour major service. Machine back in service after service.', siteId: site1Id, loggedBy: siphoId });
  await batchSet('downtimeEvents', 4, { machineId: tk001Id, defectId: def5Id, startTime: daysAgo(11), endTime: daysAgo(8), reasonCode: 'tire-track', notes: 'Sidewall blowout risk — machine stood down until tire replaced.', siteId: site3Id, loggedBy: siphoId });
  await batchSet('downtimeEvents', 5, { machineId: fw001Id, defectId: def3Id, startTime: daysAgo(5), endTime: daysAgo(4), reasonCode: 'hydraulic', notes: 'Boom cylinder seal repair. Machine returned to service after seal replacement.', siteId: site1Id, loggedBy: siphoId });
  await batchSet('downtimeEvents', 6, { machineId: fw002Id, defectId: null, startTime: daysAgo(12), endTime: daysAgo(10), reasonCode: 'waiting-parts', notes: 'Hydraulic pump seal kit on back-order. Machine stood down.', siteId: site1Id, loggedBy: siphoId });
  await batchSet('downtimeEvents', 7, { machineId: hv002Id, defectId: null, startTime: daysAgo(8), endTime: daysAgo(8), reasonCode: 'electrical', notes: 'Felling head not responding — traced to corroded CAN bus connector. Cleaned and reconnected.', siteId: site2Id, loggedBy: mariaId });
  await batchSet('downtimeEvents', 8, { machineId: gn001Id, defectId: def7Id, startTime: daysAgo(2), endTime: daysAgo(1), reasonCode: 'electrical', notes: 'AVR failure causing voltage fluctuation — generator isolated while AVR sourced.', siteId: site1Id, loggedBy: siphoId });
  await batchSet('downtimeEvents', 9, { machineId: tk002Id, defectId: null, startTime: daysAgo(4), endTime: daysAgo(4), reasonCode: 'weather-access', notes: 'Severe thunderstorm — all haulage suspended for 2 hours per site safety protocol.', siteId: site3Id, loggedBy: siphoId });
  await batchSet('downtimeEvents', 10, { machineId: sk002Id, defectId: null, startTime: daysAgo(6), endTime: daysAgo(6), reasonCode: 'other', notes: 'Machine ran low on fuel mid-shift in remote block. Fuel delivery took 1.5 hours.', siteId: site2Id, loggedBy: thaboId });
  await batchSet('downtimeEvents', 11, { machineId: ex001Id, defectId: null, startTime: daysAgo(9), endTime: daysAgo(9), reasonCode: 'weather-access', notes: 'Harvest road washed out after rain. Excavator used to re-cut road — 3hr delay to production.', siteId: site1Id, loggedBy: johanId });
  await batchSet('downtimeEvents', 12, { machineId: cs001Id, defectId: def8Id, startTime: daysAgo(8), endTime: daysAgo(7), reasonCode: 'mechanical', notes: 'Chain tension out of spec — chainsaw withdrawn from use until adjusted by mechanic.', siteId: site1Id, loggedBy: siphoId });
  await batchSet('downtimeEvents', 13, { machineId: hv001Id, defectId: null, startTime: daysAgo(10), endTime: daysAgo(10), reasonCode: 'mechanical', notes: 'Felling head rotator motor slow — diagnosed as worn motor. Temporary fix applied pending parts.', siteId: site1Id, loggedBy: johanId });
  await batchSet('downtimeEvents', 14, { machineId: ld002Id, defectId: null, startTime: daysAgo(14), endTime: daysAgo(14), reasonCode: 'scheduled-service', notes: '250-hour oil service completed in field. Machine returned same day.', siteId: site3Id, loggedBy: thaboId });
  await batchSet('downtimeEvents', 15, { machineId: tk003Id, defectId: null, startTime: daysAgo(3), endTime: daysAgo(3), reasonCode: 'other', notes: 'Operator reported unfamiliar cab warning light — supervisor called. Confirmed low washer fluid only.', siteId: site2Id, loggedBy: thaboId });

  // -----------------------------------------------------------------------
  // MAINTENANCE SCHEDULES — ~40 total
  // -----------------------------------------------------------------------
  // Schedule IDs 1..40, mapped by order of insertion
  // For maintenance events we need schedule IDs by index (0-based index → 1-based ID)

  const schedules: { machineId: number; serviceType: string; intervalDays: number | null; intervalHours: number | null; lastCompletedDate: string | null; lastCompletedHours: number | null; dueDate: string | null; dueHours: number | null }[] = [
    // [0] HV-001 (4200hrs)
    { machineId: hv001Id, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(22), lastCompletedHours: 4100, dueDate: dateStrDaysFromNow(8), dueHours: 4350 },
    // [1] HV-001
    { machineId: hv001Id, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(45), lastCompletedHours: 3950, dueDate: dateStrDaysFromNow(15), dueHours: 4450 },
    // [2] HV-001
    { machineId: hv001Id, serviceType: 'Full Service', intervalDays: 90, intervalHours: 1000, lastCompletedDate: dateStrDaysAgo(60), lastCompletedHours: 3800, dueDate: dateStrDaysFromNow(30), dueHours: 4800 },

    // [3] HV-002 (3800hrs)
    { machineId: hv002Id, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(28), lastCompletedHours: 3680, dueDate: dateStrDaysFromNow(2), dueHours: 3930 },
    // [4] HV-002
    { machineId: hv002Id, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(55), lastCompletedHours: 3550, dueDate: dateStrDaysFromNow(5), dueHours: 4050 },
    // [5] HV-002
    { machineId: hv002Id, serviceType: 'Full Service', intervalDays: 90, intervalHours: 1000, lastCompletedDate: dateStrDaysAgo(80), lastCompletedHours: 3400, dueDate: dateStrDaysFromNow(10), dueHours: 4400 },

    // [6] FW-001 (5100hrs) — overdue oil change
    { machineId: fw001Id, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(35), lastCompletedHours: 4920, dueDate: dateStrDaysAgo(5), dueHours: 5170 },
    // [7] FW-001
    { machineId: fw001Id, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(40), lastCompletedHours: 4780, dueDate: dateStrDaysFromNow(20), dueHours: 5280 },
    // [8] FW-001
    { machineId: fw001Id, serviceType: 'Full Service', intervalDays: 90, intervalHours: 1000, lastCompletedDate: dateStrDaysAgo(30), lastCompletedHours: 4700, dueDate: dateStrDaysFromNow(60), dueHours: 5700 },

    // [9] FW-002 (3200hrs)
    { machineId: fw002Id, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(20), lastCompletedHours: 3080, dueDate: dateStrDaysFromNow(10), dueHours: 3330 },
    // [10] FW-002
    { machineId: fw002Id, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(50), lastCompletedHours: 2980, dueDate: dateStrDaysFromNow(10), dueHours: 3480 },

    // [11] FW-003 (4600hrs)
    { machineId: fw003Id, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(18), lastCompletedHours: 4470, dueDate: dateStrDaysFromNow(12), dueHours: 4720 },
    // [12] FW-003
    { machineId: fw003Id, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(42), lastCompletedHours: 4250, dueDate: dateStrDaysFromNow(18), dueHours: 4750 },
    // [13] FW-003
    { machineId: fw003Id, serviceType: 'Full Service', intervalDays: 90, intervalHours: 1000, lastCompletedDate: dateStrDaysAgo(65), lastCompletedHours: 4100, dueDate: dateStrDaysFromNow(25), dueHours: 5100 },

    // [14] SK-001 (6200hrs) — due soon
    { machineId: sk001Id, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(27), lastCompletedHours: 6050, dueDate: dateStrDaysFromNow(3), dueHours: 6300 },
    // [15] SK-001
    { machineId: sk001Id, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(56), lastCompletedHours: 5900, dueDate: dateStrDaysFromNow(4), dueHours: 6400 },

    // [16] SK-002 (2800hrs)
    { machineId: sk002Id, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(15), lastCompletedHours: 2700, dueDate: dateStrDaysFromNow(15), dueHours: 2950 },
    // [17] SK-002
    { machineId: sk002Id, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(30), lastCompletedHours: 2600, dueDate: dateStrDaysFromNow(30), dueHours: 3100 },

    // [18] EX-001 (4800hrs)
    { machineId: ex001Id, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(25), lastCompletedHours: 4650, dueDate: dateStrDaysFromNow(5), dueHours: 4900 },
    // [19] EX-001
    { machineId: ex001Id, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(48), lastCompletedHours: 4550, dueDate: dateStrDaysFromNow(12), dueHours: 5050 },
    // [20] EX-001
    { machineId: ex001Id, serviceType: 'Full Service', intervalDays: 90, intervalHours: 1000, lastCompletedDate: dateStrDaysAgo(70), lastCompletedHours: 4400, dueDate: dateStrDaysFromNow(20), dueHours: 5400 },

    // [21] EX-002 (3500hrs) — overdue (machine is down)
    { machineId: ex002Id, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(40), lastCompletedHours: 3380, dueDate: dateStrDaysAgo(10), dueHours: 3630 },
    // [22] EX-002
    { machineId: ex002Id, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(65), lastCompletedHours: 3200, dueDate: dateStrDaysAgo(5), dueHours: 3700 },

    // [23] LD-001 (5500hrs)
    { machineId: ld001Id, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(24), lastCompletedHours: 5350, dueDate: dateStrDaysFromNow(6), dueHours: 5600 },
    // [24] LD-001
    { machineId: ld001Id, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(52), lastCompletedHours: 5150, dueDate: dateStrDaysFromNow(8), dueHours: 5650 },

    // [25] LD-002 (4100hrs)
    { machineId: ld002Id, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(14), lastCompletedHours: 3990, dueDate: dateStrDaysFromNow(16), dueHours: 4240 },
    // [26] LD-002
    { machineId: ld002Id, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(44), lastCompletedHours: 3800, dueDate: dateStrDaysFromNow(16), dueHours: 4300 },

    // [27] DZ-001 (7200hrs) — under maintenance, full service just done
    { machineId: dz001Id, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(7), lastCompletedHours: 7183, dueDate: dateStrDaysFromNow(23), dueHours: 7433 },
    // [28] DZ-001
    { machineId: dz001Id, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(7), lastCompletedHours: 7183, dueDate: dateStrDaysFromNow(53), dueHours: 7683 },
    // [29] DZ-001
    { machineId: dz001Id, serviceType: 'Full Service', intervalDays: 90, intervalHours: 1000, lastCompletedDate: dateStrDaysAgo(7), lastCompletedHours: 7183, dueDate: dateStrDaysFromNow(83), dueHours: 8183 },

    // [30] TK-001 (3400hrs)
    { machineId: tk001Id, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(20), lastCompletedHours: 3250, dueDate: dateStrDaysFromNow(10), dueHours: 3500 },
    // [31] TK-001
    { machineId: tk001Id, serviceType: 'Full Service', intervalDays: 90, intervalHours: 1000, lastCompletedDate: dateStrDaysAgo(85), lastCompletedHours: 3000, dueDate: dateStrDaysFromNow(5), dueHours: 4000 },

    // [32] TK-002 (2900hrs)
    { machineId: tk002Id, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(15), lastCompletedHours: 2780, dueDate: dateStrDaysFromNow(15), dueHours: 3030 },
    // [33] TK-002
    { machineId: tk002Id, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(55), lastCompletedHours: 2600, dueDate: dateStrDaysFromNow(5), dueHours: 3100 },

    // [34] TK-003 (4500hrs)
    { machineId: tk003Id, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(10), lastCompletedHours: 4380, dueDate: dateStrDaysFromNow(20), dueHours: 4630 },

    // [35] GN-001 (1200hrs) — due soon
    { machineId: gn001Id, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(26), lastCompletedHours: 1080, dueDate: dateStrDaysFromNow(4), dueHours: 1330 },
    // [36] GN-001
    { machineId: gn001Id, serviceType: 'Full Service', intervalDays: 90, intervalHours: 1000, lastCompletedDate: dateStrDaysAgo(88), lastCompletedHours: 900, dueDate: dateStrDaysFromNow(2), dueHours: 1900 },

    // [37] CS-001 (800hrs) — overdue
    { machineId: cs001Id, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(35), lastCompletedHours: 640, dueDate: dateStrDaysAgo(5), dueHours: 890 },

    // [38] CS-002 (600hrs)
    { machineId: cs002Id, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(18), lastCompletedHours: 510, dueDate: dateStrDaysFromNow(12), dueHours: 760 },
  ];

  for (let i = 0; i < schedules.length; i++) {
    await batchSet('maintenanceSchedules', i + 1, { ...schedules[i], isActive: true });
  }

  // -----------------------------------------------------------------------
  // MAINTENANCE EVENTS — 10 recent completions
  // Schedule references use 1-based IDs: index+1
  // -----------------------------------------------------------------------
  // HV-001 hydraulic filter (schedule index 1 → id 2)
  await batchSet('maintenanceEvents', 1, { scheduleId: 2, machineId: hv001Id, completedBy: siphoId, completedAt: daysAgo(45), meterReading: 3950, notes: 'Hydraulic filter replaced. System flushed and refilled with Mobil DTE 25 fluid.', serviceType: 'Hydraulic Filter' });
  // HV-002 full service (schedule index 5 → id 6)
  await batchSet('maintenanceEvents', 2, { scheduleId: 6, machineId: hv002Id, completedBy: thaboId, completedAt: daysAgo(80), meterReading: 3400, notes: '1000-hour major service completed. All filters, belts and wear items replaced.', serviceType: 'Full Service' });
  // FW-001 oil change (schedule index 6 → id 7)
  await batchSet('maintenanceEvents', 3, { scheduleId: 7, machineId: fw001Id, completedBy: siphoId, completedAt: daysAgo(35), meterReading: 4920, notes: 'Engine oil and filter changed. Used Shell Rimula R4X 15W-40.', serviceType: 'Engine Oil Change' });
  // DZ-001 oil change (schedule index 27 → id 28)
  await batchSet('maintenanceEvents', 4, { scheduleId: 28, machineId: dz001Id, completedBy: siphoId, completedAt: daysAgo(7), meterReading: 7183, notes: 'Engine oil change completed as part of 1000-hour major service.', serviceType: 'Engine Oil Change' });
  // DZ-001 hydraulic filter (schedule index 28 → id 29)
  await batchSet('maintenanceEvents', 5, { scheduleId: 29, machineId: dz001Id, completedBy: siphoId, completedAt: daysAgo(7), meterReading: 7183, notes: 'Hydraulic filter replaced. Charge filter and return filter both replaced.', serviceType: 'Hydraulic Filter' });
  // DZ-001 full service (schedule index 29 → id 30)
  await batchSet('maintenanceEvents', 6, { scheduleId: 30, machineId: dz001Id, completedBy: siphoId, completedAt: daysAgo(7), meterReading: 7183, notes: '1000-hour full service. All fluids, filters, track tension and pivot pins inspected and serviced.', serviceType: 'Full Service' });
  // TK-001 oil change (schedule index 30 → id 31)
  await batchSet('maintenanceEvents', 7, { scheduleId: 31, machineId: tk001Id, completedBy: thaboId, completedAt: daysAgo(20), meterReading: 3250, notes: 'Engine oil and filter changed. Cab filters also replaced.', serviceType: 'Engine Oil Change' });
  // LD-002 oil change (schedule index 25 → id 26)
  await batchSet('maintenanceEvents', 8, { scheduleId: 26, machineId: ld002Id, completedBy: thaboId, completedAt: daysAgo(14), meterReading: 3990, notes: '250-hour oil service. Engine oil, filter and air cleaner replaced.', serviceType: 'Engine Oil Change' });
  // SK-001 hydraulic filter (schedule index 15 → id 16)
  await batchSet('maintenanceEvents', 9, { scheduleId: 16, machineId: sk001Id, completedBy: siphoId, completedAt: daysAgo(56), meterReading: 5900, notes: 'Hydraulic return filter and breather replaced.', serviceType: 'Hydraulic Filter' });
  // EX-001 full service (schedule index 20 → id 21)
  await batchSet('maintenanceEvents', 10, { scheduleId: 21, machineId: ex001Id, completedBy: siphoId, completedAt: daysAgo(70), meterReading: 4400, notes: 'Full 1000-hour service. Swing bearing greased, boom and stick pin clearances checked.', serviceType: 'Full Service' });

  // -----------------------------------------------------------------------
  // SERVICE ORDERS
  // -----------------------------------------------------------------------
  await batchSet('serviceOrders', 1, { machineId: dz001Id, defectId: null, siteId: site1Id, workshopName: 'Sandakan Heavy Equipment Services', dateSent: dateStrDaysAgo(5), expectedReturnDate: dateStrDaysFromNow(3), dateReturned: null, status: 'in-service', notes: 'Full undercarriage rebuild and track replacement.', repairSummary: '', cost: null, createdAt: daysAgo(5), completedAt: null });
  await batchSet('serviceOrders', 2, { machineId: tk002Id, defectId: null, siteId: site2Id, workshopName: 'KK Diesel & Hydraulics', dateSent: dateStrDaysAgo(12), expectedReturnDate: dateStrDaysAgo(2), dateReturned: dateStrDaysAgo(1), status: 'returned', notes: 'Hydraulic pump seal replacement.', repairSummary: 'Replaced main hydraulic pump seals and flushed system. All pressure tests passed.', cost: 4500, createdAt: daysAgo(12), completedAt: null });

  // Flush remaining batch operations
  await flushBatch();

  // -----------------------------------------------------------------------
  // COUNTERS — so future auto-increment IDs start at the right number
  // -----------------------------------------------------------------------
  const totalInspectionItems = nextItemId - 1;
  await setDoc(doc(firestore, 'meta', 'counters'), {
    sites: 3,
    users: 7,
    machines: 18,
    inspectionTemplates: 9,
    inspections: 30,
    inspectionItems: totalInspectionItems,
    defects: 12,
    downtimeEvents: 15,
    maintenanceSchedules: schedules.length,
    maintenanceEvents: 10,
    serviceOrders: 2,
  });

  // -----------------------------------------------------------------------
  // META — mark database as seeded
  // -----------------------------------------------------------------------
  await setDoc(doc(firestore, 'meta', 'seeded'), { value: 'true' });
}

// ---------------------------------------------------------------------------
// Migrations — run AFTER seed check to patch existing databases
// ---------------------------------------------------------------------------
export async function runMigrations(): Promise<void> {
  // Migration 1: Add boss user if missing
  const bossDoc = await getDoc(doc(firestore, 'users', '7'));
  if (!bossDoc.exists()) {
    await setDoc(doc(firestore, 'users', '7'), {
      id: 7,
      pin: '888888',
      name: "Dato' Chai",
      role: 'boss',
      siteId: 1,
    });
  }
}
