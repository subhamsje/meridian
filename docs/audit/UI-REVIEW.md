# Meridian Workstation & Frontend — UI Review

**Audited:** 2026-11-25  
**Baseline:** Abstract 6-Pillar Standards & Institutional Financial Workstation Architecture  
**Screenshots:** Not captured (No active development server running on ports 3000 / 5173; audited via static codebase and AST inspection)  
**Scope:** `apps/web/src` (`app/page.tsx`, `app/app/page.tsx`, `app/demo/page.tsx`, components, and styles)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Rich institutional domain vocabulary, but generic "+ New" CTAs and raw fallback errors. |
| 2. Visuals | 2/4 | 20+ buttons lack `aria-label`; high visual density creates cognitive overload without clear primary focal points. |
| 3. Color | 2/4 | Over 1,200 raw hardcoded hex codes bypassing Tailwind theme tokens; WCAG AA contrast failures on micro-text. |
| 4. Typography | 2/4 | Fragmented micro-typography scale with arbitrary fractional sizes (`9px`, `9.5px`, `10px`, `10.5px`, `11px`) causing subpixel blur. |
| 5. Spacing | 3/4 | Robust desktop scroll containment and zero overflow leaks, but proliferation of arbitrary micro-paddings (`py-0.2`, `rounded-[3px]`). |
| 6. Experience Design | 2/4 | Critical silent error suppression (`.catch(() => null)`) across 8+ endpoints; no `ErrorBoundary` around complex canvas visualizations. |

**Overall: 14/24**

---

## Top 3 Priority Fixes

1. **Eliminate Silent API Error Suppression & Add Error Boundaries**  
   - *User Impact:* When sub-resources (`/stock`, `/dossier`, `/evidence`, `/documents`) fail or time out, the workstation quietly renders blank cards with no user feedback. An unhandled D3 or ReactFlow error crashes the entire app to a white screen.  
   - *Concrete Fix:* Replace `.catch(() => null)` in `apps/web/src/app/app/page.tsx` (lines 366–421) with explicit error state dispatching to show inline error cards with "Retry" triggers. Wrap canvas components (`LivingKnowledgeGraph`, `ReactFlowKnowledgeGraph`, `SimulationAnalyticsCharts`) in React `<ErrorBoundary>` boundaries.

2. **Consolidate Micro-Typography & Normalize Tailwind Theme Tokens**  
   - *User Impact:* Fractional font sizes (`9.5px`, `10.5px`, `11.5px`) create blurred rendering on standard-DPI monitors and induce eye fatigue during financial analysis. Hardcoded raw hexes (`#172B27`, `#F4F1E9`, `#D6D0C3`, `#A47B48`) prevent centralized theming and dark-mode adaptation.  
   - *Concrete Fix:* Establish a strict 4-tier type scale: Display (18–24px), Body (14px), Data/Meta (12px), Micro-Tag (11px monospace). Enforce Tailwind semantic tokens (`bg-ivory`, `text-forest`, `border-stone`, `text-brass`) across all JSX components instead of arbitrary hex bracket classes.

3. **Remediate Button Accessibility & Low-Contrast Text**  
   - *User Impact:* Screen readers and keyboard-only institutional analysts cannot discern icon-only actions (navigation drawers, modal dismissals, graph zoom triggers). Muted `#79756C` text on `#F4F1E9` background fails WCAG AA 4.5:1 contrast on micro-labels.  
   - *Concrete Fix:* Add explicit `aria-label` attributes to all icon-only `<button>` elements. Deepen the muted text color from `#79756C` (3.6:1 contrast) to `#5C5850` or `#4A463F` (5.2:1 contrast) to achieve WCAG AA compliance. Remove the incongruous electric blue styling in `globals.css` (`.liquid-glass-tab-active`).

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)
- **Strengths:**
  - High-precision domain terminology throughout: "TSMC Packaging Lead Times", "Hyperscaler Capex Concentration", "Cryptographic Provenance", "Adversarial Debate", "DuckDB In-Memory OLAP".
  - Empty states provide actionable context (e.g., `apps/web/src/app/app/page.tsx:1079`: *"No investigations found. Click 'New' to start an institutional company audit."* and line 1996: *"No documents uploaded yet. Upload SEC filings, spreadsheets, or memos to ground the specialist agents."*).
- **Gaps & Findings:**
  - `apps/web/src/app/app/page.tsx:1053`: Top header uses generic button label `+ New` rather than `New Investigation`.
  - `apps/web/src/app/app/page.tsx:286, 295`: Fallback errors display generic, unhelpful strings such as `"Authentication failed"` and `"Network error"` without advising the user on resolution steps (e.g., checking backend API availability).

### Pillar 2: Visuals (2/4)
- **Strengths:**
  - Dynamic interactive graphs (`MeridianTopology.tsx`, `LivingKnowledgeGraph.tsx`, `ReactFlowKnowledgeGraph.tsx`) create strong visual engagement.
  - Clear state tags on claims and hypotheses (Verified, Disputed, Falsified).
