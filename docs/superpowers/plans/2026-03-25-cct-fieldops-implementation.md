# CCT FieldOps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first, offline-first PWA for equipment inspection, defect reporting, mechanic repairs, downtime tracking, and preventive maintenance scheduling for CCT PGL's timber harvesting operations.

**Architecture:** Feature-based React modules with Dexie.js (IndexedDB) as single source of truth. Zustand for ephemeral UI state only. All data operations are offline-first. Role-based routing (Operator/Mechanic/Supervisor) with PIN login.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Dexie.js, Zustand, React Router v6, Zod, Recharts, vite-plugin-pwa, browser-image-compression, date-fns, Lucide React, @fontsource/inter

**Spec:** `docs/superpowers/specs/2026-03-25-cct-fieldops-design.md`

---

## File Structure

```
src/
├── app/
│   ├── App.tsx                         # Root component, router provider
│   ├── AppShell.tsx                    # Layout: bottom nav + content area + offline banner
│   ├── routes.tsx                      # All route definitions with React.lazy
│   └── guards/
│       └── RoleGuard.tsx               # Role-based route protection, redirects
│
├── components/ui/
│   ├── Button.tsx                      # Primary/secondary/ghost/danger, 48px min touch
│   ├── Card.tsx                        # Elevated surface, optional accent border
│   ├── Badge.tsx                       # Status/severity/type chips with color coding
│   ├── StatusIndicator.tsx             # Pulsing dot + label for availability states
│   ├── BottomNav.tsx                   # Role-filtered, 56px, icon + label
│   ├── PageHeader.tsx                  # Title + back button + optional actions
│   ├── PhotoCapture.tsx                # Camera input → compress → preview thumbnails
│   ├── FilterDrawer.tsx                # Bottom sheet with chip-based multi-select
│   ├── KpiCard.tsx                     # Animated counter + trend arrow
│   ├── EmptyState.tsx                  # Icon + message + optional CTA button
│   ├── Toast.tsx                       # Amber accent, auto-dismiss notification
│   ├── ToastContainer.tsx              # Renders toast stack from store
│   ├── SegmentedControl.tsx            # Pass/fail/na, severity picker
│   ├── MeterInput.tsx                  # Numeric input for engine hours
│   ├── Modal.tsx                       # Centered overlay with backdrop
│   ├── Spinner.tsx                     # Loading indicator
│   ├── AnimatedPage.tsx                # Framer Motion page transition wrapper
│   └── OfflineBanner.tsx               # Amber bar when navigator.onLine is false
│
├── db/
│   ├── database.ts                     # Dexie DB class, all 14 tables + indexes
│   ├── seed.ts                         # Full fleet seed data, called on first launch
│   └── schemas/
│       ├── user.schema.ts              # Zod schema for users
│       ├── site.schema.ts              # Zod schema for sites
│       ├── machine.schema.ts           # Zod schema for machines
│       ├── inspection.schema.ts        # Zod schemas for templates, inspections, items
│       ├── defect.schema.ts            # Zod schemas for defects + photos
│       ├── repair.schema.ts            # Zod schema for repairs
│       ├── maintenance.schema.ts       # Zod schemas for schedules + events
│       └── downtime.schema.ts          # Zod schema for downtime events
│
├── features/
│   ├── auth/
│   │   ├── PinLogin.tsx                # PIN entry screen with numeric keypad
│   │   └── auth.store.ts               # Zustand: currentUser, role, login/logout
│   │
│   ├── machines/
│   │   ├── MachineList.tsx             # Grid of machine cards, site/type/status filter
│   │   ├── MachineCard.tsx             # Compact card: code, type, status badge, meter
│   │   ├── MachineDetail.tsx           # Full detail + timeline + action buttons
│   │   ├── TodaysMachine.tsx           # Operator shortcut card with "Start Inspection"
│   │   ├── AvailabilityBoard.tsx       # Grid grouped by availability state
│   │   └── useMachines.ts             # Dexie query hooks for machines
│   │
│   ├── inspections/
│   │   ├── InspectionForm.tsx          # Full checklist: meter + items + submit
│   │   ├── ChecklistItem.tsx           # Single item with pass/fail/na segmented control
│   │   ├── InspectionHistory.tsx       # Past inspections list for a machine
│   │   └── useInspections.ts           # Dexie hooks for inspection CRUD
│   │
│   ├── defects/
│   │   ├── DefectReport.tsx            # New defect: severity → category → description → photo
│   │   ├── DefectList.tsx              # Filterable list of all defects
│   │   ├── DefectDetail.tsx            # Full defect view with photos + linked repair
│   │   ├── PhotoGrid.tsx               # Photo thumbnails with add/remove
│   │   └── useDefects.ts              # Dexie hooks for defect CRUD
│   │
│   ├── repairs/
│   │   ├── WorkQueue.tsx               # Card list sorted by priority, filter drawer
│   │   ├── RepairCard.tsx              # Compact repair card for queue
│   │   ├── RepairDetail.tsx            # Defect + photos, action notes, status change
│   │   └── useRepairs.ts              # Dexie hooks for repair CRUD
│   │
│   ├── maintenance/
│   │   ├── MaintenanceList.tsx         # Due soon / overdue sections with ribbons
│   │   ├── MaintenanceDetail.tsx       # Record completion with meter reading
│   │   └── useMaintenance.ts           # Dexie hooks + due calculation logic
│   │
│   ├── downtime/
│   │   ├── DowntimeLogger.tsx          # Machine → reason code → time → notes → submit
│   │   ├── DowntimeHistory.tsx         # List with active/completed sections
│   │   ├── ReasonCodePicker.tsx        # Chip grid of downtime codes
│   │   └── useDowntime.ts             # Dexie hooks for downtime CRUD
│   │
│   ├── dashboard/
│   │   ├── SupervisorDashboard.tsx     # KPI strip + charts layout
│   │   ├── KpiStrip.tsx                # 4 animated KPI cards in a row
│   │   ├── DowntimeChart.tsx           # Horizontal bar chart by reason code
│   │   ├── DefectSeverityChart.tsx     # Donut chart of severity distribution
│   │   ├── ComplianceChart.tsx         # Inspection compliance over time line chart
│   │   └── useDashboardData.ts        # Aggregation queries from Dexie
│   │
│   ├── settings/
│   │   ├── SettingsPage.tsx            # Settings menu for supervisor
│   │   └── useSettings.ts             # Settings operations
│   │
│   └── profile/
│       └── ProfilePage.tsx             # Current user info, role display, logout, settings link
│
├── stores/
│   ├── app.store.ts                    # Global UI: isOnline, currentSiteFilter
│   └── toast.store.ts                  # Toast queue: add, remove, auto-dismiss
│
├── lib/
│   ├── constants.ts                    # Enums: severity, statuses, downtime codes, machine types
│   ├── types.ts                        # TypeScript types inferred from Zod schemas
│   ├── utils.ts                        # ID generation, date formatting helpers
│   ├── availability.ts                 # computeAvailability() + trackStateChange()
│   ├── photo.ts                        # Image compression + blob utilities
│   └── sync/
│       └── index.ts                    # Interface stubs for future sync layer
│
├── styles/
│   └── index.css                       # Tailwind directives + CSS custom properties
│
├── main.tsx                            # Entry point
└── vite-env.d.ts                       # Vite type declarations
```

**Config files at root:**
- `vite.config.ts` — Vite + PWA + Tailwind plugin config
- `tsconfig.json` / `tsconfig.app.json` — TypeScript config (Vite scaffold defaults)
- `index.html` — Entry HTML (Vite scaffold default, dark bg added)
- `package.json` — Dependencies

Note: Tailwind v4 with `@tailwindcss/vite` does NOT need `tailwind.config.ts` — theme config lives in `src/styles/index.css` via `@theme` directive.

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `index.html`
- Create: `src/main.tsx`, `src/vite-env.d.ts`, `src/styles/index.css`
- Create: `src/app/App.tsx` (minimal)

- [ ] **Step 1: Initialize Vite project**

```bash
cd c:/Users/cheep/Downloads/Coding/EquipmentInspection
npm create vite@latest . -- --template react-ts
```

Note: If prompted about existing files, choose to overwrite. The README.md already exists.

- [ ] **Step 2: Install all dependencies**

```bash
npm install react-router-dom zustand dexie dexie-react-hooks zod framer-motion recharts browser-image-compression date-fns lucide-react @fontsource/inter
npm install -D tailwindcss @tailwindcss/vite vite-plugin-pwa
```

- [ ] **Step 3: Configure Vite with Tailwind and PWA**

Replace `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      manifest: {
        name: 'CCT FieldOps',
        short_name: 'FieldOps',
        description: 'Equipment Inspection & Maintenance for CCT PGL',
        theme_color: '#F59E0B',
        background_color: '#0F1419',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
});
```

- [ ] **Step 4: Configure Tailwind CSS with custom theme**

Replace `src/styles/index.css`:

```css
@import "tailwindcss";
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/600.css";
@import "@fontsource/inter/700.css";

@theme {
  --color-obsidian: #0F1419;
  --color-slate-dark: #1A2332;
  --color-elevated: #243447;
  --color-border: #334155;

  --color-amber-primary: #F59E0B;
  --color-amber-hover: #FBBF24;
  --color-amber-pressed: #D97706;
  --color-amber-muted: rgba(245, 158, 11, 0.2);

  --color-text-primary: #F8FAFC;
  --color-text-secondary: #94A3B8;
  --color-text-muted: #64748B;

  --color-status-available: #10B981;
  --color-status-critical: #EF4444;
  --color-status-warning: #F59E0B;
  --color-status-progress: #3B82F6;
  --color-status-deferred: #6B7280;

  --font-family-sans: "Inter", system-ui, sans-serif;
}

body {
  @apply bg-obsidian text-text-primary font-sans antialiased;
  -webkit-tap-highlight-color: transparent;
}

/* Scrollbar styling for dark theme */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--color-obsidian);
}
::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}
```

- [ ] **Step 5: Set up entry point**

