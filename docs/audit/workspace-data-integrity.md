# MERIDIAN — Workspace Data Integrity & Scoping Architecture

## 1. Principles of Isolation
To prevent cross-company data contamination and cross-tenant leakage:

1. **Organization Scoping**:
   - Every read and write endpoint enforces `get_current_organization` dependency.
   - Unauthorized tenant access attempts return HTTP 401 or 404 immediately.

2. **Investigation Scoping**:
   - Evidence records (`evidence_items`), source snapshots (`source_snapshots`), claims (`claims`), debate interactions (`agent_interactions`), and corporate relationships (`corporate_relationships`) must always reference the current `investigation_id`.
   - Global fallbacks (e.g. querying across all investigations if current investigation has 0 items) have been completely purged from the codebase.

3. **Dynamic Company Research Resolution**:
   - `CompanyResearchResolver` evaluates entity identity across 4 tiers:
     - Tier 1: Known high-profile benchmarks (NVIDIA, Palantir).
     - Tier 2: Real-time global public equities via `yfinance` (e.g. Microsoft, Reliance Industries, Toyota).
     - Tier 3: Verified private technology unicorns (e.g. Stripe, OpenAI, Zepto, Razorpay).
     - Tier 4: Sparse-disclosure entities and defense programs (e.g. Mitsubishi X-2 Shinshin).
   - If an entity is private or non-commercial, the system discloses research gaps and displays an honest non-equity structure rather than fabricating ticker quotes.

---

## 2. Dynamic Dossier & Report Verification Matrix

| Entity Tested | Type | Revenue Reported | Cash / Reserves | Capital Structure | Knowledge Graph Nodes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Microsoft Corporation** | Public Equity | $245,120M | $78,430M | Public (NASDAQ: MSFT) | 4 Verified Partners |
| **Reliance Industries** | Public Equity (BSE/NSE) | ₹11,990,330M | ₹2,603,140M | Public (RELIANCE.NS) | 4 Verified Partners |
| **Toyota Motor Corp** | Public Equity (TSE/NYSE) | ¥53,016,661M | ¥14,226,496M | Public (TM / 7203.T) | 4 Verified Partners |
| **Stripe, Inc.** | Private Unicorn | $3,500M | $3,045M | Private / Non-Listed | 4 Verified Partners |
| **Zepto** | Private Unicorn | $250M | $560M | Private / Non-Listed | 3 Verified Partners |
| **Mitsubishi X-2 Shinshin** | Defense Prototype | $0.0M (Unreported) | $0.0M (Unreported) | Non-Commercial Military | 3 Key Government / Prime Contractors |
