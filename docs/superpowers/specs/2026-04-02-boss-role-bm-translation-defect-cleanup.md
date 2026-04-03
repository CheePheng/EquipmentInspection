# Boss Role, Bahasa Melayu Translation & Defect Card Cleanup

**Date:** 2026-04-02
**Status:** Draft

## Context

The CCT FieldOps webapp is being prepared for a management presentation. Three enhancements are needed:
1. A "boss" role so management can demo fleet/team oversight capabilities
2. Bahasa Melayu (BM) as a third language option alongside English and Chinese
3. Tidier defect cards — current cards show too much information at once

## 1. Boss Role

### 1.1 Role Definition

Add `boss` to `USER_ROLES` in `src/lib/constants.ts`. Type becomes `'worker' | 'supervisor' | 'boss'`.

**Seed user:** ID 7, name "Dato' Chai", PIN `888888`, role `boss`, siteId 1.

### 1.2 Boss Navigation

Bottom nav tabs (in `src/components/ui/BottomNav.tsx`):

```
Dashboard | Availability | Defects | Fleet | Profile
```

- **Dashboard** — Same supervisor dashboard with KPIs and charts
- **Availability** — Same availability board
- **Defects** — Simplified read-only list (see Section 3.2)
- **Fleet** — New fleet management page (see Section 2.1)
- **Profile** — Standard profile page with "Manage Team" button (see Section 2.2)

### 1.3 Boss Permissions

| Action | Worker | Supervisor | Boss |
|--------|--------|------------|------|
| View dashboard | No | Yes | Yes |
| View availability board | No | Yes | Yes |
| View defects (full) | Yes | Yes | No |
| View defects (simplified) | No | No | Yes |
| Change defect status | No | Yes | No |
| Report defect | Yes | Yes | No |
| Start inspection | Yes | Yes | No |
| Log downtime | Yes | Yes | No |
| Manage machines | No | No | Yes |
| Manage users | No | No | Yes |
| View service orders | No | Yes | No |

### 1.4 Login Routing

In `PinLogin.tsx`, add boss routing:
```
boss → /dashboard
```

## 2. Fleet & Team Management

### 2.1 Fleet Management Page

**Route:** `/fleet` (boss only)

**Layout:**
- Page header: "Fleet" with "Add Machine" button
- List of machine cards showing: code, name, type badge, site name, active/inactive status
- Each card has an edit button

**Add/Edit Machine Form (modal or inline):**
- Code (text input — plate number / equipment ID)
- Name (text input)
- Type (dropdown from `MACHINE_TYPES`)
- Site (dropdown from sites collection)
- Status (active/inactive toggle)
- Meter hours (number input, edit only)

**Add:** Uses `addDocument('machines', data)` with auto-increment ID. Sets `availabilityState: 'available'`, `currentMeterHours: 0`.

**Edit:** Uses `updateDocument('machines', id, data)`.

**No hard delete.** Set status to `inactive` instead.

### 2.2 Team Management Page

**Route:** `/team` (boss only, accessed from Profile page via "Manage Team" button)

**Layout:**
- Page header: "Team" with "Add User" button
- List of user cards showing: name, role badge, site name
- Each card has an edit button

**Add/Edit User Form (modal or inline):**
- Name (text input)
- PIN (text input, 4-6 digits)
- Role (dropdown: worker / supervisor)
- Site (dropdown from sites collection)

**Boss cannot add other bosses** — role dropdown only shows worker and supervisor.

**Add:** Uses `addDocument('users', data)`.

**Edit:** Uses `updateDocument('users', id, data)`.

**No delete.** Users are referenced by ID in inspections, defects, and downtime events.

### 2.3 Route Protection

Both `/fleet` and `/team` routes check `currentUser?.role === 'boss'`. Non-boss users are redirected to their home page.

## 3. Defect Card Cleanup

### 3.1 Worker/Supervisor Compact Cards

**Current card (too much info):**
```
[Critical] [Open]              2h ago
EX-301 — Komatsu PC200
Hydraulic
Oil leak detected near main cylinder...
```