Replace `src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Create minimal `src/app/App.tsx`:

```tsx
export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-semibold text-amber-primary">
        CCT FieldOps
      </h1>
    </div>
  );
}
```

- [ ] **Step 6: Verify scaffold boots**

```bash
npm run dev
```

Expected: App renders "CCT FieldOps" in amber text on dark background at localhost:5173.

- [ ] **Step 7: Commit scaffold**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json index.html src/ eslint.config.js public/
git commit -m "feat: scaffold Vite + React + TypeScript project with Tailwind and PWA"
```

---

## Task 2: Constants, Zod Schemas & Database Layer

**Files:**
- Create: `src/lib/constants.ts`
- Create: `src/lib/types.ts`
- Create: `src/lib/utils.ts`
- Create: `src/db/schemas/user.schema.ts`
- Create: `src/db/schemas/site.schema.ts`
- Create: `src/db/schemas/machine.schema.ts`
- Create: `src/db/schemas/inspection.schema.ts`
- Create: `src/db/schemas/defect.schema.ts`
- Create: `src/db/schemas/repair.schema.ts`
- Create: `src/db/schemas/maintenance.schema.ts`
- Create: `src/db/schemas/downtime.schema.ts`
- Create: `src/db/database.ts`

- [ ] **Step 1: Create constants**

Create `src/lib/constants.ts`:

```typescript
export const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
export type Severity = typeof SEVERITY_LEVELS[number];

export const DEFECT_STATUSES = ['open', 'in-progress', 'fixed', 'deferred'] as const;
export type DefectStatus = typeof DEFECT_STATUSES[number];

export const REPAIR_STATUSES = ['pending', 'assigned', 'in-progress', 'completed', 'deferred'] as const;
export type RepairStatus = typeof REPAIR_STATUSES[number];

export const AVAILABILITY_STATES = [
  'available', 'inspection-due', 'needs-repair',
  'under-maintenance', 'down', 'out-of-service'
] as const;
export type AvailabilityState = typeof AVAILABILITY_STATES[number];

export const INSPECTION_STATUSES = ['in-progress', 'completed', 'submitted'] as const;
export type InspectionStatus = typeof INSPECTION_STATUSES[number];

export const DOWNTIME_CODES = [
  'mechanical', 'hydraulic', 'electrical', 'tire-track',
  'waiting-for-parts', 'operator-issue', 'fuel-fluid',
  'safety-hold', 'scheduled-maintenance', 'weather',
  'access-road', 'other'
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

export const USER_ROLES = ['operator', 'mechanic', 'supervisor'] as const;
export type UserRole = typeof USER_ROLES[number];

export const MACHINE_STATUSES = ['active', 'inactive'] as const;
export type MachineStatus = typeof MACHINE_STATUSES[number];

// Display labels for UI
export const DOWNTIME_CODE_LABELS: Record<DowntimeCode, string> = {
  'mechanical': 'Mechanical',
  'hydraulic': 'Hydraulic',
  'electrical': 'Electrical',
  'tire-track': 'Tire / Track',
  'waiting-for-parts': 'Waiting for Parts',
  'operator-issue': 'Operator Issue',
  'fuel-fluid': 'Fuel / Fluid',
  'safety-hold': 'Safety Hold',
  'scheduled-maintenance': 'Scheduled Maintenance',
  'weather': 'Weather',
  'access-road': 'Access / Road Issue',
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
  'inspection-due': { bg: 'bg-amber-900/30', text: 'text-amber-400', dot: 'bg-amber-400' },
  'needs-repair': { bg: 'bg-orange-900/30', text: 'text-orange-400', dot: 'bg-orange-400' },
  'under-maintenance': { bg: 'bg-blue-900/30', text: 'text-blue-400', dot: 'bg-blue-400' },
  'down': { bg: 'bg-red-900/30', text: 'text-red-400', dot: 'bg-red-400' },
  'out-of-service': { bg: 'bg-gray-900/30', text: 'text-gray-400', dot: 'bg-gray-400' },
};

// Maintenance thresholds
export const MAINTENANCE_DUE_SOON_DAYS = 7;
export const MAINTENANCE_DUE_SOON_HOURS = 50;
export const MAX_PHOTOS_PER_DEFECT = 5;
```

- [ ] **Step 2: Create Zod schemas**

Create `src/db/schemas/user.schema.ts`:

```typescript
import { z } from 'zod';
import { USER_ROLES } from '../../lib/constants';

export const userSchema = z.object({
  id: z.number().optional(),
  pin: z.string().min(4).max(6),
  name: z.string().min(1),
  role: z.enum(USER_ROLES),
  siteId: z.number(),
});

export type User = z.infer<typeof userSchema>;
```

Create `src/db/schemas/site.schema.ts`:

```typescript
import { z } from 'zod';

export const siteSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  location: z.string().default(''),
  isActive: z.boolean().default(true),
});

export type Site = z.infer<typeof siteSchema>;
```

Create `src/db/schemas/machine.schema.ts`:

```typescript
import { z } from 'zod';
import { MACHINE_TYPES, MACHINE_STATUSES, AVAILABILITY_STATES } from '../../lib/constants';

export const machineSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(MACHINE_TYPES),
  siteId: z.number(),
  status: z.enum(MACHINE_STATUSES).default('active'),
  availabilityState: z.enum(AVAILABILITY_STATES).default('available'),
  currentMeterHours: z.number().default(0),
  assignedOperatorId: z.number().nullable().default(null),
});

export type Machine = z.infer<typeof machineSchema>;
```

Create `src/db/schemas/inspection.schema.ts`:

```typescript
import { z } from 'zod';
import { MACHINE_TYPES, INSPECTION_STATUSES } from '../../lib/constants';

export const inspectionTemplateItemSchema = z.object({
  id: z.string(), // stable UUID
  label: z.string().min(1),
  category: z.string().min(1),
  required: z.boolean().default(true),
  order: z.number(),
});

export const inspectionTemplateSchema = z.object({
  id: z.number().optional(),
  machineType: z.enum(MACHINE_TYPES),
  name: z.string().min(1),
  isActive: z.boolean().default(true),
  items: z.array(inspectionTemplateItemSchema),
});

export const inspectionSchema = z.object({
  id: z.number().optional(),
  machineId: z.number(),
  operatorId: z.number(),
  date: z.string(), // ISO date string YYYY-MM-DD
  meterReading: z.number(),
  status: z.enum(INSPECTION_STATUSES).default('in-progress'),
  completedAt: z.string().nullable().default(null),
  siteId: z.number(),
});

export const inspectionItemSchema = z.object({
  id: z.number().optional(),
  inspectionId: z.number(),
  templateItemId: z.string(), // matches template item UUID
  result: z.enum(['pass', 'fail', 'na']),
  notes: z.string().default(''),
});

export type InspectionTemplate = z.infer<typeof inspectionTemplateSchema>;
export type InspectionTemplateItem = z.infer<typeof inspectionTemplateItemSchema>;
export type Inspection = z.infer<typeof inspectionSchema>;
export type InspectionItem = z.infer<typeof inspectionItemSchema>;
```

Create `src/db/schemas/defect.schema.ts`:

```typescript
import { z } from 'zod';
import { SEVERITY_LEVELS, DEFECT_STATUSES, DEFECT_CATEGORIES } from '../../lib/constants';

export const defectSchema = z.object({
  id: z.number().optional(),
  machineId: z.number(),
  siteId: z.number(),
  inspectionId: z.number().nullable().default(null),
  category: z.enum(DEFECT_CATEGORIES),
  severity: z.enum(SEVERITY_LEVELS),
  status: z.enum(DEFECT_STATUSES).default('open'),
  description: z.string().default(''),
  safeToOperate: z.boolean(),
  priority: z.boolean().default(false),
  reportedBy: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const defectPhotoSchema = z.object({
  id: z.number().optional(),
  defectId: z.number(),
  data: z.instanceof(Blob),
  mimeType: z.string().default('image/jpeg'),
  capturedAt: z.string(),
  fileSize: z.number(),
});

export type Defect = z.infer<typeof defectSchema>;
export type DefectPhoto = z.infer<typeof defectPhotoSchema>;
```

Create `src/db/schemas/repair.schema.ts`:

```typescript
import { z } from 'zod';
import { REPAIR_STATUSES, SEVERITY_LEVELS } from '../../lib/constants';

export const repairActionSchema = z.object({
  note: z.string().min(1),
  timestamp: z.string(),
  mechanicId: z.number(),
});

export const repairSchema = z.object({
  id: z.number().optional(),
  defectId: z.number(),
  machineId: z.number(),
  siteId: z.number(),
  mechanicId: z.number().nullable().default(null),
  status: z.enum(REPAIR_STATUSES).default('pending'),
  priority: z.enum(SEVERITY_LEVELS), // Maps from linked defect's severity — used for queue sorting. NOT the same as defect's boolean `priority` flag.
  partsNeeded: z.string().default(''),
  actionsTaken: z.array(repairActionSchema).default([]),
  completedAt: z.string().nullable().default(null),
  createdAt: z.string(),
});

export type RepairAction = z.infer<typeof repairActionSchema>;
export type Repair = z.infer<typeof repairSchema>;
```

Create `src/db/schemas/maintenance.schema.ts`:

```typescript
import { z } from 'zod';

export const maintenanceScheduleSchema = z.object({
  id: z.number().optional(),
  machineId: z.number(),
  serviceType: z.string().min(1),
  intervalDays: z.number().nullable().default(null),
  intervalHours: z.number().nullable().default(null),
  lastCompletedDate: z.string().nullable().default(null),
  lastCompletedHours: z.number().nullable().default(null),
  dueDate: z.string().nullable().default(null),
  dueHours: z.number().nullable().default(null),
  isActive: z.boolean().default(true),
});

export const maintenanceEventSchema = z.object({
  id: z.number().optional(),
  scheduleId: z.number(),
  machineId: z.number(),
  completedBy: z.number(),
  completedAt: z.string(),
  meterReading: z.number(),
  notes: z.string().default(''),
  serviceType: z.string(),
});

export type MaintenanceSchedule = z.infer<typeof maintenanceScheduleSchema>;
export type MaintenanceEvent = z.infer<typeof maintenanceEventSchema>;
```

