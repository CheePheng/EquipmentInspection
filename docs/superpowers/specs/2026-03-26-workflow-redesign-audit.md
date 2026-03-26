# CCT FieldOps — Workflow Redesign & Premium Upgrade Audit

**Date:** 2026-03-26
**Context:** CCT PGL timber harvesting. Only 2 roles: Worker + Supervisor. No in-house mechanics. External repair/service only.

---

## A. Current Repo Audit

### Stack
- React 19 + TypeScript 5.9 + Vite 8 + Tailwind CSS 4.2
- Dexie 4 (IndexedDB) — offline-first local storage
- Zustand 5 — state management (auth, app, toast stores)
- Framer Motion 12 — animations
- Recharts 3 — dashboard charts
- vite-plugin-pwa 1.2 — service worker + installable app
- GitHub Pages deployment with SPA 404.html fallback
- PIN-based auth (no passwords, no server)

### Structure
- 79 TypeScript files, 23 UI components, 9 feature modules
- 14 IndexedDB tables across 8 Zod schemas
- Role-based routing with guards (operator, mechanic, supervisor)
- Seed data: 3 sites, 8 users, 18 machines (South African timber context)

### Current Strengths
- **Offline-first architecture is solid** — Dexie + service worker + local-only data works perfectly for field use
- **Dark theme is already polished** — 6-tier depth system, amber/gold accent, JetBrains Mono for data, shadow tokens, glow effects
- **Component library is mature** — Card tier system (data/status/hero/action), animated KpiCard, ProgressBar, AlertBanner, Skeleton loaders
- **Animation quality is high** — Spring physics, staggered lists, page transitions, respects prefers-reduced-motion
- **Photo capture works** — Auto-compression to 0.4MB, blob storage, camera capture on mobile
- **Inspection flow is well-designed** — Template-based checklists, progress bar, completion celebration, fail-to-defect linking
- **PWA setup is correct** — Standalone mode, portrait lock, maskable icons, GitHub Pages compatible

### Current Weaknesses
1. **Three-role model is wrong** — System has `operator`, `mechanic`, `supervisor` but your business only has Worker + Supervisor
2. **Mechanic features are dead weight** — `/repairs`, `/repairs/:id`, `/maintenance`, `/maintenance/:id` are inaccessible without mechanics
3. **Repair workflow assumes in-house work** — Claim task → assign mechanic → work notes → parts tracking → mark fixed. None of this applies when you send machines out
4. **No external repair/service tracking** — No way to record "sent to workshop X on date Y, expected back date Z"
5. **Defect status changes locked to mechanic/supervisor** — Workers can't see status updates on issues they reported
6. **No Chinese language support** — All UI is English-only
7. **Maintenance module is mechanic-gated** — Supervisors can access it, but the UX assumes a mechanic doing the work
8. **No worker-facing history** — Workers can't see their own past inspections or reported defects
9. **Seed data is South African** — Names and sites should be Malaysian/CCT-specific
10. **Dashboard is supervisor-only** — Workers get no summary view at all

### What Feels Generic
- Login screen is functional but plain (just a PIN pad, no branding)
- Profile page is basic (initials avatar, minimal stats)
- Settings page is a flat list of reference data
- Defect list cards lack visual hierarchy for urgency
- Downtime history is a simple chronological list with no analytics

### What Already Works Well
- Machine list + detail + availability board — solid fleet overview
- Inspection form — fast, practical, template-based
- Defect reporting with photos — captures what happened in the field
- Downtime logging — simple reason code + notes
- Card tier system + KPI cards — premium visual quality
- Bottom navigation — role-aware, compact, functional

---

## B. What No Longer Fits Our Real Workflow

### Remove Entirely
| Feature | Why |
|---------|-----|
| `mechanic` role | You don't have in-house mechanics |
| `/repairs` Work Queue | No one internally claims/works repairs |
| `/repairs/:id` Repair Detail | No in-house repair notes/parts tracking |
| Repair `claimRepair()` / `addRepairNote()` | Mechanic workflow functions |
| `RepairAction[]` audit trail | Internal mechanic action history |
| Mechanic bottom nav tabs | Dead navigation |
| Mechanic-specific route guards | Blocking access incorrectly |

