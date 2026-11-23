# MERIDIAN — Multi-Agent System & Deliberation Engine Forensic Technical Audit

**Document:** `docs/audits/multi-agent-system-audit.md`  
**Date:** November 2026  
**Auditor:** Principal AI Systems Architect & CTO  
**Target Repository:** `/Users/subham/code/meridian`  

---

## 1. Executive Summary & Audit Scope

MERIDIAN is architected as an institutional company intelligence SaaS platform designed for private equity, venture capital, equity research, and M&A due diligence. Rather than functioning as a conversational chatbot, MERIDIAN's core value proposition is an **autonomous, evidence-grounded multi-agent research society** that executes independent investigations, constructs falsifiable claims, debates counter-theses, recalculates stress scenarios, and synthesizes adjudicated institutional dossiers.

This audit evaluates the codebase across five critical architectural tiers:
1. **Agent Society & Execution Engine**: Personas, mandates, runtime independence, and memory models.
2. **Adversarial Deliberation Lifecycle**: Claim formation, challenge-rebuttal-concession mechanics, and judicial rulings.
3. **Knowledge Graph & Provenance Integrity**: Corporate entity extraction, relationship typing, and primary citation linkage.
4. **Interactive Intelligence UX**: Living graph canvas, real-time event telemetry, and interrogation consoles.
5. **Multi-Tenant SaaS Foundation**: RBAC, cryptographic token security, tenant isolation, and quota metering.

---

## 2. Current Architecture & Existing Functionality

### 2.1 Backend Architecture
- **Framework**: FastAPI (asynchronous ASGI), SQLAlchemy 2.0 ORM, SQLite (local development/testing) and PostgreSQL compatible.
- **Authentication**: JWT Bearer tokens with PBKDF2 HMAC-SHA256 password hashing (100,000 iterations, 16-byte cryptographic salt). Deprecated `passlib` removed to avoid bcrypt truncation issues.
- **Data Models (`apps/api/models.py`)**:
  - `Organization`, `User`, `OrganizationMember`: Core multi-tenant tenancy models.
  - `Company`, `Investigation`, `InvestigationStatus`: Core investigation scoping.
  - `SocietyAgent`, `AgentMemory`, `PositionRevision`, `AgentInteraction`: Multi-agent society models.
  - `Source`, `EvidenceItem`, `Claim`, `DebateSession`, `DebateArgument`, `Report`: Institutional research and debate models.
  - `CorporateRelationship`: Entity graph relationships with directional source/target linkages.
  - `HypotheticalEvent`: Exogenous scenario shock records.
- **Specialist Roster (`apps/api/society_agents_registry.py`)**:
  - 14 defined specialist personas with typed mandates, analytical styles, tool allowlists, and biographies.
- **Research Provider (`apps/api/research_provider.py`)**:
  - Deterministic benchmarking and primary filing seed resolver (SEC EDGAR Form 10-K, CRS Defense Modernization, Morgan Stanley Research).

### 2.2 Frontend Architecture
- **Framework**: Next.js 16 (App Router, Turbopack, Tailwind CSS v4, Lucide Icons).
- **Core Views**:
  - `/`: Institutional landing page with hero CTA.
  - `/app`: Authenticated customer workspace.
  - `/demo`: Flagship demonstration investigating Palantir Technologies (PLTR) across 5 connected progressive stages (Research Seeds $\rightarrow$ Knowledge Graph $\rightarrow$ Agent Society $\rightarrow$ Boardroom Debate $\rightarrow$ Intelligence Dossier).
- **Graph Visualization (`apps/web/src/components/LivingKnowledgeGraph.tsx`)**:
  - Custom HTML5 Canvas engine with 60 FPS physics relaxation, particle flow, LOD labels, neighborhood illumination, and radar minimap.

---

## 3. Deficiencies, Gaps & Simulated Behaviors Identified

While foundational models exist, the forensic inspection identifies several critical areas where execution must be elevated from basic execution to production SaaS rigor:

| Domain | Current Implementation Gap | Required Production Standard |
| :--- | :--- | :--- |
| **Agent Society Composition** | 14 agents defined; missing dedicated Red-Team Investigator and Corporate Structure Investigator. | Expand to 15+ specialized agents with distinct mandates (Red Team, Corporate Structure, Commercial Intelligence, Synthesis). |
| **Debate Lifecycle** | Debate executed in batch mode without explicit independent pre-debate research isolation. | Implement 9-phase debate lifecycle: Independent Investigation $\rightarrow$ Claim Formation $\rightarrow$ Position Submission $\rightarrow$ Challenges $\rightarrow$ Rebuttals $\rightarrow$ Dynamic Research $\rightarrow$ Reassessment $\rightarrow$ Final Adjudication $\rightarrow$ Synthesis. |
| **Dynamic Research Requests** | Agents cannot currently request additional ad-hoc filings during a live debate round. | Implement dynamic research delegation: agents issue `REQUEST_EVIDENCE` triggers which spawn secondary retrieval tasks. |
| **Memory Hierarchy** | `AgentMemory` stores single string entries without tiered separation. | Implement 4-tier memory architecture: Working Memory, Investigation Memory, Shared Investigation Memory, Long-Term Institutional Memory. |
| **Society Interrogation** | Q&A endpoint `/society/intervene` questions individual agents only. | Add whole-society interrogation endpoint (`POST /society/interrogate-all`) allowing users to query consensus, major contradictions, and top disputed claims. |
| **Tenant Isolation & Security** | Public demo uses fixed tenant slug without dedicated session cloning for anonymous users. | Ensure demo interactions operate in an isolated sandbox session preventing public state pollution of canonical baseline records. |

