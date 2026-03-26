# Workflow Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the app from 3-role (operator/mechanic/supervisor) to 2-role (worker/supervisor) with 4 machine statuses, external service order tracking, and Simplified Chinese i18n support.

**Architecture:** Remove all mechanic-specific code (repairs module, mechanic role, mechanic routes). Replace internal repair tracking with external service order workflow. Add lightweight i18n via React context + JSON translation files. All changes are client-side, offline-first, IndexedDB-backed.

**Tech Stack:** React 19, TypeScript 5.9, Dexie 4 (IndexedDB), Zustand 5, Tailwind CSS 4.2, Framer Motion 12, Vite 8, vite-plugin-pwa

**Spec:** `docs/superpowers/specs/2026-03-26-workflow-redesign-audit.md`

---

## Phase 1: Role Cleanup & Constants

### Task 1: Rename `operator` → `worker` and remove `mechanic` role

**Files:**
- Modify: `src/lib/constants.ts`
- Modify: `src/app/guards/RoleGuard.tsx`
- Modify: `src/features/auth/PinLogin.tsx`
- Modify: `src/components/ui/BottomNav.tsx`
- Modify: `src/features/profile/ProfilePage.tsx`
- Modify: `src/features/settings/SettingsPage.tsx`

- [ ] **Step 1: Update USER_ROLES constant**

In `src/lib/constants.ts:40`, change:
```typescript
export const USER_ROLES = ['worker', 'supervisor'] as const;
```

- [ ] **Step 2: Update RoleGuard redirects**

In `src/app/guards/RoleGuard.tsx:20-27`, replace the switch block:
```typescript
switch (currentUser.role) {
  case 'worker':
    return <Navigate to="/machines" replace />;
  case 'supervisor':
    return <Navigate to="/dashboard" replace />;
}
```

- [ ] **Step 3: Update PinLogin navigation**

In `src/features/auth/PinLogin.tsx:45-57`, replace the switch block:
```typescript
switch (user.role) {
  case 'worker':
    navigate('/machines');
    break;
  case 'supervisor':
    navigate('/dashboard');
    break;
  default:
    navigate('/machines');
}
```

- [ ] **Step 4: Update BottomNav tabs**

In `src/components/ui/BottomNav.tsx:22-47`:
- Rename `operator` key to `worker` in TABS_BY_ROLE
- Delete entire `mechanic` entry (lines 29-34)
- Change default fallback on line 46 from `'operator'` to `'worker'`

- [ ] **Step 5: Update ProfilePage role handling**

In `src/features/profile/ProfilePage.tsx`:
- Line 23-27: `getRoleBadgeVariant()` — delete mechanic case, keep supervisor and default
- Line 29-33: `getRoleLabel()` — delete mechanic case, change default return to `'Worker'`
- Lines 50, 58, 120: Change `'operator'` to `'worker'`

- [ ] **Step 6: Update SettingsPage**

In `src/features/settings/SettingsPage.tsx`: remove any mechanic-specific badge variant logic.

- [ ] **Step 7: Verify build**

```bash
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "refactor: rename operator to worker, remove mechanic role"
```

---

### Task 2: Delete repair module and mechanic routes

**Files:**
- Delete: `src/features/repairs/WorkQueue.tsx`
- Delete: `src/features/repairs/RepairDetail.tsx`
- Delete: `src/features/repairs/useRepairs.ts`
- Modify: `src/app/routes.tsx`
- Modify: `src/features/defects/DefectDetail.tsx`

- [ ] **Step 1: Delete repair feature files**

Delete the entire `src/features/repairs/` directory (3 files: WorkQueue.tsx, RepairDetail.tsx, useRepairs.ts).

- [ ] **Step 2: Remove repair routes and imports from routes.tsx**

In `src/app/routes.tsx`:
- Delete lines 17-18 (lazy imports for WorkQueue, RepairDetail)
- Delete lines 65-72 (the two repair route objects)
- Update role guards: change `['operator', 'supervisor']` to `['worker', 'supervisor']` on lines 52, 57, 63
- Change maintenance guards on lines 75, 79 from `['mechanic', 'supervisor']` to `['supervisor']`

- [ ] **Step 3: Update DefectDetail — remove repair link and mechanic logic**

