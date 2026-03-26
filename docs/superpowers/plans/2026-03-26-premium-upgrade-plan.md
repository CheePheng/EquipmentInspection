# CCT FieldOps Premium Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade CCT FieldOps from a functional prototype (premium feel 2/5) to a polished premium product (4/5) by expanding the design system, upgrading components, redesigning key pages, and enabling GitHub Pages deployment.

**Architecture:** Progressive enhancement of existing codebase. No rewrites. Expand CSS design tokens first, then upgrade components to use them, then redesign page compositions. All changes are additive to the existing Tailwind + Framer Motion + Dexie stack.

**Tech Stack:** React 19 + TypeScript | Tailwind CSS 4.2 | Framer Motion 12 | Vite 8 | Dexie 4 | Recharts 3 | Lucide React | @fontsource/jetbrains-mono (new)

**Spec:** `docs/superpowers/specs/2026-03-26-premium-upgrade-audit.md`

---

## File Map

### New Files
- `src/lib/motion.ts` — shared animation variants and transitions
- `src/lib/chart-theme.ts` — shared chart colors, tooltip styles, gradient defs
- `src/components/ui/Skeleton.tsx` — skeleton loading component
- `src/components/ui/ProgressBar.tsx` — progress bar for inspections
- `src/components/ui/AlertBanner.tsx` — critical alert banner for dashboard
- `src/components/ui/SiteFilterBar.tsx` — extracted site filter chips
- `src/components/ui/ErrorBoundary.tsx` — error boundary wrapper
- `public/404.html` — SPA fallback for GitHub Pages
- `.github/workflows/deploy.yml` — GitHub Pages deployment

### Modified Files
- `src/styles/index.css` — expanded design tokens (shadows, backgrounds, typography, gradients)
- `src/components/ui/Card.tsx` — add tier variants (data/status/hero/action)
- `src/components/ui/KpiCard.tsx` — upgrade to hero-card styling with mono font
- `src/components/ui/EmptyState.tsx` — richer styling
- `src/components/ui/Button.tsx` — add gradient-primary variant
- `src/features/dashboard/SupervisorDashboard.tsx` — 2×2 KPI grid + alert band + chart refinements
- `src/features/machines/MachineList.tsx` — use SiteFilterBar, add search
- `src/features/machines/MachineDetail.tsx` — hero section + stat strip
- `src/features/machines/AvailabilityBoard.tsx` — use SiteFilterBar, sticky summary
- `src/features/inspections/InspectionForm.tsx` — progress bar + completion screen
- `src/app/routes.tsx` — wrap routes in ErrorBoundary
- `vite.config.ts` — add base path for GitHub Pages
- `index.html` — fix asset paths
- `package.json` — add @fontsource/jetbrains-mono

---

## Phase 1: Foundation — Design Tokens & Infrastructure