### Simplify
| Feature | Change |
|---------|--------|
| Defect status flow | Remove mechanic-driven statuses. Supervisor decides: acknowledge → send out / defer / resolve |
| Maintenance module | Remove mechanic gate. Supervisor records service completions. Rename to "Service Schedule" |
| Repair schema | Replace with "Service Order" schema for external tracking |
| Role names | Rename `operator` → `worker` throughout |

### Replace With External Repair Tracking
The current repair workflow (claim → assign → work → fix) should become:
1. Supervisor reviews defect
2. Supervisor decides machine status (restrict / unavailable / send out)
3. If sending out: create Service Order with workshop name, date sent, expected return
4. When machine returns: Supervisor records return, confirms ready for service

---

## C. Revised Worker + Supervisor Product Model

### Worker Flow
```
Login (PIN) → My Machine (shortcut) → Pre-Start Inspection
                                     → Report Issue (defect + photo)
                                     → Log Downtime
                                     → View Machine Status (available/restricted/unavailable)
                                     → View My History (inspections, issues reported)
```

### Supervisor Flow
```
Login (PIN) → Dashboard (KPIs, alerts, trends)
            → Machine Fleet (list, detail, availability board)
            → Review Issues (unresolved defects, triage)
            → Manage Machine Status (change availability state)
            → Service Orders (send out, track, receive back)
            → Service Schedule (upcoming due dates)
            → Downtime Analytics
            → Settings (templates, users, language, data)
```

### Key Workflow: Machine Broken → Send Out → Return

```
Worker reports defect with photo
  ↓
Supervisor sees alert on dashboard
  ↓
Supervisor opens defect → reviews severity + photos
  ↓
Supervisor decides:
  ├── "Continue Use" → acknowledge, keep available
  ├── "Restrict Use" → mark restricted, add note
  ├── "Take Offline" → mark unavailable
  └── "Send for Service" → create Service Order
        ↓
        Enter: workshop/vendor, date sent, expected return, notes
        ↓
        Machine status → "Out for Service"
        ↓
        (Time passes — machine at external workshop)
        ↓
        Supervisor marks "Returned"
        ↓
        Enter: actual return date, repair summary, cost (optional)
        ↓
        Supervisor confirms "Ready for Service"
        ↓
        Machine status → "Available"
        ↓
        Worker sees machine is back and available
```

---

## D. Best MVP Scope Now

### Must Have (MVP)
1. **PIN Login** with Worker / Supervisor roles
2. **Machine List** with site filtering + search
3. **Machine Detail** with hero card, status, timeline, actions
4. **Pre-Start Inspection** — template-based checklist with progress bar
5. **Issue Reporting** — severity, category, description, photo, safe-to-operate flag
6. **Downtime Logging** — reason code, start/stop, notes
7. **Availability Board** — machines grouped by status with sticky summary
8. **Supervisor Dashboard** — KPIs, alerts, charts
9. **Issue Triage** — supervisor reviews issues, decides machine status
10. **Service Orders** — send out, track, receive back (external repair)
11. **Service Schedule** — upcoming due dates for preventive maintenance
12. **Language Toggle** — EN / 中文 (Simplified Chinese, offline)
13. **Worker History** — my inspections, my reported issues

### Nice to Have (Phase 2)
14. Service cost tracking per machine
15. Export data (CSV/JSON backup)
16. Downtime analytics dashboard
17. Machine QR code scanning for quick identification
18. Push notification stubs (for future backend)
19. Multi-photo annotations
20. Inspection template editor (supervisor)

### Not Worth Building
- Internal repair queue / work assignment
- Parts inventory tracking
- Mechanic skill matrix
- Real-time GPS tracking
- Complex approval chains
- Invoice/billing integration

---

## E. Page-by-Page UX Improvements

### Login Screen
- **Working:** PIN pad is fast and simple
- **Weak:** No branding, no company identity, generic feel
- **Improve:** Add CCT PGL logo/wordmark at top, add "Equipment Inspection" subtitle, add language toggle (EN/中文) in corner
- **Premium touch:** Subtle amber glow behind logo, smooth PIN dot animation

