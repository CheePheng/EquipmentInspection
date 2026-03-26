import { db } from './database';

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
// Seed entry point
// ---------------------------------------------------------------------------
export async function seedDatabase(): Promise<void> {
  const existing = await db.meta.get('seeded');
  if (existing) return;

  await db.transaction(
    'rw',
    [
      db.sites,
      db.users,
      db.machines,
      db.inspectionTemplates,
      db.inspections,
      db.inspectionItems,
      db.defects,
      db.maintenanceSchedules,
      db.maintenanceEvents,
      db.downtimeEvents,
      db.statusHistory,
      db.meta,
    ],
    async () => {
      // -----------------------------------------------------------------------
      // SITES
      // -----------------------------------------------------------------------
      const site1Id = await db.sites.add({
        name: 'Compartment 14 - Pine Plantation',
        location: 'Mpumalanga, South Africa',
        isActive: true,
      });
      const site2Id = await db.sites.add({
        name: 'Block 7 - Eucalyptus',
        location: 'KwaZulu-Natal, South Africa',
        isActive: true,
      });
      const site3Id = await db.sites.add({
        name: 'Mill Yard Operations',
        location: 'Richards Bay, South Africa',
        isActive: true,
      });

      // -----------------------------------------------------------------------
      // USERS
      // Workers: 1-Johan, 2-Sipho, 3-Maria, 4-Thabo, 5-Willem, 6-David
      // Supervisors: 7-Pieter, 8-Sarah
      // -----------------------------------------------------------------------
      const johanId = await db.users.add({ pin: '1111', name: 'Johan van der Merwe', role: 'worker', siteId: site1Id as number });
      const siphoId = await db.users.add({ pin: '1112', name: 'Sipho Nkosi', role: 'worker', siteId: site1Id as number });
      const mariaId = await db.users.add({ pin: '1113', name: 'Maria Dlamini', role: 'worker', siteId: site2Id as number });
      const thaboId = await db.users.add({ pin: '1114', name: 'Thabo Mokoena', role: 'worker', siteId: site2Id as number });
      const willemId = await db.users.add({ pin: '2222', name: 'Willem Botha', role: 'worker', siteId: site1Id as number });
      const davidId = await db.users.add({ pin: '2223', name: 'David Sithole', role: 'worker', siteId: site2Id as number });
      await db.users.add({ pin: '3333', name: 'Pieter Joubert', role: 'supervisor', siteId: site1Id as number });
      await db.users.add({ pin: '3334', name: 'Sarah Mthembu', role: 'supervisor', siteId: site2Id as number });

      // -----------------------------------------------------------------------
      // MACHINES  (18 total)
      // -----------------------------------------------------------------------
      // Harvesters
      const hv001Id = await db.machines.add({
        code: 'HV-001', name: 'Ponsse Scorpion', type: 'harvester',
        siteId: site1Id as number, status: 'active', availabilityState: 'available',
        currentMeterHours: 4200, assignedOperatorId: johanId as number,
      });
      const hv002Id = await db.machines.add({
        code: 'HV-002', name: 'John Deere 1270G', type: 'harvester',
        siteId: site2Id as number, status: 'active', availabilityState: 'available',
        currentMeterHours: 3800, assignedOperatorId: mariaId as number,
      });

      // Forwarders
      const fw001Id = await db.machines.add({
        code: 'FW-001', name: 'Ponsse Elephant', type: 'forwarder',
        siteId: site1Id as number, status: 'active', availabilityState: 'available',
        currentMeterHours: 5100, assignedOperatorId: siphoId as number,
      });
      const fw002Id = await db.machines.add({
        code: 'FW-002', name: 'Komatsu 875', type: 'forwarder',
        siteId: site1Id as number, status: 'active', availabilityState: 'available',
        currentMeterHours: 3200, assignedOperatorId: null,
      });
      const fw003Id = await db.machines.add({
        code: 'FW-003', name: 'John Deere 1510G', type: 'forwarder',
        siteId: site2Id as number, status: 'active', availabilityState: 'available',
        currentMeterHours: 4600, assignedOperatorId: thaboId as number,
      });

      // Skidders
      const sk001Id = await db.machines.add({
        code: 'SK-001', name: 'Cat 535D', type: 'skidder',
        siteId: site1Id as number, status: 'active', availabilityState: 'needs-repair',
        currentMeterHours: 6200, assignedOperatorId: null,
      });
      const sk002Id = await db.machines.add({
        code: 'SK-002', name: 'Tigercat 632E', type: 'skidder',
        siteId: site2Id as number, status: 'active', availabilityState: 'available',
        currentMeterHours: 2800, assignedOperatorId: null,
      });

      // Excavators
      const ex001Id = await db.machines.add({
        code: 'EX-001', name: 'Cat 320', type: 'excavator',
        siteId: site1Id as number, status: 'active', availabilityState: 'available',
        currentMeterHours: 4800, assignedOperatorId: null,
      });
      const ex002Id = await db.machines.add({
        code: 'EX-002', name: 'Komatsu PC200', type: 'excavator',
        siteId: site2Id as number, status: 'active', availabilityState: 'down',
        currentMeterHours: 3500, assignedOperatorId: null,
      });

      // Loaders
      const ld001Id = await db.machines.add({
        code: 'LD-001', name: 'Cat 950M', type: 'loader',
        siteId: site1Id as number, status: 'active', availabilityState: 'available',
        currentMeterHours: 5500, assignedOperatorId: null,
      });
      const ld002Id = await db.machines.add({
        code: 'LD-002', name: 'Volvo L120H', type: 'loader',
        siteId: site3Id as number, status: 'active', availabilityState: 'available',
        currentMeterHours: 4100, assignedOperatorId: null,
      });

      // Dozer
      const dz001Id = await db.machines.add({
        code: 'DZ-001', name: 'Cat D6T', type: 'dozer',
        siteId: site1Id as number, status: 'active', availabilityState: 'under-maintenance',
        currentMeterHours: 7200, assignedOperatorId: null,
      });

      // Trucks
      const tk001Id = await db.machines.add({
        code: 'TK-001', name: 'Scania R500', type: 'truck',
        siteId: site3Id as number, status: 'active', availabilityState: 'available',
        currentMeterHours: 3400, assignedOperatorId: null,
      });
      const tk002Id = await db.machines.add({
        code: 'TK-002', name: 'Volvo FH16', type: 'truck',
        siteId: site3Id as number, status: 'active', availabilityState: 'available',
        currentMeterHours: 2900, assignedOperatorId: null,
      });
      const tk003Id = await db.machines.add({
        code: 'TK-003', name: 'MAN TGS', type: 'truck',
        siteId: site2Id as number, status: 'active', availabilityState: 'available',
        currentMeterHours: 4500, assignedOperatorId: null,
      });

      // Generator
      const gn001Id = await db.machines.add({
        code: 'GN-001', name: 'Atlas Copco QAS 150', type: 'generator',
        siteId: site1Id as number, status: 'active', availabilityState: 'available',
        currentMeterHours: 1200, assignedOperatorId: null,
      });

      // Chainsaw / Small Equipment
      const cs001Id = await db.machines.add({
        code: 'CS-001', name: 'Stihl MS 881', type: 'chainsaw-small-equipment',
        siteId: site1Id as number, status: 'active', availabilityState: 'available',
        currentMeterHours: 800, assignedOperatorId: null,
      });
      const cs002Id = await db.machines.add({
        code: 'CS-002', name: 'Husqvarna 572XP', type: 'chainsaw-small-equipment',
        siteId: site2Id as number, status: 'active', availabilityState: 'available',
        currentMeterHours: 600, assignedOperatorId: null,
      });

      // -----------------------------------------------------------------------
      // INSPECTION TEMPLATES (9 — one per machine type)
      // -----------------------------------------------------------------------
      const tplHarvesterId = await db.inspectionTemplates.add({
        machineType: 'harvester',
        name: 'Harvester Daily Pre-Shift Inspection',
        isActive: true,
        items: [
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
        ],
      });

      const tplForwarderId = await db.inspectionTemplates.add({
        machineType: 'forwarder',
        name: 'Forwarder Daily Pre-Shift Inspection',
        isActive: true,
        items: [
          { id: crypto.randomUUID(), label: 'Engine oil level', category: 'engine', required: true, order: 1 },
          { id: crypto.randomUUID(), label: 'Hydraulic system — fluid level and hoses', category: 'hydraulic', required: true, order: 2 },
          { id: crypto.randomUUID(), label: 'Crane function and slew bearing', category: 'structural', required: true, order: 3 },
          { id: crypto.randomUUID(), label: 'Bunk stakes — secure and undamaged', category: 'structural', required: true, order: 4 },
          { id: crypto.randomUUID(), label: 'Tire pressure and condition', category: 'tires-tracks', required: true, order: 5 },
          { id: crypto.randomUUID(), label: 'Head and tail lights operational', category: 'lights-signals', required: true, order: 6 },
          { id: crypto.randomUUID(), label: 'Brakes — park and service', category: 'safety', required: true, order: 7 },
          { id: crypto.randomUUID(), label: 'Cab condition and seat belt', category: 'cab-controls', required: true, order: 8 },
          { id: crypto.randomUUID(), label: 'Coolant level', category: 'engine', required: true, order: 9 },
        ],
      });

      const tplSkidderId = await db.inspectionTemplates.add({
        machineType: 'skidder',
        name: 'Skidder Daily Pre-Shift Inspection',
        isActive: true,
        items: [
          { id: crypto.randomUUID(), label: 'Engine oil level and condition', category: 'engine', required: true, order: 1 },
          { id: crypto.randomUUID(), label: 'Hydraulic fluid level and hoses', category: 'hydraulic', required: true, order: 2 },
          { id: crypto.randomUUID(), label: 'Winch cable — no kinks, fraying or twists', category: 'structural', required: true, order: 3 },
          { id: crypto.randomUUID(), label: 'Blade condition and mounting', category: 'structural', required: true, order: 4 },
          { id: crypto.randomUUID(), label: 'Tire / track condition and pressure', category: 'tires-tracks', required: true, order: 5 },
          { id: crypto.randomUUID(), label: 'Lights operational', category: 'lights-signals', required: true, order: 6 },
          { id: crypto.randomUUID(), label: 'Rollover protection structure (ROPS)', category: 'safety', required: true, order: 7 },
          { id: crypto.randomUUID(), label: 'Steering response and articulation', category: 'cab-controls', required: true, order: 8 },
        ],
      });

      const tplExcavatorId = await db.inspectionTemplates.add({
        machineType: 'excavator',
        name: 'Excavator Daily Pre-Shift Inspection',
        isActive: true,
        items: [
          { id: crypto.randomUUID(), label: 'Engine oil level', category: 'engine', required: true, order: 1 },
          { id: crypto.randomUUID(), label: 'Hydraulic fluid level and hose integrity', category: 'hydraulic', required: true, order: 2 },
          { id: crypto.randomUUID(), label: 'Bucket teeth — wear and attachment pins', category: 'structural', required: true, order: 3 },
          { id: crypto.randomUUID(), label: 'Track tension and pad condition', category: 'tires-tracks', required: true, order: 4 },
          { id: crypto.randomUUID(), label: 'Cab glass — no cracks or obstructions', category: 'cab-controls', required: true, order: 5 },
          { id: crypto.randomUUID(), label: 'Lights and warning devices', category: 'lights-signals', required: true, order: 6 },
          { id: crypto.randomUUID(), label: 'Swing bearing — play and lubrication', category: 'structural', required: true, order: 7 },
          { id: crypto.randomUUID(), label: 'Boom and stick cylinder seals', category: 'hydraulic', required: true, order: 8 },
          { id: crypto.randomUUID(), label: 'Fire suppression system', category: 'safety', required: true, order: 9 },
        ],
      });

      const tplLoaderId = await db.inspectionTemplates.add({
        machineType: 'loader',
        name: 'Loader Daily Pre-Shift Inspection',
        isActive: true,
        items: [
          { id: crypto.randomUUID(), label: 'Engine oil level', category: 'engine', required: true, order: 1 },
          { id: crypto.randomUUID(), label: 'Hydraulic fluid level and hoses', category: 'hydraulic', required: true, order: 2 },
          { id: crypto.randomUUID(), label: 'Bucket and cutting edge condition', category: 'structural', required: true, order: 3 },
          { id: crypto.randomUUID(), label: 'Tire pressure and sidewall condition', category: 'tires-tracks', required: true, order: 4 },
          { id: crypto.randomUUID(), label: 'All lights and beacon', category: 'lights-signals', required: true, order: 5 },
          { id: crypto.randomUUID(), label: 'Brakes — park and service', category: 'safety', required: true, order: 6 },
          { id: crypto.randomUUID(), label: 'Steering function and lock-to-lock', category: 'cab-controls', required: true, order: 7 },
          { id: crypto.randomUUID(), label: 'Cab condition and ROPS integrity', category: 'safety', required: true, order: 8 },
        ],
      });

      const tplDozerId = await db.inspectionTemplates.add({
        machineType: 'dozer',
        name: 'Dozer Daily Pre-Shift Inspection',
        isActive: true,
        items: [
          { id: crypto.randomUUID(), label: 'Engine oil level and condition', category: 'engine', required: true, order: 1 },
          { id: crypto.randomUUID(), label: 'Hydraulic fluid level', category: 'hydraulic', required: true, order: 2 },
          { id: crypto.randomUUID(), label: 'Blade condition and lift cylinders', category: 'structural', required: true, order: 3 },
          { id: crypto.randomUUID(), label: 'Track tension, rollers and sprockets', category: 'tires-tracks', required: true, order: 4 },
          { id: crypto.randomUUID(), label: 'Lights — head, work and tail', category: 'lights-signals', required: true, order: 5 },
          { id: crypto.randomUUID(), label: 'Steering clutches and brakes', category: 'cab-controls', required: true, order: 6 },
          { id: crypto.randomUUID(), label: 'ROPS integrity — no cracks or repairs', category: 'safety', required: true, order: 7 },
          { id: crypto.randomUUID(), label: 'Ripper condition and shank pins', category: 'structural', required: true, order: 8 },
        ],
      });

      const tplTruckId = await db.inspectionTemplates.add({
        machineType: 'truck',
        name: 'Timber Truck Daily Pre-Trip Inspection',
        isActive: true,
        items: [
          { id: crypto.randomUUID(), label: 'Engine oil level', category: 'engine', required: true, order: 1 },
          { id: crypto.randomUUID(), label: 'Brakes — park, service and trailer', category: 'safety', required: true, order: 2 },
          { id: crypto.randomUUID(), label: 'Tire condition and pressure — all axles', category: 'tires-tracks', required: true, order: 3 },
          { id: crypto.randomUUID(), label: 'Lights — head, tail, indicator, brake', category: 'lights-signals', required: true, order: 4 },
          { id: crypto.randomUUID(), label: 'Load body and stanchion condition', category: 'structural', required: true, order: 5 },
          { id: crypto.randomUUID(), label: 'Mirrors — all adjusted and undamaged', category: 'cab-controls', required: true, order: 6 },
          { id: crypto.randomUUID(), label: 'Steering play and function', category: 'cab-controls', required: true, order: 7 },
          { id: crypto.randomUUID(), label: 'Suspension — no visible damage or sag', category: 'structural', required: true, order: 8 },
          { id: crypto.randomUUID(), label: 'Coolant level', category: 'engine', required: true, order: 9 },
        ],
      });

      const tplGeneratorId = await db.inspectionTemplates.add({
        machineType: 'generator',
        name: 'Generator Pre-Start Inspection',
        isActive: true,
        items: [
          { id: crypto.randomUUID(), label: 'Engine oil level', category: 'engine', required: true, order: 1 },
          { id: crypto.randomUUID(), label: 'Fuel level and fuel line integrity', category: 'fluid-leaks', required: true, order: 2 },
          { id: crypto.randomUUID(), label: 'Coolant level', category: 'engine', required: true, order: 3 },
          { id: crypto.randomUUID(), label: 'Output voltage and frequency check', category: 'electrical', required: true, order: 4 },
          { id: crypto.randomUUID(), label: 'Circuit breakers — all in correct position', category: 'electrical', required: true, order: 5 },
          { id: crypto.randomUUID(), label: 'Enclosure — secure and ventilation clear', category: 'structural', required: true, order: 6 },
          { id: crypto.randomUUID(), label: 'Emergency stop button test', category: 'safety', required: true, order: 7 },
          { id: crypto.randomUUID(), label: 'Fuel lines — no leaks', category: 'fluid-leaks', required: true, order: 8 },
        ],
      });

      const tplChainsawId = await db.inspectionTemplates.add({
        machineType: 'chainsaw-small-equipment',
        name: 'Chainsaw / Small Equipment Pre-Use Inspection',
        isActive: true,
        items: [
          { id: crypto.randomUUID(), label: 'Chain tension — correct and secure', category: 'structural', required: true, order: 1 },
          { id: crypto.randomUUID(), label: 'Bar condition — no cracks or bends', category: 'structural', required: true, order: 2 },
          { id: crypto.randomUUID(), label: 'Chain safety brake function', category: 'safety', required: true, order: 3 },
          { id: crypto.randomUUID(), label: 'Air filter — clean and correctly fitted', category: 'engine', required: true, order: 4 },
          { id: crypto.randomUUID(), label: 'Fuel mix ratio correct', category: 'engine', required: true, order: 5 },
          { id: crypto.randomUUID(), label: 'Handle grip — no cracks or looseness', category: 'structural', required: true, order: 6 },
          { id: crypto.randomUUID(), label: 'Chain sharpness adequate', category: 'structural', required: true, order: 7 },
        ],
      });

      // -----------------------------------------------------------------------
      // INSPECTIONS — ~30 over past 14 days
      // We create inspections with pre-known IDs so we can cross-reference
      // inspection items and defects.
      // -----------------------------------------------------------------------
      // Helper to add items for an inspection against a template
      async function addItems(
        inspectionId: number,
        templateId: number,
        failIndices: number[] = [],
        naIndices: number[] = [],
      ): Promise<void> {
        const tpl = await db.inspectionTemplates.get(templateId);
        if (!tpl) return;
        for (let i = 0; i < tpl.items.length; i++) {
          const item = tpl.items[i];
          let result: 'pass' | 'fail' | 'na' = 'pass';
          if (failIndices.includes(i)) result = 'fail';
          else if (naIndices.includes(i)) result = 'na';
          await db.inspectionItems.add({
            inspectionId,
            templateItemId: item.id,
            result,
            notes: result === 'fail' ? 'Requires attention — noted during inspection.' : '',
          });
        }
      }

      // ---- Day 14 ago ----
      const insp1Id = await db.inspections.add({
        machineId: hv001Id as number, operatorId: johanId as number,
        date: dateStrDaysAgo(14), meterReading: 4175, status: 'completed',
        completedAt: daysAgo(14), siteId: site1Id as number,
      });
      await addItems(insp1Id as number, tplHarvesterId as number, [], [8]);

      const insp2Id = await db.inspections.add({
        machineId: fw001Id as number, operatorId: siphoId as number,
        date: dateStrDaysAgo(14), meterReading: 5075, status: 'completed',
        completedAt: daysAgo(14), siteId: site1Id as number,
      });
      await addItems(insp2Id as number, tplForwarderId as number, [1]);

      // ---- Day 13 ago ----
      const insp3Id = await db.inspections.add({
        machineId: hv002Id as number, operatorId: mariaId as number,
        date: dateStrDaysAgo(13), meterReading: 3768, status: 'completed',
        completedAt: daysAgo(13), siteId: site2Id as number,
      });
      await addItems(insp3Id as number, tplHarvesterId as number, [], []);

      const insp4Id = await db.inspections.add({
        machineId: sk001Id as number, operatorId: johanId as number,
        date: dateStrDaysAgo(13), meterReading: 6178, status: 'completed',
        completedAt: daysAgo(13), siteId: site1Id as number,
      });
      await addItems(insp4Id as number, tplSkidderId as number, [1, 2]);

      // ---- Day 12 ago ----
      const insp5Id = await db.inspections.add({
        machineId: fw002Id as number, operatorId: siphoId as number,
        date: dateStrDaysAgo(12), meterReading: 3180, status: 'completed',
        completedAt: daysAgo(12), siteId: site1Id as number,
      });
      await addItems(insp5Id as number, tplForwarderId as number, [], [7]);

      const insp6Id = await db.inspections.add({
        machineId: ex001Id as number, operatorId: johanId as number,
        date: dateStrDaysAgo(12), meterReading: 4778, status: 'completed',
        completedAt: daysAgo(12), siteId: site1Id as number,
      });
      await addItems(insp6Id as number, tplExcavatorId as number, [], []);

      // ---- Day 11 ago ----
      const insp7Id = await db.inspections.add({
        machineId: tk001Id as number, operatorId: siphoId as number,
        date: dateStrDaysAgo(11), meterReading: 3382, status: 'completed',
        completedAt: daysAgo(11), siteId: site3Id as number,
      });
      await addItems(insp7Id as number, tplTruckId as number, [2]);

      const insp8Id = await db.inspections.add({
        machineId: fw003Id as number, operatorId: thaboId as number,
        date: dateStrDaysAgo(11), meterReading: 4573, status: 'completed',
        completedAt: daysAgo(11), siteId: site2Id as number,
      });
      await addItems(insp8Id as number, tplForwarderId as number, [], []);

      // ---- Day 10 ago ----
      const insp9Id = await db.inspections.add({
        machineId: ld001Id as number, operatorId: johanId as number,
        date: dateStrDaysAgo(10), meterReading: 5475, status: 'completed',
        completedAt: daysAgo(10), siteId: site1Id as number,
      });
      await addItems(insp9Id as number, tplLoaderId as number, [3]);

      const insp10Id = await db.inspections.add({
        machineId: sk002Id as number, operatorId: thaboId as number,
        date: dateStrDaysAgo(10), meterReading: 2778, status: 'completed',
        completedAt: daysAgo(10), siteId: site2Id as number,
      });
      await addItems(insp10Id as number, tplSkidderId as number, [], []);

      // ---- Day 9 ago ----
      const insp11Id = await db.inspections.add({
        machineId: ex002Id as number, operatorId: thaboId as number,
        date: dateStrDaysAgo(9), meterReading: 3486, status: 'completed',
        completedAt: daysAgo(9), siteId: site2Id as number,
      });
      await addItems(insp11Id as number, tplExcavatorId as number, [0, 1], []);

      const insp12Id = await db.inspections.add({
        machineId: gn001Id as number, operatorId: willemId as number,
        date: dateStrDaysAgo(9), meterReading: 1188, status: 'completed',
        completedAt: daysAgo(9), siteId: site1Id as number,
      });
      await addItems(insp12Id as number, tplGeneratorId as number, [], []);

      // ---- Day 8 ago ----
      const insp13Id = await db.inspections.add({
        machineId: hv001Id as number, operatorId: johanId as number,
        date: dateStrDaysAgo(8), meterReading: 4188, status: 'completed',
        completedAt: daysAgo(8), siteId: site1Id as number,
      });
      await addItems(insp13Id as number, tplHarvesterId as number, [], []);

      const insp14Id = await db.inspections.add({
        machineId: cs001Id as number, operatorId: siphoId as number,
        date: dateStrDaysAgo(8), meterReading: 793, status: 'completed',
        completedAt: daysAgo(8), siteId: site1Id as number,
      });
      await addItems(insp14Id as number, tplChainsawId as number, [0]);

      // ---- Day 7 ago ----
      const insp15Id = await db.inspections.add({
        machineId: dz001Id as number, operatorId: johanId as number,
        date: dateStrDaysAgo(7), meterReading: 7183, status: 'completed',
        completedAt: daysAgo(7), siteId: site1Id as number,
      });
      await addItems(insp15Id as number, tplDozerId as number, [0, 3]);

      const insp16Id = await db.inspections.add({
        machineId: tk002Id as number, operatorId: siphoId as number,
        date: dateStrDaysAgo(7), meterReading: 2887, status: 'completed',
        completedAt: daysAgo(7), siteId: site3Id as number,
      });
      await addItems(insp16Id as number, tplTruckId as number, [], [5]);

      // ---- Day 6 ago ----
      const insp17Id = await db.inspections.add({
        machineId: hv002Id as number, operatorId: mariaId as number,
        date: dateStrDaysAgo(6), meterReading: 3783, status: 'completed',
        completedAt: daysAgo(6), siteId: site2Id as number,
      });
      await addItems(insp17Id as number, tplHarvesterId as number, [], []);

      const insp18Id = await db.inspections.add({
        machineId: fw001Id as number, operatorId: siphoId as number,
        date: dateStrDaysAgo(6), meterReading: 5088, status: 'completed',
        completedAt: daysAgo(6), siteId: site1Id as number,
      });
      await addItems(insp18Id as number, tplForwarderId as number, [], []);

      // ---- Day 5 ago ----
      const insp19Id = await db.inspections.add({
        machineId: ld002Id as number, operatorId: mariaId as number,
        date: dateStrDaysAgo(5), meterReading: 4086, status: 'completed',
        completedAt: daysAgo(5), siteId: site3Id as number,
      });
      await addItems(insp19Id as number, tplLoaderId as number, [1]);

      const insp20Id = await db.inspections.add({
        machineId: cs002Id as number, operatorId: thaboId as number,
        date: dateStrDaysAgo(5), meterReading: 594, status: 'completed',
        completedAt: daysAgo(5), siteId: site2Id as number,
      });
      await addItems(insp20Id as number, tplChainsawId as number, [], []);

      // ---- Day 4 ago ----
      const insp21Id = await db.inspections.add({
        machineId: sk001Id as number, operatorId: johanId as number,
        date: dateStrDaysAgo(4), meterReading: 6193, status: 'completed',
        completedAt: daysAgo(4), siteId: site1Id as number,
      });
      await addItems(insp21Id as number, tplSkidderId as number, [1], []);

      const insp22Id = await db.inspections.add({
        machineId: tk003Id as number, operatorId: thaboId as number,
        date: dateStrDaysAgo(4), meterReading: 4488, status: 'completed',
        completedAt: daysAgo(4), siteId: site2Id as number,
      });
      await addItems(insp22Id as number, tplTruckId as number, [], []);

      // ---- Day 3 ago ----
      const insp23Id = await db.inspections.add({
        machineId: hv001Id as number, operatorId: johanId as number,
        date: dateStrDaysAgo(3), meterReading: 4196, status: 'completed',
        completedAt: daysAgo(3), siteId: site1Id as number,
      });
      await addItems(insp23Id as number, tplHarvesterId as number, [], []);

      const insp24Id = await db.inspections.add({
        machineId: fw003Id as number, operatorId: thaboId as number,
        date: dateStrDaysAgo(3), meterReading: 4592, status: 'completed',
        completedAt: daysAgo(3), siteId: site2Id as number,
      });
      await addItems(insp24Id as number, tplForwarderId as number, [], [6]);

      // ---- Day 2 ago ----
      const insp25Id = await db.inspections.add({
        machineId: ex001Id as number, operatorId: johanId as number,
        date: dateStrDaysAgo(2), meterReading: 4796, status: 'completed',
        completedAt: daysAgo(2), siteId: site1Id as number,
      });
      await addItems(insp25Id as number, tplExcavatorId as number, [], []);

      const insp26Id = await db.inspections.add({
        machineId: gn001Id as number, operatorId: willemId as number,
        date: dateStrDaysAgo(2), meterReading: 1196, status: 'completed',
        completedAt: daysAgo(2), siteId: site1Id as number,
      });
      await addItems(insp26Id as number, tplGeneratorId as number, [3]);

      // ---- Day 1 ago ----
      const insp27Id = await db.inspections.add({
        machineId: hv002Id as number, operatorId: mariaId as number,
        date: dateStrDaysAgo(1), meterReading: 3796, status: 'submitted',
        completedAt: daysAgo(1), siteId: site2Id as number,
      });
      await addItems(insp27Id as number, tplHarvesterId as number, [], []);

      const insp28Id = await db.inspections.add({
        machineId: tk001Id as number, operatorId: siphoId as number,
        date: dateStrDaysAgo(1), meterReading: 3397, status: 'submitted',
        completedAt: daysAgo(1), siteId: site3Id as number,
      });
      await addItems(insp28Id as number, tplTruckId as number, [1]);

      const insp29Id = await db.inspections.add({
        machineId: ld001Id as number, operatorId: johanId as number,
        date: dateStrDaysAgo(1), meterReading: 5496, status: 'completed',
        completedAt: daysAgo(1), siteId: site1Id as number,
      });
      await addItems(insp29Id as number, tplLoaderId as number, [], []);

      const insp30Id = await db.inspections.add({
        machineId: cs001Id as number, operatorId: siphoId as number,
        date: dateStrDaysAgo(1), meterReading: 798, status: 'completed',
        completedAt: daysAgo(1), siteId: site1Id as number,
      });
      await addItems(insp30Id as number, tplChainsawId as number, [], []);

      // -----------------------------------------------------------------------
      // DEFECTS — 12 total
      // 2 critical (open), 3 high (mixed), 4 medium (mixed), 3 low (mostly fixed)
      // -----------------------------------------------------------------------

      // [D1] CRITICAL — EX-002 engine oil leak — open, not safe (from insp11)
      const def1Id = await db.defects.add({
        machineId: ex002Id as number, siteId: site2Id as number,
        inspectionId: insp11Id as number,
        category: 'engine', severity: 'critical', status: 'open',
        description: 'Severe engine oil leak detected — oil visible pooling under machine. Machine deemed unsafe to operate.',
        safeToOperate: false, priority: true,
        reportedBy: thaboId as number,
        createdAt: daysAgo(9), updatedAt: daysAgo(9),
      });

      // [D2] CRITICAL — SK-001 hydraulic hose burst — open, not safe (from insp4)
      const def2Id = await db.defects.add({
        machineId: sk001Id as number, siteId: site1Id as number,
        inspectionId: insp4Id as number,
        category: 'hydraulic', severity: 'critical', status: 'open',
        description: 'Hydraulic hose burst on winch circuit. Fluid spraying — fire and injury risk. Machine pulled from service.',
        safeToOperate: false, priority: true,
        reportedBy: johanId as number,
        createdAt: daysAgo(13), updatedAt: daysAgo(4),
      });

      // [D3] HIGH — FW-001 hydraulic leak — open (from insp2)
      const def3Id = await db.defects.add({
        machineId: fw001Id as number, siteId: site1Id as number,
        inspectionId: insp2Id as number,
        category: 'hydraulic', severity: 'high', status: 'open',
        description: 'Hydraulic fluid seeping from boom cylinder rod seal. Minor leak increasing over shift.',
        safeToOperate: true, priority: false,
        reportedBy: siphoId as number,
        createdAt: daysAgo(14), updatedAt: daysAgo(14),
      });

      // [D4] HIGH — DZ-001 engine oil low / consumption — in-progress (from insp15)
      const def4Id = await db.defects.add({
        machineId: dz001Id as number, siteId: site1Id as number,
        inspectionId: insp15Id as number,
        category: 'engine', severity: 'high', status: 'in-progress',
        description: 'Engine oil level below minimum on dipstick. Excessive consumption suspected. Machine scheduled for service.',
        safeToOperate: true, priority: false,
        reportedBy: johanId as number,
        createdAt: daysAgo(7), updatedAt: daysAgo(3),
      });
      void def4Id;

      // [D5] HIGH — TK-001 tire damage — fixed (from insp7)
      const def5Id = await db.defects.add({
        machineId: tk001Id as number, siteId: site3Id as number,
        inspectionId: insp7Id as number,
        category: 'tires-tracks', severity: 'high', status: 'fixed',
        description: 'Right rear steer axle tire showing deep sidewall cut — risk of blowout under load.',
        safeToOperate: false, priority: true,
        reportedBy: siphoId as number,
        createdAt: daysAgo(11), updatedAt: daysAgo(8),
      });

      // [D6] MEDIUM — LD-001 tire wear — open (from insp9)
      void await db.defects.add({
        machineId: ld001Id as number, siteId: site1Id as number,
        inspectionId: insp9Id as number,
        category: 'tires-tracks', severity: 'medium', status: 'open',
        description: 'Front left tire tread below 20% — approaching replacement threshold.',
        safeToOperate: true, priority: false,
        reportedBy: johanId as number,
        createdAt: daysAgo(10), updatedAt: daysAgo(10),
      });

      // [D7] MEDIUM — GN-001 voltage fluctuation — in-progress (from insp26)
      const def7Id = await db.defects.add({
        machineId: gn001Id as number, siteId: site1Id as number,
        inspectionId: insp26Id as number,
        category: 'electrical', severity: 'medium', status: 'in-progress',
        description: 'Output voltage fluctuating ±8V under load. AVR may require adjustment or replacement.',
        safeToOperate: true, priority: false,
        reportedBy: willemId as number,
        createdAt: daysAgo(2), updatedAt: daysAgo(1),
      });

      // [D8] MEDIUM — CS-001 chain tension loose — fixed (from insp14)
      const def8Id = await db.defects.add({
        machineId: cs001Id as number, siteId: site1Id as number,
        inspectionId: insp14Id as number,
        category: 'structural', severity: 'medium', status: 'fixed',
        description: 'Chain tension out of spec — excessive sag on bar. Chain adjusted and re-tensioned.',
        safeToOperate: false, priority: false,
        reportedBy: siphoId as number,
        createdAt: daysAgo(8), updatedAt: daysAgo(7),
      });

      // [D9] MEDIUM — LD-002 hydraulic leak — open (from insp19)
      const def9Id = await db.defects.add({
        machineId: ld002Id as number, siteId: site3Id as number,
        inspectionId: insp19Id as number,
        category: 'fluid-leaks', severity: 'medium', status: 'open',
        description: 'Small hydraulic fluid weep from tilt cylinder base seal. Requires monitoring.',
        safeToOperate: true, priority: false,
        reportedBy: mariaId as number,
        createdAt: daysAgo(5), updatedAt: daysAgo(5),
      });
      void def9Id;

      // [D10] LOW — FW-003 cab condition — fixed (from insp8)
      void await db.defects.add({
        machineId: fw003Id as number, siteId: site2Id as number,
        inspectionId: insp8Id as number,
        category: 'cab-controls', severity: 'low', status: 'fixed',
        description: 'Door seal worn on operator cab — minor noise intrusion and dust ingress.',
        safeToOperate: true, priority: false,
        reportedBy: thaboId as number,
        createdAt: daysAgo(11), updatedAt: daysAgo(5),
      });

      // [D11] LOW — TK-028 brake indicator light — fixed (from insp28)
      void await db.defects.add({
        machineId: tk001Id as number, siteId: site3Id as number,
        inspectionId: insp28Id as number,
        category: 'lights-signals', severity: 'low', status: 'fixed',
        description: 'Brake warning indicator lamp intermittent — confirmed bulb failure, not brake fault.',
        safeToOperate: true, priority: false,
        reportedBy: siphoId as number,
        createdAt: daysAgo(1), updatedAt: daysAgo(1),
      });

      // [D12] LOW — SK-001 structural — open (standalone, found during visual check)
      void await db.defects.add({
        machineId: sk001Id as number, siteId: site1Id as number,
        inspectionId: null,
        category: 'structural', severity: 'low', status: 'open',
        description: 'Minor surface crack on rear chassis cross-member. Monitoring required — not structurally critical.',
        safeToOperate: true, priority: false,
        reportedBy: willemId as number,
        createdAt: daysAgo(6), updatedAt: daysAgo(6),
      });

      // -----------------------------------------------------------------------
      // DOWNTIME EVENTS — 15 total (2 active, 13 completed)
      // -----------------------------------------------------------------------

      // [DT1] ACTIVE — EX-002 down (critical oil leak)
      const dt1Id = await db.downtimeEvents.add({
        machineId: ex002Id as number, defectId: def1Id as number,
        startTime: hoursAgo(48), endTime: null,
        reasonCode: 'mechanical', notes: 'Machine pulled from service — critical engine oil leak. Awaiting parts.',
        siteId: site2Id as number, loggedBy: thaboId as number,
      });
      void dt1Id;

      // [DT2] ACTIVE — SK-001 down (hydraulic hose)
      const dt2Id = await db.downtimeEvents.add({
        machineId: sk001Id as number, defectId: def2Id as number,
        startTime: hoursAgo(72), endTime: null,
        reasonCode: 'hydraulic', notes: 'Hydraulic hose failure on winch circuit. Machine isolated and tagged out.',
        siteId: site1Id as number, loggedBy: johanId as number,
      });
      void dt2Id;

      // [DT3] Completed — DZ-001 scheduled maintenance
      await db.downtimeEvents.add({
        machineId: dz001Id as number, defectId: null,
        startTime: daysAgo(7), endTime: daysAgo(6),
        reasonCode: 'scheduled-maintenance', notes: '1000-hour major service. Machine back in service after service.',
        siteId: site1Id as number, loggedBy: willemId as number,
      });

      // [DT4] Completed — TK-001 tire repair
      await db.downtimeEvents.add({
        machineId: tk001Id as number, defectId: def5Id as number,
        startTime: daysAgo(11), endTime: daysAgo(8),
        reasonCode: 'tire-track', notes: 'Sidewall blowout risk — machine stood down until tire replaced.',
        siteId: site3Id as number, loggedBy: siphoId as number,
      });

      // [DT5] Completed — FW-001 hydraulic repair
      await db.downtimeEvents.add({
        machineId: fw001Id as number, defectId: def3Id as number,
        startTime: daysAgo(5), endTime: daysAgo(4),
        reasonCode: 'hydraulic', notes: 'Boom cylinder seal repair. Machine returned to service after seal replacement.',
        siteId: site1Id as number, loggedBy: siphoId as number,
      });

      // [DT6] Completed — FW-002 waiting for parts
      await db.downtimeEvents.add({
        machineId: fw002Id as number, defectId: null,
        startTime: daysAgo(12), endTime: daysAgo(10),
        reasonCode: 'waiting-for-parts', notes: 'Hydraulic pump seal kit on back-order. Machine stood down.',
        siteId: site1Id as number, loggedBy: willemId as number,
      });

      // [DT7] Completed — HV-002 electrical fault
      await db.downtimeEvents.add({
        machineId: hv002Id as number, defectId: null,
        startTime: daysAgo(8), endTime: daysAgo(8),
        reasonCode: 'electrical', notes: 'Felling head not responding — traced to corroded CAN bus connector. Cleaned and reconnected.',
        siteId: site2Id as number, loggedBy: mariaId as number,
      });

      // [DT8] Completed — GN-001 voltage issue
      await db.downtimeEvents.add({
        machineId: gn001Id as number, defectId: def7Id as number,
        startTime: daysAgo(2), endTime: daysAgo(1),
        reasonCode: 'electrical', notes: 'AVR failure causing voltage fluctuation — generator isolated while AVR sourced.',
        siteId: site1Id as number, loggedBy: willemId as number,
      });

      // [DT9] Completed — TK-002 weather hold
      await db.downtimeEvents.add({
        machineId: tk002Id as number, defectId: null,
        startTime: daysAgo(4), endTime: daysAgo(4),
        reasonCode: 'weather', notes: 'Severe thunderstorm — all haulage suspended for 2 hours per site safety protocol.',
        siteId: site3Id as number, loggedBy: siphoId as number,
      });

      // [DT10] Completed — SK-002 fuel/fluid
      await db.downtimeEvents.add({
        machineId: sk002Id as number, defectId: null,
        startTime: daysAgo(6), endTime: daysAgo(6),
        reasonCode: 'fuel-fluid', notes: 'Machine ran low on fuel mid-shift in remote block. Fuel delivery took 1.5 hours.',
        siteId: site2Id as number, loggedBy: thaboId as number,
      });

      // [DT11] Completed — EX-001 access road
      await db.downtimeEvents.add({
        machineId: ex001Id as number, defectId: null,
        startTime: daysAgo(9), endTime: daysAgo(9),
        reasonCode: 'access-road', notes: 'Harvest road washed out after rain. Excavator used to re-cut road — 3hr delay to production.',
        siteId: site1Id as number, loggedBy: johanId as number,
      });

      // [DT12] Completed — CS-001 safety hold
      await db.downtimeEvents.add({
        machineId: cs001Id as number, defectId: def8Id as number,
        startTime: daysAgo(8), endTime: daysAgo(7),
        reasonCode: 'safety-hold', notes: 'Chain tension out of spec — chainsaw withdrawn from use until adjusted by mechanic.',
        siteId: site1Id as number, loggedBy: siphoId as number,
      });

      // [DT13] Completed — HV-001 mechanical
      await db.downtimeEvents.add({
        machineId: hv001Id as number, defectId: null,
        startTime: daysAgo(10), endTime: daysAgo(10),
        reasonCode: 'mechanical', notes: 'Felling head rotator motor slow — diagnosed as worn motor. Temporary fix applied pending parts.',
        siteId: site1Id as number, loggedBy: johanId as number,
      });

      // [DT14] Completed — LD-002 scheduled
      await db.downtimeEvents.add({
        machineId: ld002Id as number, defectId: null,
        startTime: daysAgo(14), endTime: daysAgo(14),
        reasonCode: 'scheduled-maintenance', notes: '250-hour oil service completed in field. Machine returned same day.',
        siteId: site3Id as number, loggedBy: davidId as number,
      });

      // [DT15] Completed — TK-003 operator issue
      await db.downtimeEvents.add({
        machineId: tk003Id as number, defectId: null,
        startTime: daysAgo(3), endTime: daysAgo(3),
        reasonCode: 'operator-issue', notes: 'Operator reported unfamiliar cab warning light — supervisor called. Confirmed low washer fluid only.',
        siteId: site2Id as number, loggedBy: thaboId as number,
      });

      // -----------------------------------------------------------------------
      // MAINTENANCE SCHEDULES
      // ~2-3 per machine, ~40 total
      // -----------------------------------------------------------------------
      type SchedInput = {
        machineId: number;
        serviceType: string;
        intervalDays: number | null;
        intervalHours: number | null;
        lastCompletedDate: string | null;
        lastCompletedHours: number | null;
        dueDate: string | null;
        dueHours: number | null;
      };

      const schedules: SchedInput[] = [
        // HV-001 (4200hrs)
        { machineId: hv001Id as number, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(22), lastCompletedHours: 4100, dueDate: dateStrDaysFromNow(8), dueHours: 4350 },
        { machineId: hv001Id as number, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(45), lastCompletedHours: 3950, dueDate: dateStrDaysFromNow(15), dueHours: 4450 },
        { machineId: hv001Id as number, serviceType: 'Full Service', intervalDays: 90, intervalHours: 1000, lastCompletedDate: dateStrDaysAgo(60), lastCompletedHours: 3800, dueDate: dateStrDaysFromNow(30), dueHours: 4800 },

        // HV-002 (3800hrs)
        { machineId: hv002Id as number, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(28), lastCompletedHours: 3680, dueDate: dateStrDaysFromNow(2), dueHours: 3930 },
        { machineId: hv002Id as number, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(55), lastCompletedHours: 3550, dueDate: dateStrDaysFromNow(5), dueHours: 4050 },
        { machineId: hv002Id as number, serviceType: 'Full Service', intervalDays: 90, intervalHours: 1000, lastCompletedDate: dateStrDaysAgo(80), lastCompletedHours: 3400, dueDate: dateStrDaysFromNow(10), dueHours: 4400 },

        // FW-001 (5100hrs) — overdue oil change
        { machineId: fw001Id as number, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(35), lastCompletedHours: 4920, dueDate: dateStrDaysAgo(5), dueHours: 5170 },
        { machineId: fw001Id as number, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(40), lastCompletedHours: 4780, dueDate: dateStrDaysFromNow(20), dueHours: 5280 },
        { machineId: fw001Id as number, serviceType: 'Full Service', intervalDays: 90, intervalHours: 1000, lastCompletedDate: dateStrDaysAgo(30), lastCompletedHours: 4700, dueDate: dateStrDaysFromNow(60), dueHours: 5700 },

        // FW-002 (3200hrs)
        { machineId: fw002Id as number, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(20), lastCompletedHours: 3080, dueDate: dateStrDaysFromNow(10), dueHours: 3330 },
        { machineId: fw002Id as number, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(50), lastCompletedHours: 2980, dueDate: dateStrDaysFromNow(10), dueHours: 3480 },

        // FW-003 (4600hrs)
        { machineId: fw003Id as number, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(18), lastCompletedHours: 4470, dueDate: dateStrDaysFromNow(12), dueHours: 4720 },
        { machineId: fw003Id as number, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(42), lastCompletedHours: 4250, dueDate: dateStrDaysFromNow(18), dueHours: 4750 },
        { machineId: fw003Id as number, serviceType: 'Full Service', intervalDays: 90, intervalHours: 1000, lastCompletedDate: dateStrDaysAgo(65), lastCompletedHours: 4100, dueDate: dateStrDaysFromNow(25), dueHours: 5100 },

        // SK-001 (6200hrs) — due soon
        { machineId: sk001Id as number, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(27), lastCompletedHours: 6050, dueDate: dateStrDaysFromNow(3), dueHours: 6300 },
        { machineId: sk001Id as number, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(56), lastCompletedHours: 5900, dueDate: dateStrDaysFromNow(4), dueHours: 6400 },

        // SK-002 (2800hrs)
        { machineId: sk002Id as number, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(15), lastCompletedHours: 2700, dueDate: dateStrDaysFromNow(15), dueHours: 2950 },
        { machineId: sk002Id as number, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(30), lastCompletedHours: 2600, dueDate: dateStrDaysFromNow(30), dueHours: 3100 },

        // EX-001 (4800hrs)
        { machineId: ex001Id as number, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(25), lastCompletedHours: 4650, dueDate: dateStrDaysFromNow(5), dueHours: 4900 },
        { machineId: ex001Id as number, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(48), lastCompletedHours: 4550, dueDate: dateStrDaysFromNow(12), dueHours: 5050 },
        { machineId: ex001Id as number, serviceType: 'Full Service', intervalDays: 90, intervalHours: 1000, lastCompletedDate: dateStrDaysAgo(70), lastCompletedHours: 4400, dueDate: dateStrDaysFromNow(20), dueHours: 5400 },

        // EX-002 (3500hrs) — overdue (machine is down)
        { machineId: ex002Id as number, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(40), lastCompletedHours: 3380, dueDate: dateStrDaysAgo(10), dueHours: 3630 },
        { machineId: ex002Id as number, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(65), lastCompletedHours: 3200, dueDate: dateStrDaysAgo(5), dueHours: 3700 },

        // LD-001 (5500hrs)
        { machineId: ld001Id as number, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(24), lastCompletedHours: 5350, dueDate: dateStrDaysFromNow(6), dueHours: 5600 },
        { machineId: ld001Id as number, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(52), lastCompletedHours: 5150, dueDate: dateStrDaysFromNow(8), dueHours: 5650 },

        // LD-002 (4100hrs)
        { machineId: ld002Id as number, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(14), lastCompletedHours: 3990, dueDate: dateStrDaysFromNow(16), dueHours: 4240 },
        { machineId: ld002Id as number, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(44), lastCompletedHours: 3800, dueDate: dateStrDaysFromNow(16), dueHours: 4300 },

        // DZ-001 (7200hrs) — under maintenance, full service just done
        { machineId: dz001Id as number, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(7), lastCompletedHours: 7183, dueDate: dateStrDaysFromNow(23), dueHours: 7433 },
        { machineId: dz001Id as number, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(7), lastCompletedHours: 7183, dueDate: dateStrDaysFromNow(53), dueHours: 7683 },
        { machineId: dz001Id as number, serviceType: 'Full Service', intervalDays: 90, intervalHours: 1000, lastCompletedDate: dateStrDaysAgo(7), lastCompletedHours: 7183, dueDate: dateStrDaysFromNow(83), dueHours: 8183 },

        // TK-001 (3400hrs)
        { machineId: tk001Id as number, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(20), lastCompletedHours: 3250, dueDate: dateStrDaysFromNow(10), dueHours: 3500 },
        { machineId: tk001Id as number, serviceType: 'Full Service', intervalDays: 90, intervalHours: 1000, lastCompletedDate: dateStrDaysAgo(85), lastCompletedHours: 3000, dueDate: dateStrDaysFromNow(5), dueHours: 4000 },

        // TK-002 (2900hrs)
        { machineId: tk002Id as number, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(15), lastCompletedHours: 2780, dueDate: dateStrDaysFromNow(15), dueHours: 3030 },
        { machineId: tk002Id as number, serviceType: 'Hydraulic Filter', intervalDays: 60, intervalHours: 500, lastCompletedDate: dateStrDaysAgo(55), lastCompletedHours: 2600, dueDate: dateStrDaysFromNow(5), dueHours: 3100 },

        // TK-003 (4500hrs)
        { machineId: tk003Id as number, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(10), lastCompletedHours: 4380, dueDate: dateStrDaysFromNow(20), dueHours: 4630 },

        // GN-001 (1200hrs) — due soon
        { machineId: gn001Id as number, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(26), lastCompletedHours: 1080, dueDate: dateStrDaysFromNow(4), dueHours: 1330 },
        { machineId: gn001Id as number, serviceType: 'Full Service', intervalDays: 90, intervalHours: 1000, lastCompletedDate: dateStrDaysAgo(88), lastCompletedHours: 900, dueDate: dateStrDaysFromNow(2), dueHours: 1900 },

        // CS-001 (800hrs) — overdue
        { machineId: cs001Id as number, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(35), lastCompletedHours: 640, dueDate: dateStrDaysAgo(5), dueHours: 890 },

        // CS-002 (600hrs)
        { machineId: cs002Id as number, serviceType: 'Engine Oil Change', intervalDays: 30, intervalHours: 250, lastCompletedDate: dateStrDaysAgo(18), lastCompletedHours: 510, dueDate: dateStrDaysFromNow(12), dueHours: 760 },
      ];

      const scheduleIds: number[] = [];
      for (const sched of schedules) {
        const id = await db.maintenanceSchedules.add({ ...sched, isActive: true });
        scheduleIds.push(id as number);
      }

      // -----------------------------------------------------------------------
      // MAINTENANCE EVENTS — 10 recent completions
      // -----------------------------------------------------------------------
      // HV-001 oil change (schedule index 1 = hydraulic filter, done ~45 days ago)
      await db.maintenanceEvents.add({
        scheduleId: scheduleIds[1], machineId: hv001Id as number,
        completedBy: willemId as number, completedAt: daysAgo(45),
        meterReading: 3950, notes: 'Hydraulic filter replaced. System flushed and refilled with Mobil DTE 25 fluid.',
        serviceType: 'Hydraulic Filter',
      });

      // HV-002 full service (schedule index 5, done ~80 days ago)
      await db.maintenanceEvents.add({
        scheduleId: scheduleIds[5], machineId: hv002Id as number,
        completedBy: davidId as number, completedAt: daysAgo(80),
        meterReading: 3400, notes: '1000-hour major service completed. All filters, belts and wear items replaced.',
        serviceType: 'Full Service',
      });

      // FW-001 oil change (overdue — last done 35 days ago, schedule index 6)
      await db.maintenanceEvents.add({
        scheduleId: scheduleIds[6], machineId: fw001Id as number,
        completedBy: willemId as number, completedAt: daysAgo(35),
        meterReading: 4920, notes: 'Engine oil and filter changed. Used Shell Rimula R4X 15W-40.',
        serviceType: 'Engine Oil Change',
      });

      // DZ-001 oil change (done 7 days ago as part of scheduled maintenance)
      await db.maintenanceEvents.add({
        scheduleId: scheduleIds[27], machineId: dz001Id as number,
        completedBy: willemId as number, completedAt: daysAgo(7),
        meterReading: 7183, notes: 'Engine oil change completed as part of 1000-hour major service.',
        serviceType: 'Engine Oil Change',
      });

      // DZ-001 hydraulic filter (done 7 days ago)
      await db.maintenanceEvents.add({
        scheduleId: scheduleIds[28], machineId: dz001Id as number,
        completedBy: willemId as number, completedAt: daysAgo(7),
        meterReading: 7183, notes: 'Hydraulic filter replaced. Charge filter and return filter both replaced.',
        serviceType: 'Hydraulic Filter',
      });

      // DZ-001 full service (done 7 days ago)
      await db.maintenanceEvents.add({
        scheduleId: scheduleIds[29], machineId: dz001Id as number,
        completedBy: willemId as number, completedAt: daysAgo(7),
        meterReading: 7183, notes: '1000-hour full service. All fluids, filters, track tension and pivot pins inspected and serviced.',
        serviceType: 'Full Service',
      });

      // TK-001 oil change (done 20 days ago, schedule index 30)
      await db.maintenanceEvents.add({
        scheduleId: scheduleIds[30], machineId: tk001Id as number,
        completedBy: davidId as number, completedAt: daysAgo(20),
        meterReading: 3250, notes: 'Engine oil and filter changed. Cab filters also replaced.',
        serviceType: 'Engine Oil Change',
      });

      // LD-002 oil change (done 14 days ago, schedule index 25)
      await db.maintenanceEvents.add({
        scheduleId: scheduleIds[25], machineId: ld002Id as number,
        completedBy: davidId as number, completedAt: daysAgo(14),
        meterReading: 3990, notes: '250-hour oil service. Engine oil, filter and air cleaner replaced.',
        serviceType: 'Engine Oil Change',
      });

      // SK-001 hydraulic filter (done 56 days ago, schedule index 15)
      await db.maintenanceEvents.add({
        scheduleId: scheduleIds[15], machineId: sk001Id as number,
        completedBy: willemId as number, completedAt: daysAgo(56),
        meterReading: 5900, notes: 'Hydraulic return filter and breather replaced.',
        serviceType: 'Hydraulic Filter',
      });

      // EX-001 full service (done 70 days ago, schedule index 20)
      await db.maintenanceEvents.add({
        scheduleId: scheduleIds[20], machineId: ex001Id as number,
        completedBy: willemId as number, completedAt: daysAgo(70),
        meterReading: 4400, notes: 'Full 1000-hour service. Swing bearing greased, boom and stick pin clearances checked.',
        serviceType: 'Full Service',
      });

      // -----------------------------------------------------------------------
      // META — mark database as seeded
      // -----------------------------------------------------------------------
      await db.meta.add({ key: 'seeded', value: 'true' });
    },
  );
}
