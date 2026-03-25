# CCT FieldOps — Equipment Inspection & Maintenance PWA

## Context

CCT PGL is a timber harvesting company that needs a fast, reliable way to capture daily pre-start equipment inspections, report and track defects, manage mechanic repairs, log downtime with reason codes, and schedule preventive maintenance. The critical business problem: preventable breakdowns, unsafe equipment, and untracked downtime are reducing productivity and creating safety risks across remote logging sites.

This is a greenfield, mobile-first, offline-first PWA built for three core users: **Operators** (daily inspections, defect reports), **Mechanics** (repair queue, maintenance), and **Supervisors** (dashboards, compliance, trends). The app must work with no network on low-end Android devices in remote areas while looking and feeling like a premium, world-class digital product.

## Decisions Made

- **App name:** CCT FieldOps
- **Auth:** PIN-based login with user records in local DB
- **Theme:** Dark-first, obsidian base with amber/gold accent
- **Seed data:** Full fleet of 15-20 machines across multiple sites
- **Architecture:** Feature-based modules with Dexie as single source of truth

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React 18 + TypeScript | Ecosystem, code splitting, PWA support |
| Build | Vite | Fast HMR, native lazy imports, small bundles |
| Styling | Tailwind CSS | Utility-first, dark mode native, zero runtime |
| Animation | Framer Motion | Declarative, respects reduced-motion, tree-shakeable |
| Database | Dexie.js (IndexedDB) | Reactive queries via `useLiveQuery`, offline-first |
| State | Zustand | Lightweight, UI-only state (auth, nav, filters) |
| Routing | React Router v6 | Lazy loading, nested layouts, role guards |
| Validation | Zod | Runtime + compile-time types from single source |
| Charts | Recharts | Lightweight, composable, responsive |
| PWA | vite-plugin-pwa | Service worker generation, installable manifest |
| Photos | browser-image-compression | Client-side resize/compress before IndexedDB storage |
| Dates | date-fns | Lightweight date arithmetic for maintenance scheduling |
| Icons | Lucide React | Tree-shakeable icon set, consistent style |

---

## 2. Data Model

### Tables

**users** — `++id, pin, name, role, siteId`
PIN-authenticated user records. Roles: operator, mechanic, supervisor. PINs stored plaintext (acceptable for local-only MVP, document for future hardening).

**sites** — `++id, name, location, isActive`
Logging sites / projects.

**machines** — `++id, code, name, type, siteId, status, availabilityState, currentMeterHours, assignedOperatorId`
Fleet registry. `status`: active/inactive (administrative). `availabilityState`: the operational state shown on the availability board (available/inspection-due/needs-repair/under-maintenance/down/out-of-service). Rule: `availabilityState` is derived from conditions — open critical defect → needs-repair, active downtime → down, overdue maintenance → inspection-due, etc. A helper function `computeAvailability(machine, defects, downtime, maintenance)` calculates this; the stored value is a cache updated on relevant writes.

**inspectionTemplates** — `++id, machineType, name, isActive, items`
Checklist definitions. **One active template per machine type** — when starting an inspection, query `where({machineType, isActive: true}).first()`. `items` is a JSON array: `[{id: string, label: string, category: string, required: boolean, order: number}]`. Item IDs are stable UUIDs generated when the template is created, referenced by `inspectionItems.templateItemId`.

**inspections** — `++id, machineId, operatorId, [machineId+date], date, meterReading, status, completedAt, siteId`
Completed pre-start checks. Status: in-progress/completed/submitted. Compound index `[machineId+date]` supports "Today's Machine" shortcut query.

**inspectionItems** — `++id, inspectionId, templateItemId, result, notes`
Individual checklist answers. Result: pass/fail/na. `templateItemId` references the UUID from the template's `items` array.

**defects** — `++id, machineId, siteId, inspectionId, category, severity, status, description, safeToOperate, priority, reportedBy, createdAt, updatedAt`
Defect reports. `siteId` denormalized from machine for direct filtering in work queue. Severity: low/medium/high/critical. Status: open/in-progress/fixed/deferred. Max 5 photos per defect.