**New compact card:**
```
[Critical] [Open]              2h ago
EX-301 — Komatsu PC200
```

Remove from card: category label, description text. These remain visible in the DefectDetail page when tapped.

**File:** `src/features/defects/DefectList.tsx` — modify `DefectCard` component.

### 3.2 Boss Simplified Defect List

**New component:** `BossDefectList.tsx`

**Card layout:**
```
[Critical]                 2 Apr 2026
EX-301 — Komatsu PC200
```

- Shows severity badge (not status badge — boss doesn't track workflow)
- Shows formatted date (not "time ago")
- Shows machine code and name
- **Read-only** — no tap-through to detail page
- Filter by severity only (no status filter since boss doesn't see statuses)

**Routing:** When `role === 'boss'`, the `/defects` route renders `BossDefectList` instead of `DefectList`.

## 4. Bahasa Melayu Translation

### 4.1 New Translation File

**File:** `src/i18n/translations/ms.ts`

Complete Bahasa Melayu translation of all existing keys (~100+ keys) plus new keys for fleet/team management.

### 4.2 Language Store Update

In `src/stores/app.store.ts`:
- Change type from `'en' | 'zh'` to `'en' | 'ms' | 'zh'`

### 4.3 Language Toggle Update

In `src/components/ui/LanguageToggle.tsx`:
- Change from 2 buttons to 3 buttons: `EN | BM | 中文`
- Same styling pattern, just one more button

### 4.4 Hook Update

In `src/i18n/useTranslation.ts`:
- Import `ms` translations
- Add to translations map: `{ en, ms, zh }`
- Fallback chain: current language → English → raw key

### 4.5 New Translation Keys

Keys to add across all 3 language files (en, ms, zh):

```
nav.fleet
nav.team
page.fleet
page.team
action.addMachine
action.editMachine
action.addUser
action.editUser
action.manageTeam
label.code
label.machineType
label.siteAssignment
label.userPin
label.userRole
label.inactive
role.boss
empty.fleet
empty.fleetDesc
empty.team
empty.teamDesc
toast.machineSaved
toast.machineAdded
toast.userSaved
toast.userAdded
```

## 5. Files to Modify

| File | Change |
|------|--------|
| `src/lib/constants.ts` | Add `boss` to `USER_ROLES` |
| `src/db/schemas/user.schema.ts` | Update role type to include `boss` |
| `src/db/seed.ts` | Add Dato' Chai seed user |
| `src/components/ui/BottomNav.tsx` | Add boss tab config |
| `src/components/ui/LanguageToggle.tsx` | 3-way toggle |
| `src/stores/app.store.ts` | Add `ms` to language type |
| `src/i18n/useTranslation.ts` | Import ms translations |
| `src/i18n/translations/ms.ts` | **NEW** — full BM translations |
| `src/i18n/translations/en.ts` | Add new keys |
| `src/i18n/translations/zh.ts` | Add new keys |
| `src/features/defects/DefectList.tsx` | Compact cards |
| `src/features/defects/BossDefectList.tsx` | **NEW** — simplified boss view |
| `src/features/fleet/FleetPage.tsx` | **NEW** — fleet management |
| `src/features/team/TeamPage.tsx` | **NEW** — team management |
| `src/features/auth/PinLogin.tsx` | Boss login routing |
| `src/features/profile/ProfilePage.tsx` | "Manage Team" button for boss |
| `src/app/routes.tsx` | Add fleet, team, boss defect routes |

## 6. Verification

1. **Boss login:** PIN 888888 → lands on dashboard
2. **Boss nav:** 5 tabs visible (Dashboard, Availability, Defects, Fleet, Profile)
3. **Fleet page:** Can add a new machine, edit existing machine name/code
4. **Team page:** Can add a new user, edit existing user
5. **Boss defects:** Shows simplified read-only cards with severity + date + machine
6. **Worker defects:** Shows compact cards (severity + status + time + machine, no description/category)
7. **Language toggle:** 3 buttons on login and profile, BM translations display correctly
8. **Build:** `npm run build` passes with no errors