- **Gaps & Findings:**
  - Over 20 `<button>` elements lack `aria-label` or tooltips (e.g., lines 900, 936, 1004, 1014, 1047, 1083, 1115, 1144, 1154, 1182, 1215, 1235 in `app/page.tsx`).
  - High cognitive load: Main workstation displays up to 3 tiers of nested sub-toolbars, sidebars, and control strips simultaneously with minimal vertical breathing room.
  - Interactive tabs in `apps/web/src/app/page.tsx:310–319` lack ARIA tab semantics (`role="tab"`, `aria-selected`, `aria-controls`).

### Pillar 3: Color (2/4)
- **Strengths:**
  - Institutional palette concept (Forest Green `#172B27`, Ivory `#F4F1E9`, Brass Gold `#A47B48`, Stone `#D6D0C3`) reflects financial workstation gravitas.
- **Gaps & Findings:**
  - Extreme token bypass: Over 1,200 instances of hardcoded arbitrary hex values in JSX (`text-[#79756C]`: 360 instances, `text-[#172B27]`: 307 instances, `text-[#303633]`: 117 instances, `text-[#A47B48]`: 107 instances), completely bypassing Tailwind `@theme` variables defined in `globals.css`.
  - Contrast defect: `text-[#79756C]` on `#F4F1E9` background achieves only 3.6:1 contrast ratio, failing WCAG AA (4.5:1 minimum) for small micro-text.
  - Palette contamination: `globals.css` lines 289–295 (`.liquid-glass-tab-active`) introduces electric blue (`rgba(59, 130, 246, 0.25)` and `rgba(147, 197, 253, 0.6)`), conflicting with the warm parchment and deep forest design language.
  - Segmented control bug: `apps/web/src/app/app/page.tsx:2383` sets active state background to `bg-[#F4F1E9]` inside a parent container with `bg-[#F4F1E9]`, rendering the active button with zero contrast difference against the container.

### Pillar 4: Typography (2/4)
- **Strengths:**
  - Strong font pairing: `IBM Plex Sans` for UI chrome, `Newsreader` / `Source Serif 4` for narrative executive dossier sections, and `IBM Plex Mono` with tabular numeric features (`tnum`) for financial data grids.
- **Gaps & Findings:**
  - Typographic fragmentation: 7+ arbitrary micro font sizes in use (`text-[9px]`: 51, `text-[9.5px]`: 3, `text-[10px]`: 306, `text-[10.5px]`: 12, `text-[11px]`: 92, `text-[11.5px]`: 2).
  - Subpixel blur: Fractional pixel definitions (`9.5px`, `10.5px`, `11.5px`) cause anti-aliasing artifacts on standard non-Retina displays.
  - Legibility threshold: `text-[9px]` is too small for sustained analytical reading.

### Pillar 5: Spacing (3/4)
- **Strengths:**
  - Clean application shell containment (`app-shell`, `panel-scroll`, `viewport-fixed` in `globals.css`), preventing unwanted outer document scrollbars.
  - Responsive slide-over drawer implementation for mobile/tablet navigation.
- **Gaps & Findings:**
  - Non-standard arbitrary spacing classes: `py-0.2`, `py-0.5`, `rounded-[3px]`, `rounded-[4px]`, `space-x-1.5`, `space-x-3.5`.
  - Rigid fixed widths: Sidebars and sub-panels use rigid widths (`w-72 xl:w-80`, fixed pixel modals) that cause crowding on 1024×768 resolution displays.

### Pillar 6: Experience Design (2/4)
- **Strengths:**
  - Resilient SSE reconnection logic: Workstation automatically re-establishes event streams on browser reload when an investigation is running.
  - Form submit buttons correctly disable and show opacity changes during asynchronous operations.
- **Gaps & Findings:**
  - Dangerous silent error suppression: Multiple critical API calls in `apps/web/src/app/app/page.tsx` (lines 366–421) use `.catch(() => null)`. Network drops or API 500 errors fail silently, leaving users with empty cards and no indication of failure.
  - Missing React Error Boundaries: Complex SVG and Canvas components (`ReactFlowKnowledgeGraph`, `LivingKnowledgeGraph`, `SimulationAnalyticsCharts`) have no ErrorBoundary wrapper; a single render exception crashes the entire page.
  - Destructive action confirmation: Deleting or resetting investigation sessions lacks a modal confirmation dialog.

---

## Files Audited

- `apps/web/src/app/globals.css`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/app/page.tsx`
- `apps/web/src/app/demo/page.tsx`
- `apps/web/src/components/LivingKnowledgeGraph.tsx`
- `apps/web/src/components/ReactFlowKnowledgeGraph.tsx`
- `apps/web/src/components/AnimatedRelationshipGraph.tsx`
- `apps/web/src/components/MeridianTopology.tsx`
- `apps/web/src/components/SimulationAnalyticsCharts.tsx`
- `apps/web/src/components/AgentNetworkGraph.tsx`
- `apps/web/src/lib/currency.ts`
- `apps/web/src/lib/utils.ts`
- `docs/architecture/FRONTEND_ARCHITECTURE.md`