**defectPhotos** — `++id, defectId, data, mimeType, capturedAt, fileSize`
Photos stored as Blobs in separate table for query performance. Max 5 per defect, each compressed to <400KB.

**repairs** — `++id, defectId, machineId, siteId, mechanicId, status, priority, partsNeeded, actionsTaken, completedAt, createdAt`
Mechanic work items. `siteId` denormalized for queue filtering. Status: pending/assigned/in-progress/completed/deferred. `actionsTaken` is a JSON array: `[{note: string, timestamp: string, mechanicId: number}]`.

**maintenanceSchedules** — `++id, machineId, serviceType, intervalDays, intervalHours, lastCompletedDate, lastCompletedHours, dueDate, dueHours, isActive`
Recurring PM rules. Dual-trigger: service is due when EITHER `dueDate <= today` OR `dueHours <= machine.currentMeterHours`, whichever triggers first. "Due soon" threshold: within 7 days OR within 50 engine hours. "Overdue": past due date OR past due hours.

**maintenanceEvents** — `++id, scheduleId, machineId, completedBy, completedAt, meterReading, notes, serviceType`
Completed service records. On completion, the parent schedule's `lastCompleted*` and `due*` fields are recalculated.

**downtimeEvents** — `++id, machineId, defectId, startTime, endTime, reasonCode, notes, siteId, loggedBy`
Downtime entries. `endTime` can be null for ongoing downtime — shown as "active" on availability board. Closing downtime: set `endTime` from the downtime detail view or machine detail. Indexed on `reasonCode` for dashboard chart queries.

**statusHistory** — `++id, machineId, fromState, toState, changedBy, changedAt, reason`
Machine state audit trail. Created automatically by a `trackStateChange()` helper called whenever `machine.availabilityState` is updated.

**meta** — `&key, value`
App metadata (seeded flag, schema version). `&key` = unique primary key on key field.

### Lookup Constants (in code, not DB)

- **Severity levels:** low, medium, high, critical
- **Defect statuses:** open, in-progress, fixed, deferred
- **Repair statuses:** pending, assigned, in-progress, completed, deferred
- **Availability states:** available, inspection-due, needs-repair, under-maintenance, down, out-of-service
- **Downtime codes:** mechanical, hydraulic, electrical, tire-track, waiting-for-parts, operator-issue, fuel-fluid, safety-hold, scheduled-maintenance, weather, access-road, other
- **Machine types:** harvester, forwarder, skidder, excavator, loader, dozer, truck, generator, chainsaw-small-equipment
- **Defect categories:** engine, hydraulic, electrical, structural, safety, tires-tracks, cab-controls, lights-signals, fluid-leaks, other

---

## 3. Route Map

```
/login                          — PIN entry (all users)

/ (AppShell with role-based bottom nav)
├── /machines                   — Machine list (all roles)
├── /machines/:id               — Machine detail + timeline (all roles)
├── /machines/:id/inspect       — Pre-start inspection (operator, supervisor)
├── /defects                    — Defect list, filterable (all roles)
├── /defects/new?machineId=     — New defect report (operator, supervisor)
├── /defects/:id                — Defect detail (all roles)
├── /downtime                   — Downtime history (all roles)
├── /downtime/log?machineId=    — Log downtime (operator, supervisor)
├── /repairs                    — Mechanic work queue (mechanic, supervisor)
├── /repairs/:id                — Repair detail/form (mechanic, supervisor)
├── /maintenance                — Maintenance schedule (mechanic, supervisor)
├── /availability               — Availability board (all roles)
├── /dashboard                  — Supervisor KPI dashboard (supervisor)
├── /settings                   — Manage templates, downtime codes, users (supervisor)
└── /profile                    — Current user info, role, logout
```

**Role-based home after login:**
- Operator → `/machines` with "Today's Machine" shortcut
- Mechanic → `/repairs` (priority-sorted queue)
- Supervisor → `/dashboard` (KPI overview)