In `src/features/defects/DefectDetail.tsx`:
- Remove the repair query (lines 55-58: `useLiveQuery` for repairs)
- Remove the linked repair card (lines 200-212)
- Remove the `Wrench` icon import
- Change `canChangeStatus` (line 60-61) from `'mechanic' || 'supervisor'` to just `currentUser?.role === 'supervisor'`

- [ ] **Step 4: Remove repair import from database.ts**

In `src/db/database.ts`:
- Line 11: Remove `import type { Repair } from './schemas/repair.schema'`
- Line 39: Remove `repairs!: Table<Repair>`
- Line 58: Remove the `repairs` store definition from `version(1).stores()`

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "refactor: delete repair module, remove mechanic routes and guards"
```

---

### Task 3: Simplify availability states to 4

**Files:**
- Modify: `src/lib/constants.ts`
- Modify: `src/features/machines/AvailabilityBoard.tsx`
- Modify: `src/features/machines/useAvailability.ts`
- Modify: `src/components/ui/StatusIndicator.tsx` (if it has hardcoded state references)
- Modify: `src/components/ui/Badge.tsx` (if it has availability variant mappings)

- [ ] **Step 1: Update AVAILABILITY_STATES constant**

In `src/lib/constants.ts:10-14`:
```typescript
export const AVAILABILITY_STATES = [
  'available', 'service-due', 'down', 'out-for-service'
] as const;
```

- [ ] **Step 2: Update AVAILABILITY_STATE_COLORS**

In `src/lib/constants.ts:80-87`:
```typescript
export const AVAILABILITY_STATE_COLORS: Record<AvailabilityState, { bg: string; text: string; dot: string }> = {
  'available': { bg: 'bg-emerald-900/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'service-due': { bg: 'bg-amber-900/30', text: 'text-amber-400', dot: 'bg-amber-400' },
  'down': { bg: 'bg-red-900/30', text: 'text-red-400', dot: 'bg-red-400' },
  'out-for-service': { bg: 'bg-orange-900/30', text: 'text-orange-400', dot: 'bg-orange-400' },
};
```

- [ ] **Step 3: Update AvailabilityBoard display constants**

In `src/features/machines/AvailabilityBoard.tsx:22-68`, replace all four Record objects:

```typescript
const GROUP_ORDER: AvailabilityState[] = [
  'down', 'out-for-service', 'service-due', 'available',
];

const STATE_LABELS: Record<AvailabilityState, string> = {
  'down': 'Down',
  'out-for-service': 'Out for Service',
  'service-due': 'Service Due',
  'available': 'Available',
};

const KPI_LABELS: Record<AvailabilityState, string> = {
  'down': 'Down',
  'out-for-service': 'Out for Service',
  'service-due': 'Service Due',
  'available': 'Available',
};

const STATE_BORDER: Record<AvailabilityState, string> = {
  'down': 'border-l-red-500',
  'out-for-service': 'border-l-orange-500',
  'service-due': 'border-l-amber-400',
  'available': 'border-l-emerald-500',
};

const STATE_SECTION_BG: Record<AvailabilityState, string> = {
  'down': 'bg-red-950/20',
  'out-for-service': 'bg-orange-950/20',
  'service-due': 'bg-amber-950/20',
  'available': 'bg-emerald-950/20',
};
```

- [ ] **Step 4: Update availability computation hook**

In `src/features/machines/useAvailability.ts`, rewrite the state logic. Replace `db.repairs.toArray()` with `db.serviceOrders.toArray()` (will be added in Task 5). For now, use an empty array fallback if the table doesn't exist yet:

```typescript
let state: AvailabilityState = 'available';

// Priority: out-for-service > down > service-due > available
const activeServiceOrder = serviceOrders.find(
  s => s.machineId === machine.id && (s.status === 'pending' || s.status === 'in-service')
);
if (activeServiceOrder) {
  state = 'out-for-service';
} else if (machineDowntime.some(d => !d.endTime)) {
  state = 'down';
} else if (machineDefects.some(d => d.severity === 'critical' && (d.status === 'open' || d.status === 'acknowledged'))) {
  state = 'down';
} else if (machineSchedules.some(s =>
  s.isActive && (
    (s.dueDate && s.dueDate <= todayStr) ||
    (s.dueHours && s.dueHours <= machine.currentMeterHours)
  )
)) {
  state = 'service-due';
}
```

- [ ] **Step 5: Check and update StatusIndicator and Badge for old state names**

Grep for `'needs-repair'`, `'under-maintenance'`, `'inspection-due'`, `'out-of-service'` across all files and update any remaining references.

- [ ] **Step 6: Verify build**

```bash
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "refactor: simplify to 4 availability states — available, service-due, down, out-for-service"
```

---

### Task 4: Update defect statuses and downtime codes

**Files:**
- Modify: `src/lib/constants.ts`
- Modify: `src/features/defects/DefectDetail.tsx`
- Modify: `src/features/defects/DefectList.tsx` (filter options)
- Modify: `src/features/downtime/DowntimeLogger.tsx` (reason code chips)

- [ ] **Step 1: Update DEFECT_STATUSES**

In `src/lib/constants.ts:4`:
```typescript
export const DEFECT_STATUSES = ['open', 'acknowledged', 'sent-out', 'resolved', 'deferred'] as const;
```

- [ ] **Step 2: Remove REPAIR_STATUSES**

Delete `src/lib/constants.ts:7-8` (REPAIR_STATUSES constant and type).

- [ ] **Step 3: Update DOWNTIME_CODES**

In `src/lib/constants.ts:19-24`:
```typescript
export const DOWNTIME_CODES = [
  'mechanical', 'hydraulic', 'electrical', 'tire-track',
  'waiting-parts', 'scheduled-service', 'weather-access', 'other'
] as const;
```

- [ ] **Step 4: Update DOWNTIME_CODE_LABELS**

In `src/lib/constants.ts:46-58`:
```typescript
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
```

- [ ] **Step 5: Update DefectDetail STATUS_LABELS and actions**

In `src/features/defects/DefectDetail.tsx:32-37`:
```typescript
const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  acknowledged: 'Acknowledged',
  'sent-out': 'Sent for Service',
  resolved: 'Resolved',
  deferred: 'Deferred',
};
```

Update the status action buttons (lines 214-248) to use new statuses:
- "Acknowledge" (open → acknowledged)
- "Mark Resolved" (any → resolved)
- "Defer" (any → deferred)
- Remove "Mark In Progress" and "Mark Fixed"

- [ ] **Step 6: Update DefectList filter options**

In `src/features/defects/DefectList.tsx`: update the status filter to match new DEFECT_STATUSES.

- [ ] **Step 7: Update Badge component**

In `src/components/ui/Badge.tsx`: check if it has variants for `'in-progress'`, `'fixed'`, `'needs-repair'`, etc. Add variants for `'acknowledged'`, `'sent-out'`, `'resolved'`, `'out-for-service'`, `'service-due'`. Remove old ones.

- [ ] **Step 8: Update dashboard data hook**

In `src/features/dashboard/useDashboardData.ts:19`: change `d.status === 'in-progress'` to `d.status === 'acknowledged'` in the critical defects filter.

- [ ] **Step 9: Verify build**

```bash
npm run build
```

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "refactor: update defect statuses, simplify downtime codes, remove repair statuses"
```

