# MERIDIAN — System Architecture & Technical Topology

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph Client ["Client Layer (Next.js 16 + React 19)"]
        Landing["Landing Page (/)<br/>Interactive Scenarios & Masthead"]
        App["Institutional Workspace (/app)<br/>6 Primary Tabs + Living Graph"]
        Demo["Executive Demo (/demo)<br/>19-Section Dossier & Audit Ledger"]
        State["Client State & SSE Engine<br/>localStorage Rehydration & Reconnect"]
    end

    subgraph API ["API & Routing Layer (FastAPI)"]
        Router["HTTP & SSE Endpoints (/api/v1)"]
        Auth["JWT & Argon2 / bcrypt Authentication"]
        CORS["CORS & Origin Policies"]
        Telemetry["Telemetry & Token Cost Tracker"]
    end

    subgraph Orchestration ["Core Multi-Agent Orchestration Layer"]
        DurableOrch["Durable Investigation Orchestrator<br/>7-Stage Resilient State Machine"]
        ResearchDirector["Autonomous Research Director<br/>DAG Decomposition & Specialist Routing"]
        DebateEngine["Claim-Driven Debate Engine<br/>Challenge, Rebuttal & Revision Matrix"]
        ScenarioEngine["Scenario Simulation Engine<br/>DuckDB OLAP & Monte Carlo Modeling"]
        DossierGen["Investment Dossier Generator<br/>ReportLab PDF Engine"]
    end

    subgraph Ingestion ["Universal Ingestion & Research Layer"]
        UniversalResearch["Universal Company Research Engine<br/>SEC EDGAR, yfinance, Wikipedia, Startups"]
        DocParser["Document Parsing Service<br/>PyMuPDF, docx, openpyxl, pandas, pptx"]
        Discovery["Company Discovery Engine<br/>Ticker, CIK & Domain Matching"]
        Currency["Currency Service<br/>RBI Reference Rate & Indian Numbering"]
    end

    subgraph LLM ["Model Abstraction & Provider Layer"]
        LiteLLMRouter["LiteLLM Unified Router<br/>Dynamic Model Selection & Timeout Guard"]
        ProviderDiag["Provider Manager Diagnostics<br/>Latency Benchmarks & Health Matrix"]
        OfflineSynth["Grounded Offline Synthesis<br/>Deterministic Fallback Engine"]
    end

    subgraph Storage ["Persistence & Data Layer"]
        SQLiteDB[(Relational DB / SQLite 3<br/>WAL Mode, Foreign Key Constraints)]
        FileStore["Document & Artifact Store<br/>Evidence SHA-256 Hashes"]
    end

    Client -->|REST & SSE Events| API
    API --> Orchestration
    Orchestration --> Ingestion
    Orchestration --> LLM
    Orchestration --> Storage
    Ingestion --> Storage
```

---

## 2. Frontend / Backend Communication Architecture

```mermaid
sequenceDiagram
    autonumber
    actor User as Lead Portfolio Investigator
    participant Web as Next.js Workstation (/app)
    participant API as FastAPI Router (/api/v1)
    participant Orch as Durable Orchestrator
    participant DB as SQLite / Relational Store

    User->>Web: Launch Investigation ("NVDA")
    Web->>API: POST /investigations (Company Payload, Token)
    API->>DB: Persist Investigation Record (Status: pending)
    API-->>Web: Return Investigation ID & Initial Manifest
    Web->>API: POST /investigations/{id}/executions/start
    API->>Orch: Spawn Background Execution Pipeline
    API-->>Web: Execution Initialized (SSE Stream URL)
    Web->>API: GET /investigations/{id}/events/stream?token=... (SSE)
    
    loop Real-Time State Streaming
        Orch->>DB: Transition Stages 1 -> 7 (Update DB)
        Orch->>API: Yield SSE ExecutionEvent (Progress, Stage, Tokens, Cost)
        API-->>Web: Server-Sent Event (JSON Payload)
        Web->>Web: Update Progress Pill, Cost Meter & Live Event Log
    end

    Orch->>DB: Stage 7 Complete (Status: completed)
    Orch->>API: Yield stream.ended
    Web->>API: GET /investigations/{id}/dossier
    API-->>Web: Return 19-Section Dossier JSON
    Web->>User: Render Memorandum, Knowledge Graph & Stress Matrix
```

---

## 3. Backend Service Dependency Graph

```mermaid
graph LR
    main["main.py (FastAPI App)"] --> auth["auth.py"]
    main --> db["database.py & models.py"]
    main --> durable["durable_investigation_orchestrator.py"]
    main --> discovery["company_discovery.py"]
    main --> research["research_provider.py"]
    main --> docparser["document_parser.py"]
    main --> dossier["investment_dossier.py"]
    main --> provider["provider_manager.py"]
    main --> currency["currency_service.py"]
    main --> scenario["scenario_simulation_engine.py"]
    main --> extended["extended_models.py"]

    durable --> research
    durable --> agent_orch["agent_orchestrator.py"]
    durable --> claim_engine["claim_debate_engine.py"]
    durable --> dossier
    durable --> db

    agent_orch --> provider
    research --> currency
    claim_engine --> agent_orch
    scenario --> db
```

---

## 4. Multi-Agent Society & Deliberation Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Stage1_Planning: User Submits Ticker
    Stage1_Planning --> Stage2_Ingestion: Decompose Inquiry DAG
    Stage2_Ingestion --> Stage3_Execution: SEC 10-K & Live Data Ingested
    Stage3_Execution --> Stage4_ClaimRegistration: Specialist Findings Synthesized
    Stage4_ClaimRegistration --> Stage5_AdversarialDebate: Initial Claims Audited & Locked
    Stage5_AdversarialDebate --> Stage6_Adjudication: Cross-Examinations & Rebuttals
    Stage6_Adjudication --> Stage7_DossierCompilation: Independent Committee Verdict
    Stage7_DossierCompilation --> [*]: 19-Section PDF & Knowledge Graph Ready
```
