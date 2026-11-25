# MERIDIAN — Backend Architecture & Service Engineering

## 1. Overview
The MERIDIAN backend is built on **FastAPI** (Python 3.10+), utilizing **SQLAlchemy 2.0** for object-relational mapping, **SQLite 3** (with WAL mode enabled) as the operational relational datastore, **DuckDB** for analytical OLAP calculations, and **LiteLLM** as the unified multi-model router.

---

## 2. Core Service Directory & File Responsibilities

| File Path | Lines / Size | Core Responsibility |
| :--- | :--- | :--- |
| `apps/api/main.py` | 1,840 lines / 72.6 KB | Primary FastAPI application, CORS middleware, JWT authentication routes, REST endpoints, SSE event streaming, and background task dispatch. |
| `apps/api/models.py` | 950 lines / 40.2 KB | Relational schema definitions: Users, Organizations, Investigations, SpecialistRuns, SocietyAgents, Claims, Debates, EvidenceItems, Sources, and ExecutionManifests. |
| `apps/api/extended_models.py` | 240 lines / 9.2 KB | Autonomous intelligence models: CorporateHypotheses, ManagementStatements, Anomalies, and InvestmentTheses. |
| `apps/api/durable_investigation_orchestrator.py` | 850 lines / 38.6 KB | 7-stage durable multi-agent execution pipeline with state checkpoints, pause/resume, and event publishing. |
| `apps/api/research_provider.py` | 820 lines / 38.2 KB | Universal Company Research Engine: SEC EDGAR CIK resolver, live yfinance equity data, venture disclosures, and zero-hallucination sparse entity resolution. |
| `apps/api/document_parser.py` | 290 lines / 12.5 KB | Multi-format document parser (PDF, DOCX, XLSX, CSV, PPTX, HTML, JSON) with multi-encoding fallback (`utf-8`, `latin-1`, `cp1252`) and SHA-256 validation. |
| `apps/api/claim_debate_engine.py` | 340 lines / 13.7 KB | Multi-round adversarial debate engine: claim challenge formulation, rebuttal processing, position revision tracking, and adjudication. |
| `apps/api/investment_dossier.py` | 780 lines / 34.0 KB | 19-section institutional research memorandum JSON builder and ReportLab PDF document compiler. |
| `apps/api/provider_manager.py` | 190 lines / 8.5 KB | Multi-provider abstraction (OpenAI, Anthropic, Gemini, Ollama), live ping tests, latency benchmarking, and health matrix diagnostic endpoint. |
| `apps/api/scenario_simulation_engine.py` | 960 lines / 43.2 KB | Monte Carlo probabilistic scenario simulation, DuckDB DCF valuation modeling, and stress testing. |
| `apps/api/agent_orchestrator.py` | 130 lines / 4.9 KB | LiteLLM routing, dynamic active model selection based on environment credentials, token accounting, and grounded offline synthesis fallback. |
| `apps/api/currency_service.py` | 110 lines / 4.5 KB | Real-time RBI reference currency conversion from USD to INR, formatted in Indian Numbering System standards (Lakh, Crore, Lakh Crore). |
| `apps/api/flagship_demo.py` | 680 lines / 30.8 KB | Seeds the institutional semiconductor benchmark for NVIDIA Corporation, TSMC CoWoS packaging, and BIS export control regulations. |
| `apps/api/knowledge_graph_anomaly_engine.py` | 210 lines / 9.1 KB | Cycle detection, circular debt/revenue discovery, and relationship verification in corporate knowledge graphs. |
| `apps/api/management_thesis_engine.py` | 250 lines / 10.6 KB | Executive guidance vs. reported reality tracking, falsifiability testing, and thesis invalidation triggers. |

---

## 3. Background Processing & Execution Durability
Unlike in-memory job queues that fail upon process restart, MERIDIAN's execution lifecycle is **fully durable**:
1. **Manifest Persistence:** Every investigation execution creates an `InvestigationExecution` and an `ExecutionManifest` row in the database.
2. **State Machine Stages:**
   - `STAGE_1_INITIALIZING`
   - `STAGE_2_INGESTING_EVIDENCE`
   - `STAGE_3_SPECIALIST_EXECUTION`
   - `STAGE_4_SYNTHESIZING_CLAIMS`
   - `STAGE_5_ADVERSARIAL_DEBATE`
   - `STAGE_6_COMMITTEE_ADJUDICATION`
   - `STAGE_7_REPORT_COMPILATION`
3. **Execution Events Ledger:** Each stage transition, token consumption increment, and agent message writes an `ExecutionEvent` record with timestamp, progress percentage, and stage metadata.
4. **Resilient Event Streaming:** The endpoint `GET /api/v1/investigations/{id}/events/stream` queries `ExecutionEvent` records, allowing clients to re-subscribe and catch up if the network drops or the browser refreshes.
