# MERIDIAN — Frontend Architecture & UI Systems

## 1. Overview
The MERIDIAN frontend is built on **Next.js 16.4.6** (React 19, Turbopack, Tailwind CSS v4, Lucide icons, D3, and ReactFlow). It is structured around an institutional financial workstation visual design system: high-density typography, high-contrast dark forest backgrounds (`#102A22`, `#0B1E18`), warm parchment cards (`#F4F1E9`, `#EAE5D9`), crisp amber/gold accents (`#B58A4F`, `#E5B842`), and tabular monospace indicators.

---

## 2. Directory & Route Map

```
apps/web/
├── package.json
├── next.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
└── src/
    ├── app/
    │   ├── layout.tsx            # Global root layout, font imports, metadata
    │   ├── globals.css           # Global CSS variables, scrollbars, typography
    │   ├── page.tsx              # Public executive landing page
    │   ├── demo/
    │   │   └── page.tsx          # Standalone Flagship Demo Dossier (NVDA 19-section)
    │   └── app/
    │       └── page.tsx          # Institutional Workstation (/app)
    ├── components/
    │   ├── LivingKnowledgeGraph.tsx      # Interactive D3 force-directed SVG graph
    │   ├── ReactFlowKnowledgeGraph.tsx  # ReactFlow interactive node-edge canvas
    │   ├── AnimatedRelationshipGraph.tsx# Landing page animated relationship graph
    │   ├── MeridianTopology.tsx         # 7-stage interactive animated topology
    │   ├── SimulationAnalyticsCharts.tsx# SVG charts for Monte Carlo runs
    │   └── AgentNetworkGraph.tsx        # Multi-agent society topology
    └── lib/
        ├── currency.ts           # Indian Numbering System currency formatters
        └── utils.ts              # Class name merging and utility functions
```

---

## 3. Page Architecture

### 1. Executive Landing Page (`apps/web/src/app/page.tsx`)
- **Executive Masthead:** Responsive navigation bar with fluid labels (`Thesis`, `Graph`, `Specialists`, `Evidence`, `Valuation`, `Architecture`, `Tiers`) and Launch CTA (`x=1094.96px`, right edge `1232px` at 1280px viewport, leaving 48px margin; zero horizontal overflow).
- **Interactive Scenario Stress-Testing Engine:** Four interactive scenario buttons (`Base Case Consensus`, `Bull Expansion +38.9%`, `Bear Contraction -30.5%`, `Severe Stress Shock -56.2%`) that dynamically recompute implied enterprise valuation in INR and USD, cash runway, gross margin stability, and illuminate the active column in the comparative DuckDB datagrid.
- **Interactive Topologies & Visualizations:** Embeds `MeridianTopology.tsx` and `AnimatedRelationshipGraph.tsx` to demonstrate how MERIDIAN transforms unstructured corporate disclosures into auditable intelligence.

### 2. Core Institutional Workstation (`apps/web/src/app/app/page.tsx`)
A 3,800+ line single-page institutional application containing:
- **Authentication & Instant Demo Flow:** Supports login/registration and one-click instant demonstration (`?demo=true` or `?demo=nvda`) that auto-authenticates as `"Lead Portfolio Investigator"` and seeds the flagship demonstration session.
- **Streamlined Sub-Header Navigation Strip:**
  - 6 Main Workstation Tabs: `Overview`, `Research`, `Intelligence`, `Debate`, `Financials`, `Report`.
  - Right-aligned `Workspace | Split` toggle group: Cleanly toggles between the full-width tabbed view and the dual-column split view (showing the interactive `LivingKnowledgeGraph.tsx` side-by-side).
  - Designed with zero horizontal overflow across 1280×800 and 1440×900 viewports.
- **Dedicated View Sub-Toolbars:**
  - `Research`: Secondary toolbar for `Documents (N)`, `Specialists (N)`, `Evidence (N)`, `Graph (N)`.
  - `Intelligence`: Secondary toolbar for `Hypotheses (N)`, `Thesis & Invalidation`, `Management Credibility`, `Anomalies (N)`.
  - `Financials`: Secondary toolbar for `Fundamentals`, `Stock Intelligence`, `Scenario Matrix`.
- **Modals & Intervention Panels:**
  - `God-View Simulation Intervention`: Allows investigators to inject exogenous events (supply chain shock, regulatory ban) into an ongoing debate.
  - `1-on-1 Interview Drawer`: Allows direct cross-examination of individual specialist agents.
  - `Plenary Survey Modal`: Broadcasts custom research questions across all active society specialists.
  - `Dual-Mode Creator Modal`: Standard company lookup vs. Advanced institutional investigation config.

### 3. Flagship Demo Dossier (`apps/web/src/app/demo/page.tsx`)
- High-fidelity 19-section executive memorandum rendering NVIDIA Corporation's full audited semiconductor investigation.
- Inline interactive modules: Key Takeaways, Comprehensive Financial Metrics grid, Supply Chain Chokepoints, Verified Claims, Multi-Scenario Sensitivity grid, Investment Committee Verdict, and Cryptographic SHA-256 Audit Ledger.
- Direct PDF download integration targeting `/api/v1/investigations/{id}/dossier/pdf`.

---

## 4. State Management & Lifecycle Persistence
- **Session Tokens:** Persisted in `localStorage.getItem("meridian_token")`.
- **Active Investigation Recovery:** Persisted in `localStorage.getItem("meridian_active_inv_id")`. Upon browser reload, `fetchInvestigations` re-selects the stored investigation.
- **Real-Time SSE Streaming:** `attachExecutionStream` connects to `/api/v1/investigations/{id}/events/stream?token=...`. When an investigation is running, it streams live token counts, stage progression, and event logs. If the page is refreshed while an execution is running, the Workstation detects `status === "running"` or `"in_progress"` and automatically reconnects the event stream without resetting state.