### Task 1: GitHub Pages Deployment Setup

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/app/routes.tsx`
- Create: `public/404.html`
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Add `base` to vite.config.ts**

Add `base: '/EquipmentInspection/',` to the defineConfig object (top level, alongside `plugins`). Also update VitePWA manifest: add `start_url: '/EquipmentInspection/'` and `scope: '/EquipmentInspection/'`.

- [ ] **Step 2: Add basename to React Router**

In `src/app/routes.tsx`, change `createBrowserRouter([...])` to `createBrowserRouter([...], { basename: '/EquipmentInspection' })`.

- [ ] **Step 3: Create 404.html for SPA fallback**

Create `public/404.html` — a minimal HTML file with a JS redirect script that preserves the path. This is the standard GitHub Pages SPA trick that redirects all 404s back to index.html with the original path encoded as a query parameter.

- [ ] **Step 4: Create GitHub Actions workflow**

Create `.github/workflows/deploy.yml` — standard Vite build + GitHub Pages deploy using `actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4`. Triggers on push to main.

- [ ] **Step 5: Test build locally**

Run: `npm run build && npx vite preview --base /EquipmentInspection/`
Verify: app loads, routes work, assets load, manifest is correct.

- [ ] **Step 6: Commit**

```bash
git add vite.config.ts src/app/routes.tsx public/404.html .github/workflows/deploy.yml
git commit -m "feat: add GitHub Pages deployment with SPA fallback and base path"
```

---

### Task 2: Expand Design Tokens in CSS

**Files:**
- Modify: `src/styles/index.css`
- Modify: `package.json` (add @fontsource/jetbrains-mono)

- [ ] **Step 1: Install JetBrains Mono font**

Run: `npm install @fontsource/jetbrains-mono`

- [ ] **Step 2: Expand index.css with full design token system**

Keep all existing tokens but expand with:
- **Backgrounds:** Add `obsidian-light` (#131A22), `elevated-high` (#2D3F54), `surface` (#354A61), `border-subtle` (#1E293B)
- **Accent:** Refine amber to warmer gold (#F5A623), add `amber-wash` (0.08 opacity)
- **Status:** Richer saturated status colors (#34D399, #F87171, #FBBF24, #60A5FA)
- **Shadows:** Add `--shadow-sm`, `--shadow-md`, `--shadow-lg`, glow variants for critical/gold/available
- **Typography:** Add `--font-family-mono: "JetBrains Mono"` and import JetBrains Mono 600+700 weights

- [ ] **Step 3: Verify build compiles**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/styles/index.css package.json package-lock.json
git commit -m "feat: expand design tokens — shadows, backgrounds, gold accent, mono font"
```

---

### Task 3: Shared Motion Tokens

**Files:**
- Create: `src/lib/motion.ts`

- [ ] **Step 1: Create shared animation variants file**

Create `src/lib/motion.ts` with reusable Framer Motion constants: `pageTransition`, `listVariants`, `cardVariants`, `fadeIn`, `slideUp`, `microBounce`. These replace the copy-pasted variants in MachineList, AvailabilityBoard, and other pages.

- [ ] **Step 2: Commit**

```bash
git add src/lib/motion.ts
git commit -m "feat: add shared motion tokens for consistent animations"
```

---

### Task 4: Shared Chart Theme

**Files:**
- Create: `src/lib/chart-theme.ts`

- [ ] **Step 1: Create chart theme file**

Extract hardcoded chart colors from `SupervisorDashboard.tsx:32-63` into `src/lib/chart-theme.ts`. Export: `chartColors`, `severityChartColors`, `tooltipStyle`, `axisStyle`, `gridStyle`. All values reference the design token hex values as a single source of truth.

- [ ] **Step 2: Commit**

```bash
git add src/lib/chart-theme.ts
git commit -m "feat: add shared chart theme for consistent data visualization styling"
```

---

## Phase 2: Component Library Upgrades

### Task 5: Card Tier System

**Files:**
- Modify: `src/components/ui/Card.tsx`

- [ ] **Step 1: Add tier variants to Card**

Expand the Card component with a `tier` prop: `'data' | 'status' | 'hero' | 'action'`.
- `data` (default): current style + new shadow-sm
- `status`: colored left border + faint background tint, shadow-sm
- `hero`: elevated-high bg, shadow-md, optional gradient top-edge glow
- `action`: pressable with hover lift (translateY -1px), border brightening, shadow transition
- Add `compact` prop for reduced padding (replaces `!py-3` overrides)
- Keep all existing props (accent, pressable, onClick, className) working

- [ ] **Step 2: Verify existing Card usages still work**

Run: `npm run build`
Expected: No breakage — all existing Card usages default to `tier="data"`.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Card.tsx
git commit -m "feat: add card tier system — data, status, hero, action variants"
```

---

### Task 6: Upgrade KpiCard with Mono Font and Hero Styling

**Files:**
- Modify: `src/components/ui/KpiCard.tsx`

- [ ] **Step 1: Upgrade KpiCard styling**

- Change the number display to use `font-mono` (JetBrains Mono) with `text-3xl font-bold`
- Add `shadow-md` to the card wrapper
- Add a subtle top gradient border in the status color (1px gradient line at top)
- Add a `trend` optional prop: `'up' | 'down' | 'flat'` to show ↑/↓/— arrows
- Add a `suffix` prop for "%" display (to replace the hand-built inspection rate card)

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/KpiCard.tsx
git commit -m "feat: upgrade KpiCard with mono font, hero styling, and trend indicators"
```