---

## 4. Recommended Target Architecture

### 4.1 9-Phase Adversarial Deliberation Lifecycle
```
[Phase 1: Independent Research]
     │ Agents query primary sources in isolation
     ▼
[Phase 2: Atomic Claim Formation]
     │ Structured claims with evidence references and period
     ▼
[Phase 3: Position Submission]
     │ Stances: SUPPORT, OPPOSE, PARTIALLY_SUPPORT, INSUFFICIENT_EVIDENCE
     ▼
[Phase 4: Challenge Identification]
     │ Specific objections and evidence gap identification
     ▼
[Phase 5: Adversarial Debate Rounds]
     │ Typed messages: CHALLENGE, REBUT, CONCEDE, QUALIFY
     ▼
[Phase 6: Dynamic Research Task Spawning]
     │ On-demand retrieval of additional filings/disclosures
     ▼
[Phase 7: Position Reassessment & Revisions]
     │ Documented confidence deltas and concession rationales
     ▼
[Phase 8: Final Judicial Adjudication]
     │ Verdicts: SUPPORTED, PARTIALLY_SUPPORTED, CONTRADICTED, INSUFFICIENT_EVIDENCE
     ▼
[Phase 9: Final Intelligence Synthesis]
     │ Dossier compilation preserving unresolved disputes
```

### 4.2 15+ Specialist Society Roster
1. **Chief Research Coordinator** (Dr. Aris Vance) — Task decomposition, DAG scheduling.
2. **Chief Adjudicator** (Justice Simon Cross) — Judicial evaluation of disputed claims.
3. **Principal Financial Analyst** (Sarah Chen, CFA) — GAAP statement audits, unit economics.
4. **Senior Forensic Accountant** (Marcus Holst, CPA/CFF) — ASC 606 revenue recognition, anomalies.
5. **Valuation & Scenario Analyst** (Dr. Maya Lin) — Multiple compression, DCF sensitivity.
6. **Industry & Market Structure Analyst** (David Sterling) — TAM, industry cycles.
7. **Competitive Intelligence Director** (Elena Rostova) — Market positioning, moats.
8. **Corporate Structure Investigator** (Vikram Seth) — Entity lineage, parent-subsidiary holdings.
9. **Technology & Product Analyst** (Priya Nair) — Architecture differentiation, technical debt.
10. **Legal & Regulatory Researcher** (Dr. Julian Thorne, JD) — Compliance, litigation, policy.
11. **Corporate Governance Analyst** (Diana Vance) — Dual-class voting, board independence.
12. **Commercial Intelligence Analyst** (Claire Beauchamp) — Customer concentration, procurement velocity.
13. **Bull-Case Thesis Advocate** (Vivian Graves) — Upside catalysts, operating leverage.
14. **Bear-Case Thesis Advocate** (Inspector Jonathan Cole) — Downside vulnerabilities, structural risks.
15. **Red-Team Investigator** (Cassandra Cross) — Hypothesis falsification, circular reasoning detection.
16. **Evidence Verification Specialist** (Arthur Pendelton) — Citation provenance, source staleness audits.

### 4.3 4-Tier Memory Hierarchy
1. **Working Memory**: Ephemeral task state, active draft claims, scratchpad tokens.
2. **Investigation Memory**: Agent-specific findings, position history, individual challenges.
3. **Shared Investigation Memory**: Canonical knowledge graph, verified evidence items, adjudicated claims.
4. **Long-Term Institutional Memory**: Historical company profiles, cross-investigation benchmark multiples, reusable ontologies.

---

## 5. Implementation Sequence & Plan

1. **Phase 1: Agent Registry & Multi-Agent Engine Expansion**:
   - Add Red-Team Investigator and Corporate Structure Investigator to [apps/api/society_agents_registry.py](file:///Users/subham/code/meridian/apps/api/society_agents_registry.py).
   - Implement the full 9-phase deliberation lifecycle in [apps/api/multi_agent_society_engine.py](file:///Users/subham/code/meridian/apps/api/multi_agent_society_engine.py).
2. **Phase 2: Dynamic Research Delegation & Whole-Society Interrogation**:
   - Add dynamic evidence request handling (`REQUEST_EVIDENCE`).
   - Add `POST /api/v1/investigations/{id}/society/interrogate-all` for society-wide queries.
3. **Phase 3: Interactive Deliberation & Living Graph Polish**:
   - Enhance [apps/web/src/app/demo/page.tsx](file:///Users/subham/code/meridian/apps/web/src/app/demo/page.tsx) with whole-society interrogation and dynamic research request tracking.
4. **Phase 4: Automated Verification Suite**:
   - Write comprehensive unit and integration tests in `tests/test_multi_agent_society.py` covering independent research, claim formation, challenges, position revisions, dynamic research, and whole-society interrogation.
   - Verify 100% test pass and sub-2 second test suite execution.

---

## 6. Risks, Tradeoffs & Mitigations

- **Risk 1: Uncontrolled Debate Loops**:
  - *Mitigation*: Hard cap of 6 debate rounds with explicit convergence/termination criteria.
- **Risk 2: Synthetic Data Hallucinations**:
  - *Mitigation*: All claims and relationships must link to a valid `EvidenceItem` with non-null `location_reference` and source URL.
- **Risk 3: Memory Leaks in Realtime SSE Streams**:
  - *Mitigation*: Explicit generator cancellation on client disconnect and timeout guards.
