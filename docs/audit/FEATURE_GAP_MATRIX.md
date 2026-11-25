# MERIDIAN — Product Capability & Feature Gap Matrix

| Feature Capability | Intended Institutional Requirement | Implemented Code Status | Gap / Recommendation | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Universal Company Search** | Auto-resolve public equities, international stocks, private unicorns, and startups. | **IMPLEMENTED & VERIFIED** (`research_provider.py`) | Covers US, India (`.NS`), Europe/Asia (`TM`), Unicorns (`OpenAI`), and Sparse entities. | High |
| **Document Ingestion** | Extract PDF, DOCX, XLSX, CSV, PPTX, HTML, JSON with zero crashes. | **IMPLEMENTED & VERIFIED** (`document_parser.py`) | Multi-encoding fallback implemented. Add OCR for scanned PDF filings in next phase. | Medium |
| **Independent Specialist Agents** | 6 distinct specialists with conflicting mandates. | **IMPLEMENTED & VERIFIED** (`society_agents_registry.py`) | Specialized prompts, mandates, and tools defined and stored in DB. | High |
| **Adversarial Debate** | Cross-examination and position revision tracking. | **IMPLEMENTED & VERIFIED** (`claim_debate_engine.py`) | Challenges, rebuttals, concessions, and position revisions persisted. | High |
| **Independent Adjudication** | Isolated committee model ruling on claims. | **IMPLEMENTED & VERIFIED** (`claim_debate_engine.py`) | Adjudication rulings (`ACCEPTED`, `REJECTED`, `QUALIFIED`) recorded with confidence. | High |
| **Scenario Stress Testing** | Interactive multi-scenario sensitivity modeling. | **IMPLEMENTED & VERIFIED** (`page.tsx`, `app/page.tsx`) | Interactive buttons recalculate valuation, cash runway, and margins in real-time. | High |
| **19-Section Dossier & PDF** | Comprehensive research memorandum and exportable PDF. | **IMPLEMENTED & VERIFIED** (`investment_dossier.py`) | Dynamic JSON builder and ReportLab PDF compilation functional. | High |
| **Living Knowledge Graph** | Interactive visualization of corporate relationships. | **IMPLEMENTED & VERIFIED** (`LivingKnowledgeGraph.tsx`) | D3 force-directed SVG and ReactFlow canvas active in Split Mode. | Medium |
| **Live Multi-Model Routing** | Seamless routing across OpenAI, Claude, Gemini, Ollama. | **IMPLEMENTED & VERIFIED** (`provider_manager.py`) | Dynamic routing and live diagnostics endpoint (`/providers/diagnostics`) operational. | High |
| **Real-Time Event Streaming** | Server-Sent Events progress tracking. | **IMPLEMENTED & VERIFIED** (`main.py`, `app/page.tsx`) | Live token, cost, and stage event streaming with auto-reconnect on refresh. | High |
| **Vector Search / RAG** | Vector embeddings over filing archives. | **PARTIALLY IMPLEMENTED** | Keyword and structured chunking active; pgvector index recommended for scaled deployment. | Medium |
| **Portfolio Monitoring** | Continuous automated thesis tracking and alerts. | **FUTURE ENHANCEMENT** | Daily cron trigger for scheduled delta checks planned in Roadmap Phase 2. | Low |