**Bottom nav by role (4 tabs + profile):**
- Operator: Machines, Defects, Downtime, Profile
- Mechanic: Queue, Machines, Maintenance, Profile
- Supervisor: Dashboard, Availability, Maintenance, Defects, Profile

**Settings:** Accessible from Profile screen. Allows supervisor to manage inspection templates (add/edit checklist items per machine type), configure downtime code list, and manage user PINs/roles. Simple list + form CRUD — not over-designed.

---

## 4. Design System — "Luxury Industrial"

### Colors

**Base surfaces:**
- Obsidian: `#0F1419`
- Dark slate: `#1A2332`
- Elevated: `#243447`
- Border: `#334155`

**Accent — Amber/Gold:**
- Primary: `#F59E0B`
- Hover: `#FBBF24`
- Pressed: `#D97706`
- Muted: `#F59E0B/20` (20% opacity for backgrounds)

**Text:**
- Primary: `#F8FAFC`
- Secondary: `#94A3B8`
- Muted: `#64748B`

**Status:**
- Available/Pass: `#10B981` (emerald)
- Critical/Down: `#EF4444` (red)
- Warning/Due soon: `#F59E0B` (amber)
- In progress: `#3B82F6` (blue)
- Deferred/NA: `#6B7280` (gray)

**Severity chips:**
- Low: slate bg
- Medium: amber bg/border
- High: orange bg
- Critical: red bg + subtle outer glow

### Typography

**Font:** Inter (loaded via `@fontsource/inter` — no Google Fonts dependency for offline)

| Use | Size | Weight |
|---|---|---|
| Body | 14-16px | 400 |
| Labels | 12-14px | 500 |
| Headings | 20-24px | 600 |
| KPI numbers | 28-32px | 700 |
| Minimum | 12px | — |

### Spacing & Touch

- 4px base grid
- Tap targets: minimum 48x48px (glove-friendly)
- Card padding: 16-20px
- Section gaps: 16-24px
- Bottom nav: 56px height

### Motion Rules

- Page transitions: horizontal slide, 200ms ease-out
- List stagger: 50ms delay between items on fade-in
- Status change: color pulse, 300ms
- Card press: scale(0.98), 100ms
- Counter animations: spring with damping 20
- `prefers-reduced-motion`: all animations instantly disabled
- Inspection/defect forms: NO decorative animation — speed only

### Component Primitives

- `Card` — elevated surface, optional amber accent border
- `Badge` / `Chip` — severity, status, machine type
- `StatusIndicator` — pulsing dot + label
- `BottomNav` — role-filtered, 56px, icon + label
- `PhotoCapture` — camera trigger → compress → thumbnail preview
- `FilterDrawer` — bottom sheet with chip-based multi-select
- `KpiCard` — animated counter + trend arrow + sparkline
- `EmptyState` — icon + message + optional CTA
- `Toast` — amber accent, auto-dismiss, stackable
- `SegmentedControl` — for pass/fail/na, severity selection
- `MeterInput` — numeric input optimized for engine hours

### Design Philosophy

"Luxury around the workflow, simplicity inside the workflow."

- Dashboard, machine list, availability board → editorial layout, rich animations, data visualization polish, premium card design
- Inspection form, defect report, downtime log → flat, fast, zero decoration, massive tap targets, chip-based inputs, minimal typing

---

## 5. Key UX Patterns

### Operator Flow
- **Today's Machine shortcut:** Top of machine list shows assigned/last-used machine with one-tap "Start Inspection" button
- **60-second inspection:** Swipeable checklist, large pass/fail/na chips, auto-advance on selection, meter reading input at top, single "Submit" at bottom
- **Defect in <30s:** Triggered from failed inspection item OR standalone. Severity chips → category chips → optional description → photo capture → submit. Only exceptions require typing.
- **Downtime logging:** Select machine → pick reason code chip → start/end time (defaults to now) → optional notes → submit