---

## Phase 2: Service Order Feature

### Task 5: Create Service Order schema and database table

**Files:**
- Create: `src/db/schemas/service-order.schema.ts`
- Modify: `src/db/database.ts`

- [ ] **Step 1: Create service order schema**

Create `src/db/schemas/service-order.schema.ts`:
```typescript
import { z } from 'zod';

export const SERVICE_ORDER_STATUSES = ['pending', 'in-service', 'returned', 'completed', 'cancelled'] as const;
export type ServiceOrderStatus = typeof SERVICE_ORDER_STATUSES[number];

export const serviceOrderSchema = z.object({
  id: z.number().optional(),
  machineId: z.number(),
  defectId: z.number().nullable().default(null),
  siteId: z.number(),
  workshopName: z.string().min(1),
  dateSent: z.string(),
  expectedReturnDate: z.string().nullable().default(null),
  dateReturned: z.string().nullable().default(null),
  status: z.enum(SERVICE_ORDER_STATUSES).default('pending'),
  notes: z.string().default(''),
  repairSummary: z.string().default(''),
  cost: z.number().nullable().default(null),
  createdAt: z.string(),
  completedAt: z.string().nullable().default(null),
});

export type ServiceOrder = z.infer<typeof serviceOrderSchema>;
```

- [ ] **Step 2: Add table to database**