Create `src/db/schemas/downtime.schema.ts`:

```typescript
import { z } from 'zod';
import { DOWNTIME_CODES } from '../../lib/constants';

export const downtimeEventSchema = z.object({
  id: z.number().optional(),
  machineId: z.number(),
  defectId: z.number().nullable().default(null),
  startTime: z.string(),
  endTime: z.string().nullable().default(null),
  reasonCode: z.enum(DOWNTIME_CODES),
  notes: z.string().default(''),
  siteId: z.number(),
  loggedBy: z.number(),
});

export type DowntimeEvent = z.infer<typeof downtimeEventSchema>;
```

- [ ] **Step 3: Create utility functions**

Create `src/lib/utils.ts`:

```typescript
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function generateId(): string {
  return crypto.randomUUID();
}

export function now(): string {
  return new Date().toISOString();
}

export function today(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), 'dd MMM yyyy');
}

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'dd MMM yyyy HH:mm');
}

export function formatTimeAgo(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true });
}

export function formatMeterHours(hours: number): string {
  return `${hours.toLocaleString()} hrs`;
}

export function classNames(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
```

- [ ] **Step 4: Create types barrel export**

Create `src/lib/types.ts`:

```typescript
// Re-export all types from schemas for convenient imports
export type { User } from '../db/schemas/user.schema';
export type { Site } from '../db/schemas/site.schema';
export type { Machine } from '../db/schemas/machine.schema';
export type {
  InspectionTemplate,
  InspectionTemplateItem,
  Inspection,
  InspectionItem,
} from '../db/schemas/inspection.schema';
export type { Defect, DefectPhoto } from '../db/schemas/defect.schema';
export type { Repair, RepairAction } from '../db/schemas/repair.schema';
export type { MaintenanceSchedule, MaintenanceEvent } from '../db/schemas/maintenance.schema';
export type { DowntimeEvent } from '../db/schemas/downtime.schema';
```

- [ ] **Step 5: Create Dexie database**

Create `src/db/database.ts`:

```typescript
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
import type { Repair } from './schemas/repair.schema';
import type { MaintenanceSchedule, MaintenanceEvent } from './schemas/maintenance.schema';
import type { DowntimeEvent } from './schemas/downtime.schema';

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
  repairs!: Table<Repair>;
  maintenanceSchedules!: Table<MaintenanceSchedule>;
  maintenanceEvents!: Table<MaintenanceEvent>;
  downtimeEvents!: Table<DowntimeEvent>;
  statusHistory!: Table<StatusHistoryEntry>;
  meta!: Table<MetaEntry>;

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
      repairs: '++id, defectId, machineId, siteId, mechanicId, status, priority, createdAt',
      maintenanceSchedules: '++id, machineId, serviceType, dueDate, dueHours, isActive',
      maintenanceEvents: '++id, scheduleId, machineId, completedBy, completedAt',
      downtimeEvents: '++id, machineId, defectId, startTime, endTime, reasonCode, siteId, loggedBy',
      statusHistory: '++id, machineId, changedAt',
      meta: '&key',
    });
  }
}

export const db = new FieldOpsDB();
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors. If there are errors, fix them.

- [ ] **Step 7: Commit database layer**

```bash
git add src/lib/ src/db/
git commit -m "feat: add constants, Zod schemas, and Dexie database layer"
```

---

## Task 3: Auth Store, PIN Login & Routing Shell

**Files:**
- Create: `src/features/auth/auth.store.ts`
- Create: `src/features/auth/PinLogin.tsx`
- Create: `src/app/guards/RoleGuard.tsx`
- Create: `src/app/routes.tsx`
- Create: `src/app/AppShell.tsx`
- Create: `src/stores/app.store.ts`
- Create: `src/stores/toast.store.ts`
- Modify: `src/app/App.tsx`

- [ ] **Step 1: Create auth store**

Create `src/features/auth/auth.store.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../../lib/types';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      login: (user) => set({ currentUser: user, isAuthenticated: true }),
      logout: () => set({ currentUser: null, isAuthenticated: false }),
    }),
    { name: 'fieldops-auth' }
  )
);
```

- [ ] **Step 2: Create app store and toast store**

Create `src/stores/app.store.ts`:

```typescript
import { create } from 'zustand';

interface AppState {
  isOnline: boolean;
  setOnline: (online: boolean) => void;
  currentSiteFilter: number | null;
  setSiteFilter: (siteId: number | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnline: navigator.onLine,
  setOnline: (online) => set({ isOnline: online }),
  currentSiteFilter: null,
  setSiteFilter: (siteId) => set({ currentSiteFilter: siteId }),
}));

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => useAppStore.getState().setOnline(true));
  window.addEventListener('offline', () => useAppStore.getState().setOnline(false));
}
```

Create `src/stores/toast.store.ts`:

```typescript
import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'success') => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
```

- [ ] **Step 3: Create PIN login screen**

Create `src/features/auth/PinLogin.tsx`:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Delete, LogIn } from 'lucide-react';
import { db } from '../../db/database';
import { useAuthStore } from './auth.store';
import { useToastStore } from '../../stores/toast.store';

export default function PinLogin() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const addToast = useToastStore((s) => s.addToast);

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setError('');
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleSubmit = async () => {
    if (pin.length < 4) {
      setError('Enter at least 4 digits');
      return;
    }

    const user = await db.users.where('pin').equals(pin).first();
    if (!user) {
      setError('Invalid PIN');
      setPin('');
      return;
    }

    login(user);
    addToast(`Welcome, ${user.name}`);

    // Navigate to role-based home
    switch (user.role) {
      case 'operator':
        navigate('/machines');
        break;
      case 'mechanic':
        navigate('/repairs');
        break;
      case 'supervisor':
        navigate('/dashboard');
        break;
    }
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center px-6">
      {/* Logo / Title */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-text-primary">CCT FieldOps</h1>
        <p className="text-text-secondary mt-2 text-sm">Enter your PIN to continue</p>
      </div>

      {/* PIN dots */}
      <div className="flex gap-3 mb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
              i < pin.length
                ? 'bg-amber-primary border-amber-primary scale-110'
                : 'border-border bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-status-critical text-sm mb-4">{error}</p>
      )}

      {/* Numeric keypad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mb-6">
        {digits.map((digit, i) => {
          if (digit === '') return <div key={i} />;
          if (digit === 'del') {
            return (
              <button
                key={i}
                onClick={handleDelete}
                className="h-14 rounded-xl bg-slate-dark flex items-center justify-center active:bg-elevated transition-colors"
              >
                <Delete className="w-5 h-5 text-text-secondary" />
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-xl bg-slate-dark text-text-primary text-xl font-medium active:bg-elevated transition-colors"
            >
              {digit}
            </button>
          );
        })}
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={pin.length < 4}
        className="w-full max-w-[280px] h-12 rounded-xl bg-amber-primary text-obsidian font-semibold flex items-center justify-center gap-2 disabled:opacity-40 active:bg-amber-pressed transition-colors"
      >
        <LogIn className="w-5 h-5" />
        Sign In
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Create RoleGuard**

Create `src/app/guards/RoleGuard.tsx`:

```tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/auth.store';
import type { UserRole } from '../../lib/constants';