### Mechanic Flow
- **Work queue:** Cards sorted by priority/severity. Filter drawer for site, machine, status. Tap to claim/assign. Inline "Mark Fixed" action.
- **Repair form:** See defect + photos, add action notes (timestamped), record parts needed as text, change status
- **Maintenance view:** Due soon (amber) and overdue (red) ribbons. Tap to record completion with meter reading.

### Supervisor Flow
- **KPI strip:** Critical defects count, machines down, inspections today %, overdue maintenance count — all animated counters
- **Availability board:** Grid of machine cards with color-coded status badges, filterable by site
- **Downtime by code:** Horizontal bar chart, sortable, with time period selector
- **Trend views:** Inspection compliance over time, defect severity distribution

---

## 6. Offline & PWA Strategy

- **Service worker:** `vite-plugin-pwa` with `generateSW`, precaches all app shell assets
- **Register type:** `autoUpdate` — silent background updates, no user prompts during field work
- **Data:** All CRUD operations write to Dexie first. No network dependency.
- **Photos:** Compressed to max 1200px, JPEG 80%, stored as Blobs in IndexedDB
- **Sync prep:** Each table will have optional `syncStatus` field (local/pending/synced) added via Dexie version migration when backend is ready. For MVP, all data is local-only.
- **Connectivity banner:** Subtle amber indicator when offline — informational only, never blocks functionality
- **Storage monitoring:** Warn if IndexedDB usage exceeds 500MB

---

## 7. Seed Data

15-20 machines across 2-3 sites with realistic timber industry data:

- **Sites:** e.g., "Compartment 14 - Pine Plantation", "Block 7 - Eucalyptus", "Mill Yard Operations"
- **Machines:** Mix of harvesters, forwarders, skidders, excavators, loaders, trucks. Realistic codes (e.g., "HV-001", "FW-003", "SK-002")
- **Users:** 4-6 operators, 2-3 mechanics, 1-2 supervisors with test PINs (1111, 2222, etc.)
- **Inspections:** Recent history for most machines, some overdue
- **Defects:** Mix of open, in-progress, fixed. Some critical with photos (placeholder blobs)
- **Repairs:** Active work queue items at various stages
- **Downtime:** Recent entries with varied reason codes
- **Maintenance:** Some due soon, some overdue, some recently completed

---

## 8. Performance Targets

- First meaningful paint: <2s on mid-range Android
- Bundle size: <500KB initial JS (lazy-load features)
- Photo compression: <500ms per image
- Inspection form load: <300ms
- 60fps animations on modern devices, graceful degradation (reduced motion) on weak ones
- No WebGL or heavy 3D

---

## 9. Error States & Edge Cases

- **Storage full:** Show toast with storage usage and suggestion to export/clear old inspection data. Block photo capture but allow text-only defect reports.
- **Camera permission denied:** Show inline message with instructions to enable in device settings. Allow manual description-only defect.
- **Validation errors:** Inline field errors with red border + message. Never block submit for optional fields.
- **Empty states:** Each list view has a designed empty state with icon, message, and CTA (e.g., "No defects reported — tap + to report one").
- **Open-ended downtime:** Active downtime (null `endTime`) shows "In Progress" badge and elapsed time counter. "Stop" button available on downtime detail and machine detail.
- **Concurrent inspections:** Prevent starting a new inspection if one is already in-progress for the same machine (check DB before creating).
- **Photo limit:** Max 5 photos per defect. Disable capture button when limit reached, show count indicator.

---

## 10. Future Sync Architecture (Designed Now, Built Later)

- `src/lib/sync/` directory prepared with interface stubs
- Each Dexie table gets `syncStatus`, `lastSyncedAt`, `syncVersion` fields
- Sync queue pattern: changes are written locally first, queued for push
- Conflict resolution: last-write-wins for simple fields, merge for arrays (repair notes)
- Photos sync separately (large payload, lower priority)
- `useLiveQuery` reactivity means UI auto-updates when sync pulls new data