---

### Task 7: Skeleton Loader Component

**Files:**
- Create: `src/components/ui/Skeleton.tsx`

- [ ] **Step 1: Create Skeleton component**

Build a `Skeleton` component with props: `variant: 'text' | 'card' | 'circle' | 'kpi'`, `width`, `height`, `count` (for rendering multiple lines). Uses a CSS shimmer animation on `bg-elevated` base with a subtle lighter pulse. Include compound variants: `Skeleton.Card` (card-shaped), `Skeleton.KpiRow` (row of 4 KPI skeletons).

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Skeleton.tsx
git commit -m "feat: add Skeleton loader component for premium loading states"
```

---

### Task 8: ProgressBar Component

**Files:**
- Create: `src/components/ui/ProgressBar.tsx`

- [ ] **Step 1: Create ProgressBar component**

Props: `value: number` (0-100), `color: 'gold' | 'green' | 'red' | 'blue'`, `size: 'sm' | 'md'`, `showLabel: boolean`. Renders a rounded bar with animated fill (Framer Motion layout animation). Background is `bg-elevated`, fill uses status colors with subtle gradient.

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/ProgressBar.tsx
git commit -m "feat: add ProgressBar component for inspection and maintenance progress"
```

---

### Task 9: AlertBanner Component

**Files:**
- Create: `src/components/ui/AlertBanner.tsx`

- [ ] **Step 1: Create AlertBanner component**

Props: `severity: 'critical' | 'warning' | 'info'`, `title: string`, `description?: string`, `action?: { label, onClick }`, `onDismiss?: () => void`. Full-width banner with status-colored left border, subtle background tint, icon, and optional action button. Uses shadow-glow-critical for critical severity.

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/AlertBanner.tsx
git commit -m "feat: add AlertBanner component for dashboard critical alerts"
```

---

### Task 10: SiteFilterBar Component (Extract)

**Files:**
- Create: `src/components/ui/SiteFilterBar.tsx`
- Modify: `src/features/machines/MachineList.tsx`
- Modify: `src/features/machines/AvailabilityBoard.tsx`

- [ ] **Step 1: Create SiteFilterBar component**

Extract the site filter chips pattern from MachineList.tsx:42-70 into a shared component. Props: `sites`, `selectedSiteId`, `onSelectSite`. Uses existing amber-primary active style and elevated inactive style.

- [ ] **Step 2: Replace inline chips in MachineList**

Replace lines 42-70 in MachineList.tsx with `<SiteFilterBar />`.

- [ ] **Step 3: Replace inline chips in AvailabilityBoard**

Replace lines 118-146 in AvailabilityBoard.tsx with `<SiteFilterBar />`.

- [ ] **Step 4: Verify both pages work**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/SiteFilterBar.tsx src/features/machines/MachineList.tsx src/features/machines/AvailabilityBoard.tsx
git commit -m "refactor: extract SiteFilterBar component from MachineList and AvailabilityBoard"
```

---

### Task 11: Error Boundary Component

**Files:**
- Create: `src/components/ui/ErrorBoundary.tsx`
- Modify: `src/app/routes.tsx`

- [ ] **Step 1: Create ErrorBoundary component**

Class component (React error boundaries require class components) that catches errors and renders a friendly fallback: icon, "Something went wrong" message, "Reload" button, and "Go Home" link. Styled with the dark theme.

- [ ] **Step 2: Wrap feature routes in ErrorBoundary**