interface RoleGuardProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export default function RoleGuard({ children, roles }: RoleGuardProps) {
  const { isAuthenticated, currentUser } = useAuthStore();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    // Redirect to role-appropriate home
    switch (currentUser.role) {
      case 'operator':
        return <Navigate to="/machines" replace />;
      case 'mechanic':
        return <Navigate to="/repairs" replace />;
      case 'supervisor':
        return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
```

- [ ] **Step 5: Create routes with lazy loading**

Create `src/app/routes.tsx`:

```tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import RoleGuard from './guards/RoleGuard';
import AppShell from './AppShell';

// Lazy load all feature pages
const PinLogin = lazy(() => import('../features/auth/PinLogin'));
const MachineList = lazy(() => import('../features/machines/MachineList'));
const MachineDetail = lazy(() => import('../features/machines/MachineDetail'));
const InspectionForm = lazy(() => import('../features/inspections/InspectionForm'));
const DefectList = lazy(() => import('../features/defects/DefectList'));
const DefectReport = lazy(() => import('../features/defects/DefectReport'));
const DefectDetail = lazy(() => import('../features/defects/DefectDetail'));
const DowntimeHistory = lazy(() => import('../features/downtime/DowntimeHistory'));
const DowntimeLogger = lazy(() => import('../features/downtime/DowntimeLogger'));
const WorkQueue = lazy(() => import('../features/repairs/WorkQueue'));
const RepairDetail = lazy(() => import('../features/repairs/RepairDetail'));
const MaintenanceList = lazy(() => import('../features/maintenance/MaintenanceList'));
const MaintenanceDetail = lazy(() => import('../features/maintenance/MaintenanceDetail'));
const AvailabilityBoard = lazy(() => import('../features/machines/AvailabilityBoard'));
const SupervisorDashboard = lazy(() => import('../features/dashboard/SupervisorDashboard'));
const ProfilePage = lazy(() => import('../features/profile/ProfilePage'));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-amber-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <SuspenseWrapper><PinLogin /></SuspenseWrapper>,
  },
  {
    path: '/',
    element: <RoleGuard><AppShell /></RoleGuard>,
    children: [
      { index: true, element: <Navigate to="/machines" replace /> },
      { path: 'machines', element: <SuspenseWrapper><MachineList /></SuspenseWrapper> },
      { path: 'machines/:id', element: <SuspenseWrapper><MachineDetail /></SuspenseWrapper> },
      {
        path: 'machines/:machineId/inspect',
        element: <RoleGuard roles={['operator', 'supervisor']}><SuspenseWrapper><InspectionForm /></SuspenseWrapper></RoleGuard>,
      },
      { path: 'defects', element: <SuspenseWrapper><DefectList /></SuspenseWrapper> },
      {
        path: 'defects/new',
        element: <RoleGuard roles={['operator', 'supervisor']}><SuspenseWrapper><DefectReport /></SuspenseWrapper></RoleGuard>,
      },
      { path: 'defects/:id', element: <SuspenseWrapper><DefectDetail /></SuspenseWrapper> },
      { path: 'downtime', element: <SuspenseWrapper><DowntimeHistory /></SuspenseWrapper> },
      {
        path: 'downtime/log',
        element: <RoleGuard roles={['operator', 'supervisor']}><SuspenseWrapper><DowntimeLogger /></SuspenseWrapper></RoleGuard>,
      },
      {
        path: 'repairs',
        element: <RoleGuard roles={['mechanic', 'supervisor']}><SuspenseWrapper><WorkQueue /></SuspenseWrapper></RoleGuard>,
      },
      {
        path: 'repairs/:id',
        element: <RoleGuard roles={['mechanic', 'supervisor']}><SuspenseWrapper><RepairDetail /></SuspenseWrapper></RoleGuard>,
      },
      {
        path: 'maintenance',
        element: <RoleGuard roles={['mechanic', 'supervisor']}><SuspenseWrapper><MaintenanceList /></SuspenseWrapper></RoleGuard>,
      },
      {
        path: 'maintenance/:id',
        element: <RoleGuard roles={['mechanic', 'supervisor']}><SuspenseWrapper><MaintenanceDetail /></SuspenseWrapper></RoleGuard>,
      },
      { path: 'availability', element: <SuspenseWrapper><AvailabilityBoard /></SuspenseWrapper> },
      {
        path: 'dashboard',
        element: <RoleGuard roles={['supervisor']}><SuspenseWrapper><SupervisorDashboard /></SuspenseWrapper></RoleGuard>,
      },
      { path: 'profile', element: <SuspenseWrapper><ProfilePage /></SuspenseWrapper> },
      {
        path: 'settings',
        element: <RoleGuard roles={['supervisor']}><SuspenseWrapper><SettingsPage /></SuspenseWrapper></RoleGuard>,
      },
    ],
  },
]);
```

- [ ] **Step 6: Create stub UI components required by AppShell**

These 3 components are imported by AppShell and MUST exist before it. Create minimal stubs:

`src/components/ui/BottomNav.tsx`:
```tsx
export default function BottomNav() {
  return <nav className="fixed bottom-0 left-0 right-0 h-14 bg-slate-dark border-t border-border flex items-center justify-center text-text-muted text-sm">Navigation</nav>;
}
```

`src/components/ui/OfflineBanner.tsx`:
```tsx
export default function OfflineBanner() {
  return null; // Implemented in Task 5
}
```

`src/components/ui/ToastContainer.tsx`:
```tsx
export default function ToastContainer() {
  return null; // Implemented in Task 5
}
```

- [ ] **Step 7: Create AppShell with bottom navigation**

Create `src/app/AppShell.tsx`:

```tsx
import { Outlet } from 'react-router-dom';
import BottomNav from '../components/ui/BottomNav';
import OfflineBanner from '../components/ui/OfflineBanner';
import ToastContainer from '../components/ui/ToastContainer';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-obsidian pb-16">
      <OfflineBanner />
      <main className="max-w-lg mx-auto">
        <Outlet />
      </main>
      <BottomNav />
      <ToastContainer />
    </div>
  );
}
```

- [ ] **Step 8: Create placeholder pages for all routes**

Create stub files for every lazy-loaded page so the app compiles. Each stub follows this pattern:

```tsx
// src/features/machines/MachineList.tsx (and all other pages)
export default function MachineList() {
  return <div className="p-4 text-text-secondary">Machine List — Coming Soon</div>;
}
```

Create stubs for all 16 pages: `MachineList`, `MachineDetail`, `InspectionForm`, `DefectList`, `DefectReport`, `DefectDetail`, `DowntimeHistory`, `DowntimeLogger`, `WorkQueue`, `RepairDetail`, `MaintenanceList`, `MaintenanceDetail`, `AvailabilityBoard`, `SupervisorDashboard`, `ProfilePage`, `SettingsPage`.

Each in its correct feature directory as listed in the File Structure section.

- [ ] **Step 9: Update App.tsx with RouterProvider**

Replace `src/app/App.tsx`:

```tsx
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

export default function App() {
  return <RouterProvider router={router} />;
}
```

- [ ] **Step 10: Verify routing works**

```bash
npm run dev
```

Expected: App shows login screen. After seed data is added (Task 4), PIN login will work. For now, verify the route structure compiles and renders.

- [ ] **Step 11: Commit auth and routing**

```bash
git add src/
git commit -m "feat: add PIN login, role-based routing, and app shell with bottom nav"
```

---

## Task 4: Seed Data

**Files:**
- Create: `src/db/seed.ts`
- Modify: `src/app/App.tsx` (add seed check on mount)

- [ ] **Step 1a: Create seed file structure and base data (sites, users, machines)**

Create `src/db/seed.ts` with exported `seedDatabase()` function that:
- Checks `meta` table for `seeded` key — if found, returns early
- Seeds in a single Dexie transaction for atomicity
- Creates 3 sites:
  - Site 1: "Compartment 14 - Pine Plantation" (location: "Mpumalanga, South Africa")
  - Site 2: "Block 7 - Eucalyptus" (location: "KwaZulu-Natal, South Africa")
  - Site 3: "Mill Yard Operations" (location: "Richards Bay, South Africa")
- Creates 8 users:
  - 4 operators: Johan (PIN 1111, site 1), Sipho (PIN 1112, site 1), Maria (PIN 1113, site 2), Thabo (PIN 1114, site 2)
  - 2 mechanics: Willem (PIN 2222, site 1), David (PIN 2223, site 2)
  - 2 supervisors: Pieter (PIN 3333, site 1), Sarah (PIN 3334, site 2)
- Creates 18 machines with realistic codes and types:
  - 2 harvesters (HV-001, HV-002), 3 forwarders (FW-001 to FW-003), 2 skidders (SK-001, SK-002)
  - 2 excavators (EX-001, EX-002), 2 loaders (LD-001, LD-002), 1 dozer (DZ-001)
  - 3 trucks (TK-001 to TK-003), 1 generator (GN-001), 2 chainsaw/small (CS-001, CS-002)
  - Spread across sites, realistic meter hours (1000-8000), some with assigned operators
  - Mix of availability states: most available, 2-3 needs-repair, 1 down, 1 under-maintenance

- [ ] **Step 1b: Seed inspection templates**

Add to `seed.ts`: Create 1 active inspection template per machine type (9 templates total). Each with 6-10 checklist items relevant to the equipment type. Example for harvester:
- Engine oil level (category: engine)
- Hydraulic hoses condition (category: hydraulic)
- Cab safety glass (category: safety)
- Head/felling attachment (category: structural)
- Warning lights functional (category: lights-signals)
- Fire extinguisher present (category: safety)
- Track tension / undercarriage (category: tires-tracks)
- Boom / arm play (category: structural)

Use `crypto.randomUUID()` for template item IDs.

- [ ] **Step 1c: Seed inspections, defects, repairs**

Add to `seed.ts`:
- ~30 inspections over past 14 days (2-3 per day, spread across machines/operators)
- Each inspection gets inspection items (pass/fail/na results — ~85% pass, ~10% fail, ~5% na)
- ~12 defects linked to failed inspection items + some standalone:
  - 2 critical (open), 3 high (1 open, 1 in-progress, 1 fixed), 4 medium (mixed), 3 low (mostly fixed)
  - Include `siteId` denormalized from machine
- ~8 repairs auto-created from defects, at various stages:
  - 2 pending, 2 assigned, 2 in-progress, 2 completed
  - Completed repairs have actionsTaken entries

- [ ] **Step 1d: Seed downtime and maintenance**

Add to `seed.ts`:
- ~15 downtime events with varied reason codes:
  - 2 active (endTime null) for machines that are "down"
  - Rest completed with realistic durations (30min to 8hrs)
  - Spread across mechanical, hydraulic, waiting-for-parts, weather, etc.
- ~20 maintenance schedules per machine:
  - Engine oil change (every 250hrs), hydraulic filter (every 500hrs), full service (every 1000hrs or 90 days)
  - Some due soon (within 7 days / 50 hours), some overdue, most OK
- ~10 maintenance events (recent completions over past 2 months)
- Set `meta.seeded = 'true'` at the end

- [ ] **Step 2: Add seed initialization to App**

Modify `src/app/App.tsx` to run seed on first mount:

```tsx
import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { seedDatabase } from '../db/seed';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedDatabase().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-amber-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary text-sm">Loading CCT FieldOps...</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
```

- [ ] **Step 3: Verify seed data loads**

```bash
npm run dev
```

Expected: App shows loading spinner briefly, then PIN login. Enter PIN `1111` → should authenticate as operator. Enter `2222` → mechanic. Enter `3333` → supervisor. Open browser DevTools → Application → IndexedDB → `cct-fieldops` → verify all tables are populated.

- [ ] **Step 4: Commit seed data**

```bash
git add src/db/seed.ts src/app/App.tsx
git commit -m "feat: add comprehensive seed data for 18 machines, 8 users, 3 sites"
```

---

## Task 5: Design System — Core UI Components

**Files:**
- Create all files in `src/components/ui/`

This task builds the full shared component library. Each component should follow the "Luxury Industrial" design system: obsidian backgrounds, amber accents, 48px min tap targets, Inter font, subtle Framer Motion animations that respect `prefers-reduced-motion`.

- [ ] **Step 1: Build Button component**

Create `src/components/ui/Button.tsx`:
- Variants: `primary` (amber bg, dark text), `secondary` (slate bg, light text), `ghost` (transparent), `danger` (red)
- Sizes: `sm` (36px), `md` (44px), `lg` (52px)
- Full-width option
- Loading state with spinner
- Disabled state
- Min 48px touch target on `md` and `lg`
- `active:scale-[0.98]` press effect

- [ ] **Step 2: Build Card component**

Create `src/components/ui/Card.tsx`:
- Elevated surface: `bg-slate-dark` with `border border-border` and subtle shadow
- Optional `accent` prop adds amber left border
- Optional `pressable` prop adds hover/active states
- Padding configurable, defaults to `p-4`

- [ ] **Step 3: Build Badge component**

Create `src/components/ui/Badge.tsx`:
- Accepts `variant`: severity colors from constants, status colors, or custom
- Compact pill shape with appropriate text contrast
- Critical severity gets subtle `shadow-red-500/20` outer glow

- [ ] **Step 4: Build StatusIndicator component**

Create `src/components/ui/StatusIndicator.tsx`:
- Small pulsing dot (Framer Motion) + text label
- Color mapped from `AVAILABILITY_STATE_COLORS`
- Pulse animation only when state is active (available, in-progress)
- Respects `prefers-reduced-motion`

- [ ] **Step 5: Build BottomNav component**

Create `src/components/ui/BottomNav.tsx`:
- 56px height, fixed to bottom
- Role-filtered tabs using `useAuthStore().currentUser.role`
- Operator: Machines (Cog icon), Defects (AlertTriangle), Downtime (Clock), Profile (User)
- Mechanic: Queue (Wrench), Machines (Cog), Maintenance (Calendar), Profile (User)
- Supervisor: Dashboard (BarChart3), Availability (Grid3X3), Maintenance (Calendar), Defects (AlertTriangle), Profile (User)
- Active tab: amber text + top border indicator
- Uses `NavLink` from react-router-dom for active state

- [ ] **Step 6: Build PageHeader component**

Create `src/components/ui/PageHeader.tsx`:
- Title text (h1, 20-24px, font-semibold)
- Optional back button (left arrow, uses `navigate(-1)`)
- Optional right-side action button/slot
- Sticky top with obsidian background

- [ ] **Step 7: Build PhotoCapture component**

Create `src/components/ui/PhotoCapture.tsx`:
- Uses `<input type="file" accept="image/*" capture="environment">`
- On file selected: compress using `browser-image-compression` (maxWidthOrHeight: 1200, maxSizeMB: 0.4)
- Shows thumbnail previews in a horizontal scroll row
- Add/remove buttons per photo
- `maxPhotos` prop (default 5)
- Count indicator: "2/5 photos"
- Returns `Blob[]` via `onChange` callback

Create `src/lib/photo.ts`:

```typescript
import imageCompression from 'browser-image-compression';