In `src/db/database.ts`:
- Add import: `import type { ServiceOrder } from './schemas/service-order.schema'`
- Add table declaration: `serviceOrders!: Table<ServiceOrder>;`
- Bump to version(2) and add store: `serviceOrders: '++id, machineId, defectId, siteId, status, createdAt'`

Note: Dexie requires a new version number when adding tables. Add version(2) with the new table while keeping version(1) intact:
```typescript
this.version(1).stores({ /* existing */ });
this.version(2).stores({
  serviceOrders: '++id, machineId, defectId, siteId, status, createdAt',
});
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add service order schema and database table"
```

---

### Task 6: Create Service Order CRUD hook

**Files:**
- Create: `src/features/service-orders/useServiceOrders.ts`

- [ ] **Step 1: Create the hook file**

```typescript
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { ServiceOrder } from '../../db/schemas/service-order.schema';
import { now, today } from '../../lib/utils';

export function useServiceOrders(status?: string) {
  return useLiveQuery(async () => {
    let query = db.serviceOrders.orderBy('createdAt');
    const all = await query.reverse().toArray();
    if (status) return all.filter(o => o.status === status);
    return all;
  }, [status]);
}

export function useServiceOrder(id: number) {
  return useLiveQuery(() => db.serviceOrders.get(id), [id]);
}

export function useActiveServiceOrder(machineId: number) {
  return useLiveQuery(async () => {
    const orders = await db.serviceOrders.where('machineId').equals(machineId).toArray();
    return orders.find(o => o.status === 'pending' || o.status === 'in-service' || o.status === 'returned');
  }, [machineId]);
}

export async function createServiceOrder(data: Omit<ServiceOrder, 'id' | 'createdAt' | 'completedAt'>) {
  return db.serviceOrders.add({
    ...data,
    createdAt: now(),
    completedAt: null,
  });
}

export async function updateServiceOrderStatus(id: number, status: ServiceOrder['status'], extra?: Partial<ServiceOrder>) {
  const updates: Partial<ServiceOrder> = { status, ...extra };
  if (status === 'completed') updates.completedAt = now();
  if (status === 'returned' && !extra?.dateReturned) updates.dateReturned = today();
  await db.serviceOrders.update(id, updates);
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add service order CRUD hook"
```

---

### Task 7: Create Service Order List and Detail pages

**Files:**
- Create: `src/features/service-orders/ServiceOrderList.tsx`
- Create: `src/features/service-orders/ServiceOrderDetail.tsx`
- Modify: `src/app/routes.tsx` (add routes)
- Modify: `src/components/ui/BottomNav.tsx` (add supervisor tab)

- [ ] **Step 1: Create ServiceOrderList page**

Create `src/features/service-orders/ServiceOrderList.tsx` with:
- Page header "Service Orders"
- Tab filter: Active / Completed / All
- List of service order cards showing: machine code, workshop name, date sent, days elapsed, status badge
- FAB or header action to create new (navigates to defect list to pick one, or standalone form)
- Empty state when no orders

- [ ] **Step 2: Create ServiceOrderDetail page**

Create `src/features/service-orders/ServiceOrderDetail.tsx` with:
- Hero card: machine info, workshop name, status badge
- Timeline: date sent → expected return → actual return → completed
- Stat strip: days elapsed, cost (if entered)
- Action buttons based on status:
  - `pending` → "Mark Sent" (→ in-service)
  - `in-service` → "Mark Returned" (→ returned, prompt for return date)
  - `returned` → "Confirm Ready" (→ completed, prompt for repair summary + optional cost)
  - Any non-completed → "Cancel"
- Linked defect card (if defectId exists)
- Notes section

- [ ] **Step 3: Add routes**

In `src/app/routes.tsx`:
- Add lazy imports for ServiceOrderList and ServiceOrderDetail
- Add routes (supervisor-only):
```typescript
{ path: 'service-orders', element: <RoleGuard roles={['supervisor']}><SuspenseWrapper><ServiceOrderList /></SuspenseWrapper></RoleGuard> },
{ path: 'service-orders/:id', element: <RoleGuard roles={['supervisor']}><SuspenseWrapper><ServiceOrderDetail /></SuspenseWrapper></RoleGuard> },
```

- [ ] **Step 4: Add supervisor bottom nav tab**