In `src/app/routes.tsx`, wrap the AppShell children outlet (or individual feature groups) with `<ErrorBoundary>`.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ErrorBoundary.tsx src/app/routes.tsx
git commit -m "feat: add ErrorBoundary to prevent full-app crashes on component errors"
```

---

## Phase 3: Page-Level Upgrades

### Task 12: Dashboard Redesign — 2×2 KPI Grid + Alert Band

**Files:**
- Modify: `src/features/dashboard/SupervisorDashboard.tsx`
- Modify: `src/features/dashboard/useDashboardData.ts` (add trend data)

- [ ] **Step 1: Refactor dashboard to use shared chart theme**

Replace hardcoded `chartColors` and `severityConfig` at top of SupervisorDashboard.tsx with imports from `src/lib/chart-theme.ts`.

- [ ] **Step 2: Replace KPI horizontal scroll with 2×2 grid**

Replace the `flex gap-3 overflow-x-auto` KPI strip with a `grid grid-cols-2 gap-3` layout. All 4 KPIs visible without scrolling. Replace the hand-built inspection rate div (lines 145-172) with a proper `KpiCard` using the new `suffix="%"` prop.

- [ ] **Step 3: Add "Needs Attention" alert band**

Below the KPI grid, add an AlertBanner section that shows when `criticalDefects > 0` or `machinesDown > 0`. Uses the AlertBanner component from Task 9.

- [ ] **Step 4: Upgrade chart styling**

Apply shared chart theme: refined tooltip, minimal grid (horizontal only, 0.3 opacity), gradient fills, no visible dots (show on hover only). Add an 80% target line to compliance chart.

- [ ] **Step 5: Upgrade Quick Actions**

Replace stacked Card list with a horizontal row of icon + label + count items. More compact, more scannable.

- [ ] **Step 6: Verify dashboard renders correctly**

Run: `npm run dev` → login as supervisor (PIN 3333) → check dashboard.

- [ ] **Step 7: Commit**

```bash
git add src/features/dashboard/SupervisorDashboard.tsx src/features/dashboard/useDashboardData.ts src/lib/chart-theme.ts
git commit -m "feat: redesign supervisor dashboard — 2x2 KPI grid, alert band, refined charts"
```

---

### Task 13: Machine Detail Hero Section

**Files:**
- Modify: `src/features/machines/MachineDetail.tsx`

- [ ] **Step 1: Create hero section at top**

Replace the plain Card info section with a hero layout: larger machine name in font-semibold text-xl, machine code in `font-mono text-amber-primary`, prominent StatusIndicator, all on an `elevated-high` background with `shadow-md`. Add a stat strip below: meter hours (mono font), last inspection date, site name — as a tight horizontal row of label/value pairs.

- [ ] **Step 2: Upgrade action buttons to 2-column grid**

Replace the `flex flex-wrap gap-2` buttons with a `grid grid-cols-2 gap-3` layout. Each button is full-width within its cell, with an icon leading the label.

- [ ] **Step 3: Add date separators to timeline**

Group timeline events by date. Add "Today", "Yesterday", or formatted date headers between groups. Add a subtle left-side connecting line between timeline items.

- [ ] **Step 4: Verify machine detail page**

Run: `npm run dev` → navigate to any machine detail page → check hero, stats, timeline.

- [ ] **Step 5: Commit**

```bash
git add src/features/machines/MachineDetail.tsx
git commit -m "feat: upgrade machine detail with hero section, stat strip, and date-grouped timeline"
```

---

### Task 14: Inspection Progress Bar + Completion Screen

**Files:**
- Modify: `src/features/inspections/InspectionForm.tsx`

- [ ] **Step 1: Add progress bar to inspection form**

At the top of the form (below header), add a ProgressBar showing checked items vs total items. E.g., "5 of 12 items" with the bar at 42%. Updates live as operator checks items.

- [ ] **Step 2: Add completion screen**

After submission, instead of just a toast + redirect, show a brief success screen: animated checkmark (Framer Motion scale-up + fade), "Inspection Complete" heading, summary (machine name, items passed/failed, meter reading), and "Back to Machines" button. Auto-redirect after 3 seconds if no tap.

- [ ] **Step 3: Remove inline styles**

Replace any remaining inline `style={}` in InspectionForm.tsx with Tailwind utilities.

- [ ] **Step 4: Verify inspection flow**

Run: `npm run dev` → login as operator (PIN 1111) → start inspection → complete all items → verify progress bar and completion screen.

- [ ] **Step 5: Commit**

```bash
git add src/features/inspections/InspectionForm.tsx
git commit -m "feat: add inspection progress bar and completion celebration screen"
```

---

### Task 15: Availability Board — Sticky Summary + Refinements

**Files:**
- Modify: `src/features/machines/AvailabilityBoard.tsx`

- [ ] **Step 1: Make summary strip sticky**

Wrap the summary count strip in a `sticky top-0 z-10` container with `bg-obsidian` background and a subtle bottom border. This keeps fleet status visible while scrolling through machine groups.

- [ ] **Step 2: Upgrade machine cards to use Card tiers**

Use `Card tier="status"` for machine cards within each group (inherits the left-border color from the status group). Apply `font-mono` to machine codes and meter hours.

- [ ] **Step 3: Use shared motion tokens**

Replace local `listVariants`/`cardVariants` with imports from `src/lib/motion.ts`.

- [ ] **Step 4: Verify availability board**

Run: `npm run dev` → login as supervisor → check availability board, scroll behavior, sticky summary.

- [ ] **Step 5: Commit**

```bash
git add src/features/machines/AvailabilityBoard.tsx
git commit -m "feat: upgrade availability board with sticky summary and status card tiers"
```

---

### Task 16: Apply Shadows and Mono Font Across All Pages

**Files:**
- Modify: `src/components/ui/Card.tsx` (apply default shadow)
- Modify: `src/features/machines/MachineList.tsx` (use motion tokens)
- Modify: `src/features/machines/MachineCard.tsx` (mono font for code/hours)
- Modify: `src/components/ui/BottomNav.tsx` (add top shadow)
- Modify: `src/components/ui/Modal.tsx` (add shadow-lg)
- Modify: `src/components/ui/EmptyState.tsx` (richer styling)

- [ ] **Step 1: Add default shadow to Card**

In Card.tsx, add `shadow-[var(--shadow-sm)]` to the base card class. This gives all cards subtle depth everywhere.

- [ ] **Step 2: Apply font-mono to data displays**

In MachineCard.tsx: apply `font-mono` class to machine code and meter hours displays.
In MachineList: replace local `listVariants` with import from `src/lib/motion.ts`.

- [ ] **Step 3: Upgrade BottomNav with top shadow**

Add a subtle top shadow/border to BottomNav to visually separate it from content.

- [ ] **Step 4: Upgrade Modal with stronger shadow**

Add `shadow-[var(--shadow-lg)]` to Modal overlay content.

- [ ] **Step 5: Enrich EmptyState**

Make the icon larger (64px), add a subtle `bg-elevated` circular background behind it, increase spacing, make description text slightly larger.

- [ ] **Step 6: Verify visual changes across app**

Run: `npm run dev` → navigate through all pages, check card shadows, mono fonts, bottom nav, modals, empty states.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/Card.tsx src/features/machines/MachineList.tsx src/features/machines/MachineCard.tsx src/components/ui/BottomNav.tsx src/components/ui/Modal.tsx src/components/ui/EmptyState.tsx
git commit -m "feat: apply shadows, mono font, and enriched empty states across all components"
```

---

## Verification

After completing all tasks:

1. **Build check:** `npm run build` — must complete with zero errors
2. **Visual walkthrough:** Open `npm run dev`, test all 3 roles:
   - Operator (PIN 1111): machines → detail → inspect → defects → downtime
   - Mechanic (PIN 2222): repairs → maintenance → defects
   - Supervisor (PIN 3333): dashboard → availability → defects → settings
3. **GitHub Pages preview:** `npx vite preview --base /EquipmentInspection/` — all routes and assets work
4. **Mobile test:** Open Chrome DevTools → toggle device toolbar → test on 360×640 viewport
5. **Reduced motion:** Enable `prefers-reduced-motion` in DevTools → verify no animations play
6. **Offline test:** DevTools → Network → Offline → verify app still loads and functions