export async function compressPhoto(file: File): Promise<Blob> {
  return imageCompression(file, {
    maxWidthOrHeight: 1200,
    maxSizeMB: 0.4,
    useWebWorker: true,
    fileType: 'image/jpeg',
  });
}

export function createPhotoUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokePhotoUrl(url: string): void {
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 8: Build FilterDrawer component**

Create `src/components/ui/FilterDrawer.tsx`:
- Bottom sheet (slides up from bottom, Framer Motion)
- Backdrop overlay
- Section headers with chip groups
- Multi-select chips that toggle on/off
- "Clear All" and "Apply" buttons
- Generic: accepts filter config array `{label, key, options[]}`

- [ ] **Step 9: Build form input components**

**`SegmentedControl.tsx`** — Horizontal button group, one active segment highlighted with amber. Props: `options: {value: string, label: string}[]`, `value: string`, `onChange: (value: string) => void`. Each segment min 48px tall. Active segment: `bg-amber-primary text-obsidian`. Inactive: `bg-slate-dark text-text-secondary`. Use `role="radiogroup"` for accessibility.

**`MeterInput.tsx`** — Numeric-only input (`inputMode="numeric"`, `pattern="[0-9]*"`) with "hrs" suffix label. Large text (text-xl). Props: `value: number`, `onChange: (n: number) => void`, `label?: string`. Styled with `bg-elevated border-border` on dark theme.

- [ ] **Step 10: Build feedback components**

**`Toast.tsx`** — Single toast notification. Props: `message: string`, `type: 'success' | 'error' | 'info'`, `onDismiss: () => void`. Success = amber left border, error = red, info = blue. Auto-dismiss handled by store.

**`ToastContainer.tsx`** — Replace the stub. Reads from `useToastStore().toasts`, renders stack of `<Toast>` positioned fixed at top-center. Wrap in Framer Motion `AnimatePresence` for slide-in/fade-out.

**`EmptyState.tsx`** — Centered layout. Props: `icon: LucideIcon`, `title: string`, `description?: string`, `action?: {label: string, onClick: () => void}`. Icon at 48px in `text-text-muted`, title in `text-text-primary`, description in `text-text-secondary`.

**`Spinner.tsx`** — Amber spinning border circle. Props: `size?: 'sm' | 'md' | 'lg'`. Sizes: sm=16px, md=24px, lg=40px. Uses CSS `animate-spin` with `border-amber-primary border-t-transparent`.

- [ ] **Step 11: Build overlay and animation components**

**`Modal.tsx`** — Centered overlay. Props: `isOpen: boolean`, `onClose: () => void`, `title?: string`, `children: ReactNode`. Backdrop: `bg-black/60 backdrop-blur-sm`. Panel: `bg-slate-dark rounded-xl`. Framer Motion: `scale` from 0.95 to 1, `opacity` from 0 to 1. Close on backdrop click and Escape key.

**`AnimatedPage.tsx`** — Wraps children in `motion.div`. Entry: slide from right (x: 20 → 0, opacity 0 → 1, 200ms). Exit: fade (opacity 1 → 0, 100ms). Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` — if true, render children without motion wrapper.

**`OfflineBanner.tsx`** — Replace the stub. Fixed at top, z-50. Shows only when `useAppStore().isOnline === false`. Amber-muted background (`bg-amber-muted`), text: "You're offline — data saves locally" with WifiOff icon. AnimatePresence with slideDown animation. Height: 36px.

- [ ] **Step 12: Build KpiCard**

**`KpiCard.tsx`** — Premium animated counter. Props: `value: number`, `label: string`, `color?: 'red' | 'amber' | 'green' | 'blue'`, `icon?: LucideIcon`, `onClick?: () => void`.

Implementation:
```tsx
import { useEffect, useRef } from 'react';
import { useSpring, animated } from 'framer-motion'; // Use framer-motion's useMotionValue + useTransform instead

// Use Framer Motion approach:
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

// In component:
const motionValue = useMotionValue(0);
const rounded = useTransform(motionValue, (v) => Math.round(v));

useEffect(() => {
  const controls = animate(motionValue, value, {
    type: 'spring',
    damping: 20,
    stiffness: 100,
  });
  return controls.stop;
}, [value]);

// Render: <motion.span>{rounded}</motion.span>
```

Card: `bg-slate-dark border border-border rounded-xl p-4`. Value: `text-2xl font-bold`. Label: `text-xs text-text-secondary uppercase tracking-wide`. Color applies to value text. Clickable cards get hover state.

- [ ] **Step 13: Verify all components render**

Check each component renders without console errors. Test SegmentedControl with pass/fail/na options, Toast notifications via the store, Modal open/close, AnimatedPage on route transitions.

- [ ] **Step 14: Commit design system**

```bash
git add src/components/ src/lib/photo.ts
git commit -m "feat: build complete premium design system with 17 shared UI components"
```

---

## Task 6: Machine List & Detail

**Files:**
- Create: `src/features/machines/useMachines.ts`
- Create: `src/features/machines/MachineCard.tsx`
- Create: `src/features/machines/TodaysMachine.tsx`
- Modify: `src/features/machines/MachineList.tsx`
- Modify: `src/features/machines/MachineDetail.tsx`

- [ ] **Step 1: Create machine query hooks**

Create `src/features/machines/useMachines.ts`:

```typescript
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';

export function useMachines(siteId?: number) {
  return useLiveQuery(() => {
    if (siteId) return db.machines.where('siteId').equals(siteId).toArray();
    return db.machines.toArray();
  }, [siteId]);
}

export function useMachine(id: number) {
  return useLiveQuery(() => db.machines.get(id), [id]);
}

export function useSites() {
  return useLiveQuery(() => db.sites.filter((s) => s.isActive).toArray());
}
```

- [ ] **Step 2: Build MachineCard**

Create `src/features/machines/MachineCard.tsx`:
- Displays: machine code, name, type badge, availability status indicator, meter hours, site name
- Pressable card that navigates to `/machines/:id`
- Status indicator uses pulsing dot from StatusIndicator component
- Compact but readable: code prominent, type as small badge, meter hours in secondary text

- [ ] **Step 3: Build TodaysMachine shortcut**

Create `src/features/machines/TodaysMachine.tsx`:
- Shows for operators only
- Queries machine assigned to current user (`assignedOperatorId`) or last inspected machine
- Large amber-accent card with machine name, code, status
- "Start Inspection" button → navigates to `/machines/:id/inspect`
- "Report Defect" quick action

- [ ] **Step 4: Implement MachineList**

Replace stub `src/features/machines/MachineList.tsx`:
- PageHeader: "Machines"
- TodaysMachine shortcut at top (operators only)
- Filter chips for site selection (horizontal scroll)
- Grid of MachineCards (1 column on mobile, 2 on wider)
- Empty state when no machines match filter
- List stagger animation on cards (50ms delay)

- [ ] **Step 5: Implement MachineDetail**

Replace stub `src/features/machines/MachineDetail.tsx`:
- Uses `useParams()` to get machine `id` from route param
- PageHeader with back button and machine code
- Machine info card: name, type, code, site, status indicator, meter hours
- Action buttons row: "Start Inspection", "Report Defect", "Log Downtime" (role-appropriate)
- Timeline section using a `useMachineTimeline(machineId)` hook

Add to `src/features/machines/useMachines.ts`:

```typescript
export function useMachineTimeline(machineId: number) {
  return useLiveQuery(async () => {
    const [inspections, defects, repairs, downtime] = await Promise.all([
      db.inspections.where('machineId').equals(machineId).toArray(),
      db.defects.where('machineId').equals(machineId).toArray(),
      db.repairs.where('machineId').equals(machineId).toArray(),
      db.downtimeEvents.where('machineId').equals(machineId).toArray(),
    ]);

    type TimelineItem = { type: 'inspection' | 'defect' | 'repair' | 'downtime'; date: string; id: number; data: any };
    const items: TimelineItem[] = [
      ...inspections.map(i => ({ type: 'inspection' as const, date: i.completedAt || i.date, id: i.id!, data: i })),
      ...defects.map(d => ({ type: 'defect' as const, date: d.createdAt, id: d.id!, data: d })),
      ...repairs.map(r => ({ type: 'repair' as const, date: r.createdAt, id: r.id!, data: r })),
      ...downtime.map(dt => ({ type: 'downtime' as const, date: dt.startTime, id: dt.id!, data: dt })),
    ];

    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);
  }, [machineId]);
}
```

- Each timeline item is a compact card with type icon, summary, and link to detail page

- [ ] **Step 6: Verify machine pages**

```bash
npm run dev
```

Expected: Login as operator → see machine list with TodaysMachine → tap a card → see machine detail with timeline.

- [ ] **Step 7: Commit machine features**

```bash
git add src/features/machines/
git commit -m "feat: implement machine list, detail, and today's machine shortcut"
```

---

## Task 7: Inspection Form & History

**Files:**
- Create: `src/features/inspections/useInspections.ts`
- Create: `src/features/inspections/ChecklistItem.tsx`
- Modify: `src/features/inspections/InspectionForm.tsx`
- Create: `src/features/inspections/InspectionHistory.tsx`

- [ ] **Step 1: Create inspection hooks**

Create `src/features/inspections/useInspections.ts`:
- `useInspectionTemplate(machineType)` — queries active template
- `useInspectionsByMachine(machineId)` — recent inspections for a machine
- `createInspection(data, items)` — in a `db.transaction('rw', [db.inspections, db.inspectionItems], async () => {...})`:
  1. `const inspectionId = await db.inspections.add(inspectionData)` — gets auto-incremented ID
  2. `await db.inspectionItems.bulkAdd(items.map(item => ({ ...item, inspectionId })))` — bulk add all items with the new ID
- `submitInspection(inspectionId)` — marks as submitted, updates machine meter hours

- [ ] **Step 2: Build ChecklistItem**

Create `src/features/inspections/ChecklistItem.tsx`:
- Displays item label and category
- Pass/Fail/NA segmented control (large, 48px height)
- Pass = green, Fail = red, NA = gray
- Optional notes field (shown only when Fail is selected)
- "Fail" triggers prompt: "Create defect report?" with link

- [ ] **Step 3: Implement InspectionForm**

Replace stub `src/features/inspections/InspectionForm.tsx`:
- Get machine ID via `useParams()` — route is `/machines/:machineId/inspect`
- Load machine and active template via `useMachine(machineId)` and `useInspectionTemplate(machine.type)`
- PageHeader: "Pre-Start Inspection" with machine code
- Meter reading input at top (MeterInput component)
- Scrollable list of ChecklistItems from template
- Progress indicator: "5/10 items completed"
- Submit button at bottom (enabled when all required items answered)
- On submit: save to DB, update machine meter hours, navigate back
- If any items failed: show prompt to create defect reports
- Check for concurrent inspections (prevent if one already in-progress for this machine)
- Toast on success: "Inspection submitted"

- [ ] **Step 4: Build InspectionHistory**

Create `src/features/inspections/InspectionHistory.tsx`:
- Used in MachineDetail timeline
- List of recent inspections with date, operator name, pass/fail count
- Compact cards with status badge (submitted/in-progress)

- [ ] **Step 5: Verify inspection flow**

Login as operator → go to machine → Start Inspection → fill checklist → submit. Check IndexedDB for saved inspection and items.

- [ ] **Step 6: Commit inspections**

```bash
git add src/features/inspections/
git commit -m "feat: implement pre-start inspection form with checklist and history"
```

---

## Task 8: Defect Reporting

**Files:**
- Create: `src/features/defects/useDefects.ts`
- Create: `src/features/defects/PhotoGrid.tsx`
- Modify: `src/features/defects/DefectReport.tsx`
- Modify: `src/features/defects/DefectList.tsx`
- Modify: `src/features/defects/DefectDetail.tsx`

- [ ] **Step 1: Create defect hooks**

Create `src/features/defects/useDefects.ts`:
- `useDefects(filters?)` — query defects with optional severity/status/site/machine filters
- `useDefect(id)` — single defect
- `useDefectPhotos(defectId)` — photos for a defect
- `createDefect(data, photos: Blob[])` — in a single `db.transaction('rw', [db.defects, db.defectPhotos, db.repairs], async () => {...})`:
  1. Add defect → get back auto-incremented `defectId`
  2. Add each photo blob as `defectPhotos` record with that `defectId`
  3. Auto-create a pending repair: `{ defectId, machineId: defect.machineId, siteId: defect.siteId, mechanicId: null, status: 'pending', priority: defect.severity, partsNeeded: '', actionsTaken: [], completedAt: null, createdAt: now() }`
  4. Call `updateMachineAvailability(defect.machineId, defect.reportedBy)` after transaction
- `updateDefectStatus(id, status)` — updates status + updatedAt

- [ ] **Step 2: Build PhotoGrid**

Create `src/features/defects/PhotoGrid.tsx`:
- Displays photo thumbnails in a grid (2x2 or horizontal scroll)
- Uses `URL.createObjectURL()` for display, revokes on cleanup
- Optional "add" button (uses PhotoCapture)
- Optional "remove" button per photo
- Read-only mode for detail views

- [ ] **Step 3: Implement DefectReport**

Replace stub `src/features/defects/DefectReport.tsx`:
- Get optional `machineId` and `inspectionId` via `useSearchParams()` — route is `/defects/new?machineId=X&inspectionId=Y`
- PageHeader: "Report Defect"
- Machine selector (if not pre-filled from query param `machineId`) — use `useMachines()` dropdown
- Severity chips (SegmentedControl: low/medium/high/critical)
- Category chips (grid of DefectCategory badges, single-select)
- Description textarea (optional — "only exceptions require typing")
- Safe to operate toggle (yes/no, defaults to "yes" for low severity)
- Priority flag toggle
- PhotoCapture component (max 5)
- Submit button
- On submit: create defect + repair task, toast "Defect reported", navigate back
- If from inspection (query param `inspectionId`): link to inspection

- [ ] **Step 4: Implement DefectList**

Replace stub `src/features/defects/DefectList.tsx`:
- PageHeader: "Defects"
- Filter chips: severity, status (horizontal scroll rows)
- List of defect cards: machine code, severity badge, category, status badge, time ago
- Tap → DefectDetail
- Empty state: "No defects found"
- Sorted by createdAt descending (newest first)

- [ ] **Step 5: Implement DefectDetail**

Replace stub `src/features/defects/DefectDetail.tsx`:
- PageHeader with back button
- Machine info + defect severity/status badges
- Description
- PhotoGrid (read-only) with full-screen tap to zoom
- Safe to operate indicator
- Linked repair task (if exists) with link to repair detail
- Timeline: status changes from defect and linked repair

- [ ] **Step 6: Verify defect flow**

Login as operator → Report Defect → fill severity + category + photo → submit. Check DB for defect record, photo blob, and auto-created repair.

- [ ] **Step 7: Commit defects**

```bash
git add src/features/defects/
git commit -m "feat: implement defect reporting with photo capture, list, and detail views"
```

---

## Task 9: Mechanic Work Queue & Repairs

**Files:**
- Create: `src/features/repairs/useRepairs.ts`
- Create: `src/features/repairs/RepairCard.tsx`
- Modify: `src/features/repairs/WorkQueue.tsx`
- Modify: `src/features/repairs/RepairDetail.tsx`

- [ ] **Step 1: Create repair hooks**

Create `src/features/repairs/useRepairs.ts`:
- `useRepairs(filters?)` — query repairs with status/site/machine/priority filters
- `useRepair(id)` — single repair with linked defect
- `claimRepair(id, mechanicId)` — assigns mechanic, sets status to 'assigned'
- `addRepairNote(id, note, mechanicId)` — appends to actionsTaken array
- `completeRepair(id, mechanicId)` — sets status to 'completed', updates defect to 'fixed', triggers availability recalculation
- `updateRepairStatus(id, status)` — general status update

- [ ] **Step 2: Build RepairCard**

Create `src/features/repairs/RepairCard.tsx`:
- Machine code + name
- Defect severity badge + category
- Repair status badge
- Assigned mechanic name (or "Unassigned")
- Time since created
- Quick action: "Claim" button (if unassigned), "Mark Fixed" (if assigned to current user)
- Tap → RepairDetail

- [ ] **Step 3: Implement WorkQueue**

Replace stub `src/features/repairs/WorkQueue.tsx`:
- PageHeader: "Work Queue"
- Filter drawer trigger button
- FilterDrawer with: status, severity, site filters
- Sorted by: critical first, then high, then by createdAt
- List of RepairCards
- Unassigned items visually distinct (amber accent border)
- Empty state: "No repairs needed — all clear"

- [ ] **Step 4: Implement RepairDetail**

Replace stub `src/features/repairs/RepairDetail.tsx`:
- PageHeader with back button
- Defect info section: severity, category, description, photos (PhotoGrid read-only)
- Machine info: code, name, meter hours
- Status section with status badge + "Claim" / status change buttons
- Action notes timeline: chronological list of notes with mechanic name + timestamp
- Add note form: text input + "Add Note" button
- Parts needed: text input
- "Mark as Fixed" button (prominent, at bottom)
- On mark fixed: update repair + defect + machine availability

- [ ] **Step 5: Verify repair flow**

Login as mechanic → Work Queue → Claim a repair → Add note → Mark Fixed. Verify defect status changes to "fixed".

- [ ] **Step 6: Commit repairs**

```bash
git add src/features/repairs/
git commit -m "feat: implement mechanic work queue with claim, notes, and repair completion"
```

---

## Task 10: Maintenance Scheduling

**Files:**
- Create: `src/features/maintenance/useMaintenance.ts`
- Modify: `src/features/maintenance/MaintenanceList.tsx`
- Modify: `src/features/maintenance/MaintenanceDetail.tsx`

- [ ] **Step 1: Create maintenance hooks with due calculation**

Create `src/features/maintenance/useMaintenance.ts`:
- `useMaintenanceSchedules()` — all active schedules
- `useMaintenanceByMachine(machineId)` — schedules for a machine
- `computeDueStatus(schedule, machine)` — returns 'overdue' | 'due-soon' | 'ok' based on:
  - Overdue: `dueDate <= today` OR `dueHours <= currentMeterHours`
  - Due soon: within 7 days OR within 50 hours
  - OK: otherwise
- `recordMaintenance(scheduleId, completedBy, meterReading, notes)` — creates event, recalculates due dates on schedule

- [ ] **Step 2: Implement MaintenanceList**

Replace stub `src/features/maintenance/MaintenanceList.tsx`:
- PageHeader: "Maintenance"
- Three sections:
  1. **Overdue** (red ribbon/header) — schedules past due
  2. **Due Soon** (amber ribbon/header) — within threshold
  3. **Upcoming** — all others
- Each item shows: machine code + name, service type, due date / due hours, last completed
- Tap → MaintenanceDetail
- Empty states per section

- [ ] **Step 3: Implement MaintenanceDetail**

Replace stub `src/features/maintenance/MaintenanceDetail.tsx`:
- PageHeader with back button
- Machine info section
- Schedule info: service type, interval (days/hours), last completed, due date/hours
- Due status badge with color
- "Record Completion" form: meter reading input + notes + submit button
- Past events list: dates, meter readings, notes
- On record: updates schedule, creates event, toast "Maintenance recorded"

- [ ] **Step 4: Verify maintenance flow**

Login as mechanic → Maintenance → see overdue/due-soon items → Record completion → verify dates recalculate.

- [ ] **Step 5: Commit maintenance**

```bash
git add src/features/maintenance/
git commit -m "feat: implement maintenance scheduling with due-soon/overdue tracking"
```

---

## Task 11: Downtime Logging

**Files:**
- Create: `src/features/downtime/useDowntime.ts`
- Create: `src/features/downtime/ReasonCodePicker.tsx`
- Modify: `src/features/downtime/DowntimeLogger.tsx`
- Modify: `src/features/downtime/DowntimeHistory.tsx`

- [ ] **Step 1: Create downtime hooks**

Create `src/features/downtime/useDowntime.ts`:
- `useDowntimeEvents(filters?)` — query with machine/site/reasonCode filters
- `useActiveDowntime(machineId?)` — events where endTime is null
- `logDowntime(data)` — creates event, updates machine availability
- `stopDowntime(id)` — sets endTime to now, recalculates availability

- [ ] **Step 2: Build ReasonCodePicker**

Create `src/features/downtime/ReasonCodePicker.tsx`:
- Grid of reason code chips (3 columns)
- Single-select, uses DOWNTIME_CODE_LABELS for display
- Selected chip gets amber highlight
- Large 48px+ tap targets

- [ ] **Step 3: Implement DowntimeLogger**

Replace stub `src/features/downtime/DowntimeLogger.tsx`:
- PageHeader: "Log Downtime"
- Machine selector (if not pre-filled from query param)
- ReasonCodePicker
- Start time input (defaults to now, editable)
- End time input (optional — leave blank for ongoing downtime)
- Link to defect (optional selector from open defects for this machine)
- Notes textarea (optional)
- Submit button
- On submit: create event, update machine availability to 'down' if ongoing

- [ ] **Step 4: Implement DowntimeHistory**

Replace stub `src/features/downtime/DowntimeHistory.tsx`:
- PageHeader: "Downtime"
- Two sections:
  1. **Active** — ongoing downtime (endTime is null), with elapsed time counter and "Stop" button
  2. **History** — completed events sorted by startTime descending
- Each item: machine code, reason code badge, duration (or "In Progress"), date
- Filter chips for reason code
- Tap active item → can stop it

- [ ] **Step 5: Verify downtime flow**

Login as operator → Log Downtime → select machine + reason code → submit with no end time → see in Active section → Stop it → moves to History.

- [ ] **Step 6: Commit downtime**

```bash
git add src/features/downtime/
git commit -m "feat: implement downtime logging with reason codes and active/history views"
```

---

## Task 12: Availability Board

**Files:**
- Create: `src/lib/availability.ts`
- Modify: `src/features/machines/AvailabilityBoard.tsx`

- [ ] **Step 1: Implement availability computation**

Create `src/lib/availability.ts`:

```typescript
import { db } from '../db/database';
import type { AvailabilityState } from './constants';
import { now } from './utils';