In `src/components/ui/BottomNav.tsx`: add a "Service" tab to supervisor tabs (using `Wrench` or `Truck` icon) pointing to `/service-orders`. Consider replacing Maintenance tab or adding as 5th/6th tab.

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add service order list and detail pages with routing"
```

---

### Task 8: Integrate service orders into defect triage

**Files:**
- Modify: `src/features/defects/DefectDetail.tsx`

- [ ] **Step 1: Add "Send for Service" action to defect triage**

In `src/features/defects/DefectDetail.tsx`, add a new action for supervisors when defect is `open` or `acknowledged`:
- "Send for Service" button opens a modal/inline form
- Form fields: workshop name (text input), expected return date (date input), notes (optional textarea)
- On submit: creates service order via `createServiceOrder()`, updates defect status to `'sent-out'`
- Import `createServiceOrder` from `../service-orders/useServiceOrders`
- Import `updateDefectStatus` (already imported)

- [ ] **Step 2: Update status action buttons**

Replace the existing mechanic-style actions with supervisor triage actions:
```
open → "Acknowledge" (sets acknowledged)
acknowledged → "Send for Service" (opens form) | "Mark Resolved" | "Defer"
sent-out → (read-only, managed via service order)
resolved → (no actions)
deferred → "Reopen" (sets open)
```

- [ ] **Step 3: Show linked service order instead of repair**

Replace the old "Linked repair" card with a "Linked Service Order" card that shows workshop name, status, and links to `/service-orders/:id`.

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: integrate service orders into supervisor defect triage"
```

---

### Task 9: Wire service orders into availability computation

**Files:**
- Modify: `src/features/machines/useAvailability.ts`
- Modify: `src/features/dashboard/useDashboardData.ts`
- Modify: `src/features/machines/MachineDetail.tsx`

- [ ] **Step 1: Update useAvailability to fetch service orders**

In `src/features/machines/useAvailability.ts:18-22`:
- Replace `db.repairs.toArray()` with `db.serviceOrders.toArray()`
- Update the state computation logic to check for active service orders (status `pending` or `in-service`) → `'out-for-service'`

- [ ] **Step 2: Add "Out for Service" KPI to dashboard**

In `src/features/dashboard/useDashboardData.ts`:
- Add `db.serviceOrders.toArray()` to the Promise.all
- Add KPI: count of service orders with status `pending` or `in-service`
- Return as `machinesOutForService` in the data object

In `src/features/dashboard/SupervisorDashboard.tsx`:
- Replace "Overdue Maintenance" KPI with "Out for Service" count (or add as 5th KPI if layout allows)

- [ ] **Step 3: Show service order banner on MachineDetail**

In `src/features/machines/MachineDetail.tsx`:
- Import `useActiveServiceOrder` from service orders hook
- If machine has an active service order, show an AlertBanner: "This machine is out for service at [workshop]. Sent [date]."
- Link to service order detail

- [ ] **Step 4: Update MachineDetail action buttons**

