# MERIDIAN — Initial Technical Forensic Audit

**Date:** 2026-11-23  
**Auditor:** Principal Software Architect & Application Security Engineer  
**Scope:** Full-stack codebase inspection of `/Users/subham/code/meridian`

---

## 1. Executive Summary & Inventory

The repository establishes an initial end-to-end vertical slice for **MERIDIAN**. However, beneath the passing tests and compiled Next.js frontend, significant architectural, security, and research-integrity deficiencies exist that prevent production deployment.

### Subsystem Verification Matrix

| Subsystem | Verified State | Risk/Deficiency |
|---|---|---|
| **Authentication & RBAC** | Partially Implemented | Hardcoded JWT secret fallback in `auth.py`; lacks refresh tokens; lacks session revocation; RBAC role checks missing on route operations. |
| **Multi-Tenancy** | Partially Implemented | While models have `organization_id`, queries on `debates`, `specialists`, `evidence`, and `claims` route endpoints only filter by `investigation_id` without cross-checking the requesting tenant organization. **Cross-tenant data exposure vulnerability.** |
| **Research Engine** | Simulated / Mocked | In `apps/api/engine.py`, research ingestion uses static canned passages for any investigated company instead of actual live regulatory/SEC or web data retrieval. |
| **Financial Engine** | Placeholder / Fixed | Hardcoded financial numbers (e.g. $428.5M revenue, 72.4% GM) are inserted into the database regardless of the target company. |
| **Adversarial Deliberation** | Static Orchestration | The debate arguments and adjudications follow a scripted path in `run_investigation_pipeline`. |
| **Database & Migrations** | Implemented but Fragile | Uses `Base.metadata.create_all()` on startup; Alembic migrations directory exists but is uninitialized; SQLite fallback default; foreign keys lack proper cascading on some relationship collections. |
| **Realtime Stream (SSE)** | Fully Implemented | Functional polling loop streaming events, but lacks `Last-Event-ID` header resume capability and sequence checkpoint validation on reconnect. |
| **Frontend Workspace** | Fully Implemented & Responsive | Functional tabs, modal wizards, dark graphite UI, and API integration. Needs enhanced financial charts, scenario modeling controls, export utilities, and error boundaries. |
| **CI/CD & Tests** | Basic Suite | 1 test file (`test_backend.py`); missing cross-tenant isolation tests, malicious input/injection tests, and financial arithmetic validation. |

---

## 2. Vulnerability & Deficiency Findings

### Finding 1: Cross-Tenant Data Access in Investigation Sub-Resources [HIGH SEVERITY]
- **File:** `apps/api/main.py`
- **Location:** `get_specialists`, `get_claims`, `get_debates`, `get_evidence`, `get_reports`
- **Impact:** An authenticated user from Organization A can query `/api/v1/investigations/{org_b_inv_id}/claims` or `/reports` if they guess or obtain the UUID of Organization B's investigation, because the endpoint filters solely on `investigation_id == id` without joining or verifying `investigation.organization_id == org.id`.
- **Remediation:** Enforce organization tenancy checks across every single sub-resource endpoint.

### Finding 2: Static Data Ingestion in Pipeline [HIGH SEVERITY]
- **File:** `apps/api/engine.py`
- **Impact:** Any company entered (e.g., Apple, Palantir, Snowflake) outputs the identical financial metrics and regulatory citations.
- **Remediation:** Introduce an extensible `ResearchSourceProvider` abstraction with real company profile retrieval, SEC/financial data resolution, deterministic quantitative analytics, and company-specific claim generation.

### Finding 3: Security & Secrets Hardening [MEDIUM SEVERITY]
- **File:** `apps/api/auth.py`
- **Impact:** `SECRET_KEY` falls back to a plain string. Token expiry is 7 days without refresh token rotation.
- **Remediation:** Enforce environment variable validation, support configurable expiration, and provide `.env.example`.

### Finding 4: Missing Database Migration System [MEDIUM SEVERITY]
- **Location:** `database/migrations`
- **Impact:** `Base.metadata.create_all` does not handle schema evolution in production PostgreSQL.
- **Remediation:** Configure Alembic migration environment with automated schema generation.

---

## 3. Prioritized Implementation Plan

1. **Security & Multi-Tenant Isolation**: Enforce organization boundary checks on all endpoints; add cross-tenant unauthorized access test cases.
2. **Dynamic Research Provider & Financial Calculation Subsystem**: Build a modular research resolution provider supporting real company financial data, SEC EDGAR/registry lookups, deterministic unit economic calculations, and reproducible scenario forecasting.
3. **Dynamic Deliberation & Adjudication Engine**: Generate specialized findings, claims, and debate challenges dynamically tailored to the target company's fundamentals.
4. **SSE Resilience & Replay**: Implement `Last-Event-ID` tracking for uninterrupted client reconnection.
5. **Frontend Institutional Polish**: Add financial metrics visualization, sensitivity scenario adjusters, report export/print, and error state hardening.
6. **Testing & Quality Assurance**: Expand Pytest coverage to include multi-tenancy boundary audits, financial logic tests, and SSE stream validation.
7. **Production Documentation**: Deliver comprehensive architecture, data model, security assessment, and operational guides.