export async function computeAvailability(machineId: number): Promise<AvailabilityState> {
  // Check for active downtime → 'down'
  const activeDowntime = await db.downtimeEvents
    .where('machineId').equals(machineId)
    .filter((e) => e.endTime === null)
    .first();
  if (activeDowntime) return 'down';

  // Check for open critical/high defects → 'needs-repair'
  const criticalDefect = await db.defects
    .where('machineId').equals(machineId)
    .filter((d) => (d.severity === 'critical' || d.severity === 'high') && d.status === 'open')
    .first();
  if (criticalDefect) return 'needs-repair';

  // Check for active repairs → 'under-maintenance'
  const activeRepair = await db.repairs
    .where('machineId').equals(machineId)
    .filter((r) => r.status === 'in-progress')
    .first();
  if (activeRepair) return 'under-maintenance';

  // Check for overdue maintenance → 'inspection-due'
  const machine = await db.machines.get(machineId);
  if (machine) {
    const overdueSchedule = await db.maintenanceSchedules
      .where('machineId').equals(machineId)
      .filter((s) => {
        if (!s.isActive) return false;
        const today = new Date().toISOString().split('T')[0];
        if (s.dueDate && s.dueDate <= today) return true;
        if (s.dueHours && machine.currentMeterHours >= s.dueHours) return true;
        return false;
      })
      .first();
    if (overdueSchedule) return 'inspection-due';
  }

  return 'available';
}