Change role guards from `'operator'` to `'worker'`:
- Line 143: `role === 'worker' || role === 'supervisor'`
- Lines 154, 165: Change `'operator' || 'mechanic' || 'supervisor'` to `'worker' || 'supervisor'`

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: wire service orders into availability, dashboard, and machine detail"
```

---

## Phase 3: i18n System

### Task 10: Build translation system

**Files:**
- Create: `src/i18n/translations/en.ts`
- Create: `src/i18n/translations/zh.ts`
- Create: `src/i18n/useTranslation.ts`
- Modify: `src/stores/app.store.ts`

- [ ] **Step 1: Add language to app store**

In `src/stores/app.store.ts`, add language state with localStorage persistence:
```typescript
interface AppState {
  isOnline: boolean;
  setOnline: (online: boolean) => void;
  currentSiteFilter: number | null;
  setSiteFilter: (siteId: number | null) => void;
  language: 'en' | 'zh';
  setLanguage: (lang: 'en' | 'zh') => void;
}
```
Initialize from `localStorage.getItem('fieldops-lang') || 'en'`. Persist on change.

- [ ] **Step 2: Create English translation file**

Create `src/i18n/translations/en.ts` exporting a flat object with ~200 keys covering:
- Navigation: `nav.machines`, `nav.defects`, `nav.downtime`, `nav.dashboard`, `nav.availability`, `nav.serviceOrders`, `nav.profile`, `nav.settings`
- Machine statuses: `status.available`, `status.serviceDue`, `status.down`, `status.outForService`
- Defect statuses: `defect.open`, `defect.acknowledged`, `defect.sentOut`, `defect.resolved`, `defect.deferred`
- Service order statuses: `serviceOrder.pending`, `serviceOrder.inService`, `serviceOrder.returned`, `serviceOrder.completed`, `serviceOrder.cancelled`
- Severity: `severity.low`, `severity.medium`, `severity.high`, `severity.critical`
- Downtime codes: `downtime.mechanical`, etc.
- Common buttons: `action.submit`, `action.cancel`, `action.save`, `action.back`, `action.delete`
- Page titles, form labels, empty states, confirmation messages
- Login: `login.title`, `login.subtitle`, `login.enterPin`, `login.signIn`

- [ ] **Step 3: Create Chinese translation file**

Create `src/i18n/translations/zh.ts` with identical keys, Simplified Chinese values. Examples:
- `nav.machines` → `'机器列表'`
- `status.available` → `'可用'`
- `status.down` → `'停机'`
- `action.submit` → `'提交'`
- `login.title` → `'CCT 现场作业'`

- [ ] **Step 4: Create useTranslation hook**

Create `src/i18n/useTranslation.ts`:
```typescript
import { useAppStore } from '../stores/app.store';
import { en } from './translations/en';
import { zh } from './translations/zh';

const translations = { en, zh } as const;