### Worker Home / Machine List
- **Working:** Site filter, machine cards, status indicators
- **Weak:** "Today's Machine" is easy to miss, no summary of fleet status for workers
- **Improve:** Make "Today's Machine" a prominent hero card at top. Add quick-glance: "3 machines available, 1 restricted" summary strip
- **Simplify:** Workers don't need availability board link in nav — just their assigned machines and status
- **Premium touch:** Card press animations, staggered list entry

### Machine Detail
- **Working:** Hero section with stat strip, date-grouped timeline, 2-col action grid
- **Weak:** No machine photo/icon, no service history summary, no "last inspection" quick view
- **Improve:** Add machine type icon (harvester silhouette, etc). Show last inspection date + result badge. Show active service order banner if machine is out for service
- **Premium touch:** Hero card with subtle gradient, status glow ring

### Inspection Flow
- **Working:** Progress bar, checklist with pass/fail/NA, completion celebration
- **Weak:** No way to review past inspections. No "compared to yesterday" context
- **Improve:** Add "Previous Result" indicator on each checklist item (was it pass/fail last time?). Add inspection history on machine detail
- **Simplify:** Keep the form exactly as-is — it's already fast for field use
- **Premium touch:** Haptic-style micro-animations on pass/fail tap (already has scale-0.98)

### Issue Reporting (Defect)
- **Working:** Severity, category, photo, safe-to-operate flag
- **Weak:** Category grid is 10 items on 2 columns = lots of scrolling. Description is optional but often needed
- **Improve:** Add "Quick Issue" mode — severity + photo + one-line description. Full form for detailed reports. Pre-fill machine from context
- **Premium touch:** Camera opens directly on tap (already works via capture="environment")

### Downtime Logging
- **Working:** Reason codes, start/stop, active timer
- **Weak:** No connection to defects (downtime often caused by a defect). History view is flat
- **Improve:** Optional "linked issue" — if logging downtime because of a defect, link them. Show downtime stats on machine detail (total hours this month)
- **Premium touch:** Active downtime pulsing timer animation

### Supervisor Dashboard
- **Working:** 2×2 KPI grid, alert banner, charts, quick actions
- **Weak:** Charts are small on mobile. Quick actions could be more prominent
- **Improve:** Add "Machines Out for Service" KPI. Add "Unresolved Issues" count. Make charts swipeable or tabbed on mobile
- **Premium touch:** Animated number counters (already has spring animation on KpiCard)

### Availability Board
- **Working:** Status groups, sticky summary, site filter
- **Weak:** No "Out for Service" group. Machine cards don't show enough context
- **Improve:** Add "Out for Service" status group (amber/orange). Show days since sent out. Add tap to change machine status directly from board
- **Premium touch:** Status group headers with colored left border (already exists)

### Service Orders (NEW — replaces Repairs)
- **Design:** List of active/completed service orders. Each shows: machine, workshop, date sent, expected return, status
- **Workflow:** Create from defect triage or machine detail → track → receive → confirm
- **Premium touch:** Timeline view of service order lifecycle

### Service Schedule (replaces Maintenance)
- **Design:** List of upcoming service due dates, sorted by urgency (overdue first)
- **Simplify:** Remove mechanic assignment. Supervisor records completion
- **Premium touch:** Color-coded urgency (red overdue, amber due soon, green ok)

### Settings / Language
- **Working:** Data management, template list, user list
- **Weak:** Flat, boring, no hierarchy
- **Improve:** Group into sections with headers. Add language toggle prominently. Add "About" section with version + PWA status
- **Premium touch:** Section cards with subtle elevation

---

## F. Visual Redesign Directions

### Direction 1: "Forged Steel" — Industrial Luxury
- **Mood:** Heavy machinery meets precision engineering. Think Caterpillar equipment catalog meets Apple design
- **Palette:** Current dark obsidian base, but with steel blue-gray accents alongside amber/gold. Metallic sheen effects on hero cards
- **Typography:** Keep Inter + JetBrains Mono. Add heavier weight headers (800). Machine codes in all-caps tracking-widest
- **Surfaces:** Brushed-metal inspired card borders. Subtle grain texture on hero cards. Chamfered/beveled shadow edges
- **Motion:** Mechanical feel — precise easing, no bounce. Sliding panels like equipment displays
- **Luxurious:** Machine detail hero feels like a technical data sheet from a premium manufacturer
- **Utility-first:** Inspection form stays clean and fast. Status colors stay bold and readable outdoors