export async function updateMachineAvailability(machineId: number, changedBy: number): Promise<void> {
  const machine = await db.machines.get(machineId);
  if (!machine) return;

  const newState = await computeAvailability(machineId);
  if (newState !== machine.availabilityState) {
    await db.transaction('rw', [db.machines, db.statusHistory], async () => {
      await db.machines.update(machineId, { availabilityState: newState });
      await db.statusHistory.add({
        machineId,
        fromState: machine.availabilityState,
        toState: newState,
        changedBy,
        changedAt: now(),
        reason: 'auto-computed',
      });
    });
  }
}
```

- [ ] **Step 2: Implement AvailabilityBoard**

Replace stub `src/features/machines/AvailabilityBoard.tsx`:
- PageHeader: "Availability"
- Site filter chips at top
- Grouped sections by availability state:
  - Available (green header)
  - Inspection Due (amber)
  - Needs Repair (orange)
  - Under Maintenance (blue)
  - Down (red)
  - Out of Service (gray)
- Each section contains machine cards (compact: code, name, type)
- Counts per section shown in header
- Animated layout transitions when machines change state

- [ ] **Step 3: Wire availability updates into existing flows**

Modify defect, repair, downtime, and maintenance hooks to call `updateMachineAvailability()` after relevant state changes:
- After creating a defect
- After completing a repair
- After logging/stopping downtime
- After recording maintenance

- [ ] **Step 4: Verify availability board**

Check that machines appear in correct sections based on their current defects, repairs, downtime, and maintenance state.

- [ ] **Step 5: Commit availability**

```bash
git add src/lib/availability.ts src/features/machines/AvailabilityBoard.tsx src/features/defects/ src/features/repairs/ src/features/downtime/ src/features/maintenance/
git commit -m "feat: implement availability board with auto-computed machine states"
```

---

## Task 13: Supervisor Dashboard

**Files:**
- Create: `src/features/dashboard/useDashboardData.ts`
- Create: `src/features/dashboard/KpiStrip.tsx`
- Create: `src/features/dashboard/DowntimeChart.tsx`
- Create: `src/features/dashboard/DefectSeverityChart.tsx`
- Modify: `src/features/dashboard/SupervisorDashboard.tsx`

- [ ] **Step 1: Create dashboard data hooks**

Create `src/features/dashboard/useDashboardData.ts`:
- `useCriticalDefectsCount()` — count of open critical/high defects
- `useMachinesDownCount()` — count of machines with availability != 'available'
- `useInspectionComplianceToday()` — % of active machines inspected today
- `useOverdueMaintenanceCount()` — count of overdue schedules
- `useDowntimeByCode(days?)` — aggregation: { code, totalMinutes } for bar chart
- `useDefectsBySeverity()` — aggregation for donut chart
- `useComplianceOverTime(days)` — for each of past N days: count distinct machines inspected / total active machines → returns `{date, percentage}[]`

All hooks use `useLiveQuery` for reactive updates.

- [ ] **Step 2: Build KpiStrip**

Create `src/features/dashboard/KpiStrip.tsx`:
- Horizontal row of 4 KpiCard components
- Scrollable on mobile (horizontal scroll)
- Cards:
  1. Critical Defects — red when > 0, number counter animation
  2. Machines Down — red when > 0
  3. Inspections Today — shows percentage, green when > 80%
  4. Overdue Maintenance — amber when > 0

- [ ] **Step 3: Build DowntimeChart**

Create `src/features/dashboard/DowntimeChart.tsx`:
- Recharts horizontal BarChart
- Bars colored by reason code category
- Y-axis: reason code labels
- X-axis: total hours
- Time period selector: 7d, 30d, 90d (SegmentedControl)
- Dark theme: dark background, light text, amber accent bars

- [ ] **Step 4: Build DefectSeverityChart**

Create `src/features/dashboard/DefectSeverityChart.tsx`:
- Recharts PieChart / donut
- Segments colored by severity (from SEVERITY_COLORS)
- Center label: total count
- Legend below

- [ ] **Step 5: Build ComplianceChart**

Create `src/features/dashboard/ComplianceChart.tsx`:
- Recharts LineChart showing inspection compliance over time
- X-axis: dates (past 14 days)
- Y-axis: percentage of active machines inspected that day
- Uses `useDashboardData.ts` hook `useComplianceOverTime(days)` which queries inspections grouped by date and calculates % of total active machines
- Amber line on dark background, area fill with gradient
- Target line at 100% (dashed)

- [ ] **Step 6: Implement SupervisorDashboard**

Replace stub `src/features/dashboard/SupervisorDashboard.tsx`:
- PageHeader: "Dashboard"
- KpiStrip at top
- Section: "Machine Availability" — compact summary cards by state count, tap → /availability
- Section: "Inspection Compliance" — ComplianceChart (line chart over 14 days)
- Section: "Downtime by Reason" — DowntimeChart
- Section: "Open Defects by Severity" — DefectSeverityChart
- Section: "Recent Critical Issues" — list of latest critical defects with machine, time, status
- All sections have proper headers and spacing

- [ ] **Step 7: Verify dashboard**

Login as supervisor → Dashboard shows KPIs matching actual data → Charts render → Tap KPI → navigates to relevant list. Compliance chart shows 14-day trend.

- [ ] **Step 8: Commit dashboard**

```bash
git add src/features/dashboard/
git commit -m "feat: implement supervisor dashboard with KPIs, downtime chart, and defect analysis"
```

---

## Task 14: Profile & Settings

**Files:**
- Modify: `src/features/profile/ProfilePage.tsx`
- Modify: `src/features/settings/SettingsPage.tsx`
- Create: `src/features/settings/useSettings.ts`

- [ ] **Step 1: Implement ProfilePage**

Replace stub `src/features/profile/ProfilePage.tsx`:
- Current user name, role badge, site name
- "Settings" link (supervisor only)
- "Switch User / Logout" button → clears auth store, navigates to /login
- App version info

- [ ] **Step 2: Implement SettingsPage**

Replace stub `src/features/settings/SettingsPage.tsx`:
- PageHeader: "Settings"
- Sections:
  - "Reset Demo Data" — button to clear DB and re-seed
  - "Users" — list of users with PIN, name, role (read-only for MVP)
  - "Sites" — list of sites (read-only for MVP)
- Keep it simple — this is a supervisor utility page, not a feature focus

- [ ] **Step 3: Commit profile and settings**

```bash
git add src/features/profile/ src/features/settings/
git commit -m "feat: add profile page and supervisor settings"
```

---

## Task 15: Premium Polish Pass

**Files:**
- Modify: Multiple files across all features

- [ ] **Step 1: Add page transition animations**

Wrap all page components in `AnimatedPage` for slide transitions. Verify transitions feel smooth and premium on route changes.

- [ ] **Step 2: Add list stagger animations**

Add `motion.div` with staggered `variants` to:
- MachineList cards
- WorkQueue repair cards
- DefectList items
- DowntimeHistory items
- MaintenanceList items

50ms stagger delay, fade + slide up from 10px.

- [ ] **Step 3: Add KPI counter animations**

Verify KpiCard numbers animate with spring physics when values change. Use Framer Motion `useSpring` with `damping: 20, stiffness: 100`.

- [ ] **Step 4: Add status change animations**

When availability badges change: pulse animation (scale 1 → 1.1 → 1, with color transition).

- [ ] **Step 5: Verify reduced motion**

Check that `prefers-reduced-motion: reduce` disables all animations. Test by enabling "Reduce motion" in OS accessibility settings.

- [ ] **Step 6: Check all empty states**

Visit every list view with no data (clear specific tables). Verify EmptyState renders with appropriate icon, message, and CTA.

- [ ] **Step 7: Check all loading states**

Verify Spinner/PageLoader appears during lazy-load transitions.

- [ ] **Step 8: Check toast notifications**

Verify toasts appear on: inspection submit, defect report, repair status change, downtime log, maintenance completion.

- [ ] **Step 9: Mobile responsiveness check**

Test at 360px width (small Android). Verify:
- All content fits without horizontal scroll
- Tap targets are 48px minimum
- Bottom nav doesn't overlap content
- Forms are usable one-handed
- Photo capture works

- [ ] **Step 10: Color contrast check**

Verify text readability:
- Primary text on obsidian: `#F8FAFC` on `#0F1419` — ratio ~16:1 (passes AAA)
- Secondary text on obsidian: `#94A3B8` on `#0F1419` — check ratio ≥ 4.5:1
- Amber on obsidian: `#F59E0B` on `#0F1419` — check ratio ≥ 4.5:1

