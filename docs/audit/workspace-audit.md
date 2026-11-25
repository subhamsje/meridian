# MERIDIAN — Complete Forensic Workspace Audit

## 1. Executive Summary
This document provides a forensic verification of the MERIDIAN Workspace (`/app` and `/demo`), mapping every component, API route, ORM model, and data flow to verify strict execution isolation, dynamic company resolution, and zero-hardcoding compliance.

---

## 2. Workspace Subsystem Inventory & Audit

### 2.1 Investigation Overview & Navigation
- **Frontend Component**: `apps/web/src/app/app/page.tsx` (`WorkspaceApp`)
- **Backend Route**: `GET /api/v1/investigations`, `POST /api/v1/investigations`
- **Scoping**: All queries enforce `Organization.id` scoping via `get_current_organization`.
- **Status**: **IMPLEMENTED AND VERIFIED**
- **Findings**:
  - Previously, timer leaks across investigation selections could cause polling intervals to collide. Fixed via `pollTimerRef` and atomic cancellation.
  - Active run progression cleanly switches between `Run Investigation` and `Investigating... [Stage: XX]` with live percentage badges.

### 2.2 Research & Evidence Workspace
- **Frontend Component**: `apps/web/src/app/app/page.tsx` (`activeTab === 'research'`)
- **Backend Routes**:
  - `GET /api/v1/investigations/{id}/documents`
  - `POST /api/v1/investigations/{id}/documents` (multipart upload)
  - `DELETE /api/v1/investigations/{id}/documents/{doc_id}`
  - `GET /api/v1/investigations/{id}/evidence`
- **Data Integrity**:
  - Documents uploaded to `/documents` are stored in SQLite and linked via `investigation_id`.
  - Evidence items are strictly scoped to `investigation_id`. Previous global fallback (`if not evidence_items: db.query(EvidenceItem).all()`) was removed.
- **Status**: **IMPLEMENTED AND VERIFIED**

### 2.3 Intelligence Workspace & Knowledge Graph
- **Frontend Components**:
  - `apps/web/src/app/app/page.tsx` (`activeTab === 'intelligence'`)
  - `apps/web/src/components/LivingKnowledgeGraph.tsx`
  - `apps/web/src/components/ReactFlowKnowledgeGraph.tsx`
- **Backend Routes**:
  - `GET /api/v1/investigations/{id}/graph`
  - `GET /api/v1/companies/{id}/thesis`
  - `GET /api/v1/companies/{id}/credibility`
  - `GET /api/v1/companies/{id}/hypotheses`
  - `GET /api/v1/companies/{id}/anomalies`
- **Data Integrity**:
  - Knowledge graph dynamically renders `CorporateRelationship` rows ingested during research resolution.
  - Relationships link verified counterparties (e.g. suppliers, regulators, partners) without mock nodes.
- **Status**: **IMPLEMENTED AND VERIFIED**

### 2.4 Deliberation & Adversarial Debate Workspace
- **Frontend Component**: `apps/web/src/app/app/page.tsx` (`activeTab === 'debate'`)
- **Backend Routes**:
  - `GET /api/v1/investigations/{id}/society/agents`
  - `GET /api/v1/investigations/{id}/society/interactions`
  - `GET /api/v1/investigations/{id}/claims`
  - `GET /api/v1/investigations/{id}/debates`
  - `POST /api/v1/scenarios/{id}/interview/{agent_id}`
  - `POST /api/v1/scenarios/{id}/survey`
  - `POST /api/v1/scenarios/{id}/intervene`
- **Data Integrity**:
  - Specialized agents are instantiated with unique tasks decomposed by `DynamicTaskDecomposer`.
  - Debate interactions (`OPENING_POSITION`, `CHALLENGE`, `REBUTTAL`, `ADJUDICATION`) are stored in `AgentInteraction` with explicit sender and recipient agent IDs.
- **Status**: **IMPLEMENTED AND VERIFIED**

### 2.5 Financials & Capitalization Workspace
- **Frontend Component**: `apps/web/src/app/app/page.tsx` (`activeTab === 'financials'`)
- **Backend Routes**:
  - `GET /api/v1/investigations/{id}/stock`
  - `GET /api/v1/investigations/{id}/dossier`
- **Data Integrity**:
  - Removed static `$115.6B` / `$4.28B` hardcoded revenue conditionals.
  - Dynamically displays audited metrics from `dossierData.financial_summary` (revenue, gross margin, cash, free cash flow).
  - Private entities (e.g. Stripe, Zepto) return `has_stock: false`, displaying private round valuations and non-equity structures rather than fictional ticker charts.
  - Public equities (e.g. NVDA, MSFT) resolve real ticker pricing, P/E ratios, and 30-day closing price series via `yfinance`.
- **Status**: **IMPLEMENTED AND VERIFIED**

### 2.6 Report & Official Dossier Workspace
- **Frontend Component**: `apps/web/src/app/app/page.tsx` (`activeTab === 'report'`)
- **Backend Routes**:
  - `GET /api/v1/investigations/{id}/reports`
  - `GET /api/v1/investigations/{id}/dossier`
  - `GET /api/v1/investigations/{id}/dossier/pdf`
- **Data Integrity**:
  - All 19 sections of the institutional investment dossier are synthesized from persisted claims, evidence items, and resolved company metrics.
  - PDF generation via ReportLab produces official 4-page memorandum files streamed directly as `application/pdf`.
- **Status**: **IMPLEMENTED AND VERIFIED**
