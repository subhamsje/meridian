# MERIDIAN — Enterprise Company Intelligence & Decision Platform

Understand the company behind the numbers. Institutional corporate intelligence, multi-specialist research societies, evidence graph extraction, and adversarial consensus deliberation.

---

## 🌟 Interactive Flagship Demonstration

MERIDIAN features a public, zero-authentication institutional flagship demonstration investigating **Palantir Technologies (NYSE: PLTR)** across 5 live progressive stages:

1. **01. Research Seeds**: Primary source provenance (SEC Form 10-K, Congressional Research Service Defense Reports, Morgan Stanley Institutional Equity Research).
2. **02. Knowledge Graph**: Interactive ontology entity-relationship extraction (DoD, TITAN Program, AWS GovCloud, Microsoft Azure Government, AIP Enterprise Platform).
3. **03. Agent Society & Direct Interrogation**: 14 distinct autonomous research specialists (Biographies, mandates, analytical styles, persistent memory, and live query interrogation via `/society/intervene`).
4. **04. Boardroom Deliberation**: Structured multi-round adversarial debate between Bull & Bear analysts, forensic accounting reconciliations, and position concessions.
5. **05. Institutional Dossier**: Fully synthesized investment intelligence report with audited financial matrices, scenario sensitivity forecasting, risk register, and print/PDF export.

**Access the Flagship Demo directly at**: `http://localhost:3000/demo` (or via the **"Explore Flagship Demonstration"** hero button on `http://localhost:3000`).

---

## Architecture Overview

```
                      ┌──────────────────────────────────────┐
                      │    MERIDIAN Research Terminal        │
                      │  Next.js 16 • Tailwind v4 • Lucide   │
                      └──────────────────┬───────────────────┘
                                         │ JSON / SSE
                      ┌──────────────────▼───────────────────┐
                      │      FastAPI Intelligence Engine     │
                      │      JWT Auth • Pydantic • PBKDF2    │
                      └──────────────────┬───────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        │                                │                                │
┌───────▼────────┐              ┌────────▼───────┐               ┌────────▼───────┐
│ Multi-Agent    │              │ Knowledge      │               │ Adjudication   │
│ Society Engine │              │ Graph & Seeds  │               │ & Dossier      │
│ (14 Agents)    │              │ (Ontology)     │               │ (Scenarios)    │
└────────────────┘              └────────────────┘               └────────────────┘
```

- **Frontend Terminal**: Next.js 16 (App Router, Turbopack, Tailwind CSS v4, Lucide Icons, Canvas & SVG Graph visualization).
- **Backend Engine**: FastAPI, SQLAlchemy 2.0, Pydantic, PBKDF2/JWT Auth, SSE Event Stream.
- **Agent Society**: 14 distinct specialist personas (Coordinator, Financial Analyst, Forensic Accountant, Competitive Intelligence, Market Dynamics, Technical Due Diligence, Regulatory, Customer Intelligence, Macroeconomic, Bull Analyst, Bear Analyst, Evidence Verifier, Scenario Forecaster, Final Adjudicator).
- **Adversarial Protocols**: Formal typed message protocol (`CHALLENGE`, `REBUT`, `CONCEDE`, `SHARE_FINDING`, `USER_INTERVENTION`, `ADJUDICATE`).
- **Persistence**: Relational SQLite / PostgreSQL with complete audit trails, position revision history, and citation indices.

---

## Quickstart

### 1. Backend Engine
```bash
cd apps/api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API Documentation and Swagger UI will be available at `http://localhost:8000/docs`.

### 2. Frontend Research Workspace
```bash
cd apps/web
pnpm install
pnpm dev
```
Access the application at `http://localhost:3000`. Direct demo route: `http://localhost:3000/demo`.

### 3. Running Automated Tests
```bash
cd /Users/subham/code/meridian
PYTHONPATH=apps/api pytest tests/ -v
```
All integration tests and flagship demonstration verification suites run in sub-2 seconds.