### Direction 2: "Night Operations" — Military-Grade Precision
- **Mood:** Night-vision operations center. Think modern military HUD meets field operations
- **Palette:** True black (#000) base with dark green (#0A1A0A) tints. Amber stays for primary. Green scan-lines on data displays
- **Typography:** Mono-heavy — use JetBrains Mono more broadly. Stencil-style section headers. Data-dense but readable
- **Surfaces:** Minimal borders, max contrast. Cards have hairline green borders. Data displayed in tight grids
- **Motion:** Minimal — quick fades, no spring physics. Clinical precision
- **Luxurious:** Dashboard feels like a command center. Availability board feels like fleet tracking
- **Utility-first:** Everything optimized for speed and glanceability. Zero decoration

### Direction 3: "Engineered Precision" — Current Direction Refined (RECOMMENDED)
- **Mood:** The current dark/amber theme taken to its full potential. Linear/Vercel/Raycast inspired but for industrial field ops
- **Palette:** Keep the obsidian → slate-dark → elevated depth system. Refine amber to slightly warmer gold. Status colors stay saturated
- **Typography:** Current Inter + JetBrains Mono is perfect. Refine spacing — tighter in data, more generous in hero areas
- **Surfaces:** Current card tier system is already excellent. Add subtle inner glow on hero cards. Refine border-subtle usage
- **Motion:** Current spring + easeOut system is already premium. Add micro-interactions on status changes. Celebrate completions
- **Luxurious:** KPI cards with animated numbers, hero sections with stat strips, date-grouped timelines
- **Utility-first:** Inspection form is fast. Bottom nav is compact. Cards are pressable with haptic-scale feedback

### Recommendation: Direction 3 — "Engineered Precision"
**Why:** You've already built 80% of this direction with the recent premium upgrade (Tasks 1-16). The foundation is excellent. What's needed now is:
1. Fix the workflow (remove mechanic, add service orders)
2. Add Chinese translation
3. Polish remaining rough edges (login, profile, settings, worker home)
4. Add the missing features (service orders, worker history)

Rebuilding the visual direction would waste the excellent work already done. Instead, extend it to the new pages and refine the existing ones.

---

## G. Chinese Language Toggle Strategy

### Recommendation: Simplified Chinese (简体中文)
**Why:** CCT PGL operates in timber harvesting — the workforce likely includes Chinese-speaking workers in Malaysia/Southeast Asia where Simplified Chinese is standard. If your workers are from Taiwan/Hong Kong, switch to Traditional.

### Technical Approach: Static JSON Translation Files
```
src/
  i18n/
    en.json       # English strings
    zh.json       # Simplified Chinese strings
    useTranslation.ts  # React hook
    TranslationProvider.tsx  # Context provider
```

**Why this approach:**
- Zero runtime dependencies (no i18next, no react-intl)
- Works 100% offline
- Tiny bundle size (~10-15KB for both language files)
- GitHub Pages friendly
- Type-safe with TypeScript

### Implementation
- **Hook:** `const { t } = useTranslation()` — returns translated string by key
- **Storage:** Language preference saved in Zustand store → persisted to localStorage
- **Switching:** Instant — no page reload, React re-renders with new strings
- **Fallback:** If key missing in Chinese, fall back to English

### Language Toggle Placement
- **Primary:** Profile page — prominent toggle near top
- **Secondary:** Login screen — small toggle in top-right corner (so workers can switch before logging in)
- **Design:** Pill-shaped segmented control: `EN | 中文` — matches existing SegmentedControl component style
- **Animation:** Smooth crossfade on text change (150ms)

### What Gets Translated
- All navigation labels (Machines, Defects, Downtime, Dashboard, etc.)
- All status labels (Available, Restricted, Unavailable, Out for Service, etc.)
- All form labels, placeholders, validation messages
- All button text (Submit, Cancel, Back, etc.)
- All dashboard KPI labels and chart labels
- All severity/category/reason code labels
- All empty state messages
- All confirmation dialogs

### What Does NOT Get Translated
- User-entered free text (descriptions, notes)
- Machine codes (HV-001 stays HV-001)
- Machine names (entered by users)
- Workshop/vendor names
- Dates and numbers (formatted per locale)

### Estimated String Count
- ~200-250 translation keys for full coverage
- Manageable for a single translator to produce

---

## H. GitHub Hosting / Static Deployment

### Already Working
- `base: '/EquipmentInspection/'` configured in Vite
- Router basename set correctly
- 404.html SPA fallback in place
- GitHub Actions workflow deploys on push to main
- PWA manifest scope and start_url set correctly
- Service worker caches all static assets

### No Issues Expected
- Translation JSON files bundle into JS — no server needed
- Photos stored in IndexedDB — no server storage needed
- All data is local-first — no API calls
- Font files self-hosted via @fontsource packages

### Minor Concerns
- **Icon diversity:** Currently only 1 SVG icon. PWA should have multiple sizes (192, 512 PNG) for better install prompts on Android. Can generate from SVG
- **Storage quota:** IndexedDB has ~50MB soft limit on some browsers. Photo storage could hit this with heavy use. Already has monitoring (warns at 500MB) but should warn earlier for mobile
- **Cache busting:** Vite handles this with content hashing. No issues

### Recommendation
The current deployment setup is clean. No changes needed for the workflow redesign. Translation files will bundle into JS chunks automatically.

---

## I. Prioritized Upgrade Roadmap

### Phase 1: Quick Wins (1-2 days)
| # | Item | Impact | Complexity |
|---|------|--------|------------|
| 1 | Rename `operator` → `worker` throughout code | Aligns with real roles | Low |
| 2 | Remove mechanic role, routes, and bottom nav tabs | Removes dead features | Low |
| 3 | Move maintenance access to worker + supervisor (remove mechanic gate) | Unlocks service schedule | Low |
| 4 | Add language toggle UI (EN/中文 pill) on login + profile | Visible feature | Low |
| 5 | Upgrade login screen with CCT branding + language toggle | First impression | Low |
| 6 | Add worker home summary ("Your machine is available") | Worker context | Low |

### Phase 2: High-Impact Upgrades (3-5 days)
| # | Item | Impact | Complexity |
|---|------|--------|------------|
| 7 | Build i18n system (useTranslation hook + JSON files) | Chinese support | Medium |
| 8 | Translate all UI strings to Simplified Chinese | Full bilingual app | Medium |
| 9 | Replace Repair module with Service Order module | Correct workflow | Medium |
| 10 | Add "Out for Service" machine status + availability state | Track external repairs | Medium |
| 11 | Add supervisor triage flow (review issue → decide machine status → create service order) | Core supervisor workflow | Medium |
| 12 | Add worker history view (my inspections, my issues) | Worker self-service | Low-Medium |
| 13 | Add "Restricted" machine status (can operate with caution) | Real-world nuance | Low |

### Phase 3: Premium Polish (2-3 days)
| # | Item | Impact | Complexity |
|---|------|--------|------------|
| 14 | Service order timeline view (sent → in workshop → returned → cleared) | Visual workflow | Medium |
| 15 | Machine type icons (harvester, forwarder, etc. silhouettes) | Visual identity | Low |
| 16 | Previous inspection result indicators on checklist items | Inspection context | Low-Medium |
| 17 | Linked downtime-to-defect tracking | Data connection | Low |
| 18 | Upgrade profile page (richer stats, language toggle, role badge) | Polish | Low |
| 19 | Upgrade settings page (grouped sections, better hierarchy) | Polish | Low |
| 20 | Update seed data to Malaysian/CCT context | Realism | Low |

### Phase 4: Optional Future
| # | Item | Impact | Complexity |
|---|------|--------|------------|
| 21 | Data export (CSV/JSON backup) | Data portability | Medium |
| 22 | Machine QR code scanning | Speed up machine selection | Medium |
| 23 | Downtime analytics dashboard | Trend visibility | Medium |
| 24 | Service cost tracking per machine | Financial visibility | Low |
| 25 | PWA icon set (multiple sizes for Android/iOS) | Better install experience | Low |
| 26 | Inspection template editor (supervisor) | Self-service config | High |

---

## J. Proposed Status & Terminology

### Machine Status (6 states → 7 states)
| Status | Label (EN) | Label (中文) | Color | Meaning |
|--------|-----------|-------------|-------|---------|
| `available` | Available | 可用 | Green | Ready for operation |
| `restricted` | Restricted | 限制使用 | Amber | Can operate with caution |
| `inspection-due` | Service Due | 待保养 | Amber | Preventive maintenance upcoming |
| `unavailable` | Unavailable | 不可用 | Red | Cannot operate, on-site |
| `out-for-service` | Out for Service | 外修中 | Orange | Sent to external workshop |
| `down` | Down | 停机 | Red | Active downtime event |
| `decommissioned` | Decommissioned | 已报废 | Gray | Permanently removed |

### Issue Severity (keep current 4)
| Level | EN | 中文 |
|-------|-----|------|
| `critical` | Critical | 严重 |
| `high` | High | 高 |
| `medium` | Medium | 中 |
| `low` | Low | 低 |

### Issue State (simplified from current)
| State | EN | 中文 | Meaning |
|-------|-----|------|---------|
| `open` | Open | 待处理 | Newly reported |
| `acknowledged` | Acknowledged | 已确认 | Supervisor has seen it |
| `sent-out` | Sent for Service | 已送修 | Linked to service order |
| `resolved` | Resolved | 已解决 | Fixed (externally or otherwise) |
| `deferred` | Deferred | 暂缓 | Not addressing now |

### Service Order State
| State | EN | 中文 | Meaning |
|-------|-----|------|---------|
| `pending` | Pending Pickup | 待送出 | Created, not yet sent |
| `in-service` | In Service | 维修中 | At external workshop |
| `returned` | Returned | 已归还 | Back on-site, not cleared |
| `completed` | Completed | 已完成 | Cleared for service |
| `cancelled` | Cancelled | 已取消 | Order cancelled |

### Downtime Reason Codes (simplified from 12 to 8)
| Code | EN | 中文 |
|------|-----|------|
| `mechanical` | Mechanical Failure | 机械故障 |
| `hydraulic` | Hydraulic Issue | 液压故障 |
| `electrical` | Electrical Issue | 电气故障 |
| `tire-track` | Tire / Track | 轮胎/履带 |
| `waiting-parts` | Waiting for Parts | 等待零件 |
| `scheduled-service` | Scheduled Service | 计划保养 |
| `weather-access` | Weather / Access | 天气/道路 |
| `other` | Other | 其他 |

Removed: `operator-issue`, `fuel-fluid`, `safety-hold` — these are either rare or can be covered by `other` + notes.

---

## K. Final Verdict

### How Upgradeable: 9/10
The codebase is exceptionally well-structured. The component library, design token system, and animation framework are already premium-grade. The data model is clean and extensible. Adding service orders and i18n is straightforward.

### Can It Become Premium: Yes, Absolutely
It's already 70-80% there visually. The dark theme, card tiers, KPI animations, and shadow system are polished. What's needed is:
- Fix the workflow to match reality (remove mechanic, add service orders)
- Add Chinese support
- Polish the remaining rough pages (login, profile, settings)
- Add the missing features (service orders, worker history, restricted status)

### Best Direction
**"Engineered Precision" (Direction 3)** — extend the current visual direction, don't rebuild. Focus effort on:
1. Workflow correctness (mechanic → external service)
2. Chinese translation (real feature, not afterthought)
3. Feature gaps (service orders, worker history, restricted status)
4. Remaining polish (login branding, settings hierarchy, seed data)

### Best Next Step Before Coding
1. **Approve this audit** — confirm the workflow changes make sense for CCT PGL
2. **Confirm Simplified Chinese** — vs Traditional, based on your workforce
3. **Write implementation plan** — prioritized task list based on the roadmap above
4. **Execute Phase 1 first** — quick wins that immediately fix the role model and add visible features