- [ ] **Step 11: Commit polish**

```bash
git add -A
git commit -m "feat: add premium animations, transitions, and polish across all views"
```

---

## Task 16: PWA Finalization & Verification

**Files:**
- Create: `public/icon-192.png`, `public/icon-512.png`
- Verify: `vite.config.ts` PWA config

- [ ] **Step 1: Generate app icons**

Create simple amber-on-dark icons for PWA. Can use an SVG-based approach or create simple canvas-generated PNG icons. The icon should feature a stylized gear/wrench motif in amber on obsidian background.

For a quick approach, create an SVG icon and use it:

```html
<!-- public/icon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="64" fill="#0F1419"/>
  <text x="256" y="320" text-anchor="middle" font-family="Arial" font-weight="700" font-size="280" fill="#F59E0B">F</text>
</svg>
```

Generate PNGs from this at 192x192 and 512x512.

- [ ] **Step 2: Verify PWA manifest**

```bash
npm run build
npx serve dist
```

Open in Chrome → DevTools → Application → Manifest. Verify:
- Name: CCT FieldOps
- Icons present
- Display: standalone
- Theme color: amber

- [ ] **Step 3: Test offline functionality**

In Chrome DevTools → Application → Service Workers → check "Offline". Navigate the app:
- Machine list loads from IndexedDB
- Can create inspection
- Can report defect
- Can log downtime
- All data persists

- [ ] **Step 4: Test PWA install**

In Chrome (desktop or mobile): look for install prompt in address bar. Install and verify:
- App launches in standalone mode
- Title bar uses theme color
- Works offline after install

- [ ] **Step 5: Production build size check**

```bash
npm run build
```

Check `dist/assets/` file sizes. Target: initial JS bundle <500KB. If over, check for:
- Are all routes lazy-loaded?
- Any unnecessary dependencies?
- Recharts tree-shaking working?

- [ ] **Step 6: Create sync layer stubs**

Create `src/lib/sync/index.ts`:

```typescript
/**
 * Future sync layer interface stubs.
 * When a backend is added, implement these interfaces to enable
 * bidirectional sync between IndexedDB and the server.
 */

export interface SyncConfig {
  apiUrl: string;
  authToken: string;
}

export interface SyncResult {
  pushed: number;
  pulled: number;
  conflicts: number;
}

export interface SyncEngine {
  initialize(config: SyncConfig): Promise<void>;
  pushChanges(): Promise<SyncResult>;
  pullChanges(): Promise<SyncResult>;
  getStatus(): 'idle' | 'syncing' | 'error';
  getLastSyncedAt(): string | null;
}

/**
 * Each Dexie table will gain these fields via a version migration:
 * - syncStatus: 'local' | 'pending' | 'synced'
 * - lastSyncedAt: string | null
 * - syncVersion: number
 *
 * Photos sync separately (large payload, lower priority).
 * Conflict resolution: last-write-wins for simple fields, merge for arrays.
 */

// Placeholder — not yet implemented
export const syncEngine: SyncEngine | null = null;
```

- [ ] **Step 7: Add storage monitoring**

Add to `src/stores/app.store.ts` or a new utility:

```typescript
export async function checkStorageUsage(): Promise<{ used: number; quota: number; percentage: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const used = estimate.usage || 0;
    const quota = estimate.quota || 0;
    return { used, quota, percentage: quota > 0 ? (used / quota) * 100 : 0 };
  }
  return { used: 0, quota: 0, percentage: 0 };
}
```

Show warning toast on app load if usage > 500MB. Display storage usage on Profile page.

- [ ] **Step 8: Commit PWA and sync stubs**

```bash
git add public/ vite.config.ts src/lib/sync/ src/stores/app.store.ts src/features/profile/
git commit -m "feat: finalize PWA, add sync layer stubs and storage monitoring"
```

---

## End-to-End Verification

After all tasks are complete, run through these flows:

### 1. Operator Flow
- [ ] Login with PIN `1111`
- [ ] See "Today's Machine" shortcut
- [ ] Tap "Start Inspection" → complete checklist → fail one item
- [ ] Get prompted to create defect → add severity + category + photo → submit
- [ ] Navigate to Downtime → Log Downtime for same machine → submit
- [ ] Check machine appears as "down" on availability board

### 2. Mechanic Flow
- [ ] Login with PIN `2222`
- [ ] See Work Queue with the defect from step 1
- [ ] Claim the repair → Add action note → Mark as Fixed
- [ ] Verify defect status updates to "fixed"
- [ ] Go to Maintenance → find overdue item → Record completion

### 3. Supervisor Flow
- [ ] Login with PIN `3333`
- [ ] Dashboard shows accurate KPI numbers
- [ ] Downtime chart reflects logged downtime
- [ ] Availability board shows correct machine states
- [ ] Tap critical defect count → navigates to filtered defect list

### 4. Offline Test
- [ ] Enable airplane mode / disable network
- [ ] Repeat operator flow — all actions work
- [ ] Data persists in IndexedDB
- [ ] Re-enable network — app continues normally

### 5. PWA Test
- [ ] Install app from Chrome
- [ ] Launch from home screen
- [ ] Verify standalone mode (no browser chrome)
- [ ] Verify offline works from installed app