export function useTranslation() {
  const language = useAppStore(s => s.language);
  const t = (key: string): string => {
    const dict = translations[language] as Record<string, string>;
    return dict[key] ?? (translations.en as Record<string, string>)[key] ?? key;
  };
  return { t, language };
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add i18n system with English and Chinese translation files"
```

---

### Task 11: Add language toggle UI

**Files:**
- Create: `src/components/ui/LanguageToggle.tsx`
- Modify: `src/features/auth/PinLogin.tsx`
- Modify: `src/features/profile/ProfilePage.tsx`

- [ ] **Step 1: Create LanguageToggle component**

Create `src/components/ui/LanguageToggle.tsx`:
- Pill-shaped toggle: `EN | 中文`
- Uses `useAppStore` to read/write language
- Amber highlight on active option
- Smooth transition (150ms)
- Compact size (fits in header corners)

- [ ] **Step 2: Add toggle to login screen**

In `src/features/auth/PinLogin.tsx`:
- Add LanguageToggle in top-right corner (absolute positioned)
- Also translate the login title and subtitle using `useTranslation()`

- [ ] **Step 3: Add toggle to profile page**

In `src/features/profile/ProfilePage.tsx`:
- Add LanguageToggle below the user info card, as a prominent section with label "Language / 语言"

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add language toggle component on login and profile pages"
```

---

### Task 12: Apply translations across all pages

**Files:**
- Modify: All feature pages and UI components that display user-facing text

- [ ] **Step 1: Translate navigation labels**

In `src/components/ui/BottomNav.tsx`: use `useTranslation()` for tab labels instead of hardcoded strings.

- [ ] **Step 2: Translate page headers**

In each feature page: replace hardcoded `title="..."` props on PageHeader with `t('page.title.key')`.

- [ ] **Step 3: Translate status labels, severity labels, category labels**

In components that display status/severity text (Badge content, DefectDetail, AvailabilityBoard state labels, etc.): use translation keys.

- [ ] **Step 4: Translate form labels and buttons**

In InspectionForm, DefectReport, DowntimeLogger, ServiceOrderForm: translate all label text, placeholder text, and button text.

- [ ] **Step 5: Translate empty states and messages**

In EmptyState usages, toast messages, confirmation dialogs: use translation keys.

- [ ] **Step 6: Verify both languages work**

```bash
npm run build
```
Then manually verify: login → toggle to Chinese → navigate through all pages → verify text is Chinese → toggle back to English.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: apply translations across all pages and components"
```

---

## Phase 4: Data & Polish

### Task 13: Update seed data

**Files:**
- Modify: `src/db/seed.ts`
- Modify: `src/db/database.ts` (version bump for migration)

- [ ] **Step 1: Update users — remove mechanics, rename operators to workers**

Change seed users:
- Workers: Keep 4 workers with Malaysian/Chinese names, role = `'worker'`, PINs 1111-1114
- Supervisors: Keep 2 supervisors, PINs 3333-3334
- Delete mechanic accounts entirely

- [ ] **Step 2: Update sites to Malaysian context**

Change site names to match CCT PGL operations (e.g., "Compartment 14 - Pine Block", "Eucalyptus Block 7", "Equipment Yard").

- [ ] **Step 3: Update machine availability states**

Replace old states in seed data:
- `'needs-repair'` → `'down'`
- `'under-maintenance'` → `'service-due'`
- `'inspection-due'` → `'service-due'`
- `'out-of-service'` → `'down'`

- [ ] **Step 4: Update defect statuses in seed data**

- `'in-progress'` → `'acknowledged'`
- `'fixed'` → `'resolved'`

- [ ] **Step 5: Update downtime reason codes in seed data**

Replace removed codes:
- `'waiting-for-parts'` → `'waiting-parts'`
- `'scheduled-maintenance'` → `'scheduled-service'`
- `'operator-issue'` → `'other'`
- `'fuel-fluid'` → `'other'`
- `'safety-hold'` → `'other'`
- `'weather'` or `'access-road'` → `'weather-access'`

- [ ] **Step 6: Add demo service order**

Add 1-2 service orders to seed data to demonstrate the feature.

- [ ] **Step 7: Remove repair seed data**

Delete any seed code that creates repair records.

- [ ] **Step 8: Handle database version migration**

If user already has v1 data, the Dexie version(2) upgrade should handle the new `serviceOrders` table automatically. For role/status migration, add a one-time migration check in `seedDatabase()` that maps old values to new ones.

- [ ] **Step 9: Verify build and fresh seed**

```bash
npm run build
```
Clear IndexedDB in browser, reload app, verify seed data is correct.

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "feat: update seed data — Malaysian context, worker role, new statuses, demo service orders"
```

---

### Task 14: Upgrade login screen with branding

**Files:**
- Modify: `src/features/auth/PinLogin.tsx`

- [ ] **Step 1: Add CCT branding and subtitle**

- Change title from "CCT FieldOps" to styled branding with "CCT" in amber and "FieldOps" in white
- Add subtitle: "Equipment Inspection & Service Tracking" (translatable)
- Add subtle amber glow/shadow behind the title area
- LanguageToggle already added in Task 11

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: upgrade login screen with CCT branding and premium styling"
```

---

### Task 15: Add worker history view

**Files:**
- Create: `src/features/profile/WorkerHistory.tsx`
- Modify: `src/app/routes.tsx`
- Modify: `src/features/profile/ProfilePage.tsx`

- [ ] **Step 1: Create WorkerHistory page**

Create `src/features/profile/WorkerHistory.tsx`:
- Page header "My Activity"
- Two tabs: "Inspections" / "Issues"
- Inspections tab: list of worker's completed inspections with machine code, date, pass/fail count
- Issues tab: list of worker's reported defects with severity badge, status badge, machine code
- Cards are pressable → navigate to detail pages
- Uses `db.inspections.where('operatorId')` and `db.defects.where('reportedBy')`

- [ ] **Step 2: Add route**

In `src/app/routes.tsx`:
```typescript
{ path: 'my-activity', element: <SuspenseWrapper><WorkerHistory /></SuspenseWrapper> },
```

- [ ] **Step 3: Add link from profile page**

In `src/features/profile/ProfilePage.tsx`: add a "View My Activity" button (for workers) that navigates to `/my-activity`.

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add worker activity history page"
```

---

## Verification

After completing all tasks:

1. **Build check:** `npm run build` — zero errors
2. **Worker flow (PIN 1111):**
   - Login → Machines → Detail → Inspect → Report defect → Log downtime → My Activity → Profile → Language toggle
3. **Supervisor flow (PIN 3333):**
   - Login → Dashboard → Availability Board → Defect list → Triage defect → Send for Service → Service Orders → Mark returned → Confirm ready → Settings
4. **Language test:** Toggle to Chinese on login, navigate all pages, toggle back
5. **Status test:** Verify all 4 machine statuses display correctly on Availability Board
6. **Offline test:** Disable network in DevTools → verify app works
7. **Mobile test:** 360×640 viewport, all pages fit, touch targets adequate
8. **GitHub Pages:** `npx vite preview --base /EquipmentInspection/` — all routes work
