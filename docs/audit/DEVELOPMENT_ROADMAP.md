# MERIDIAN — Future Development Roadmap

## Phase 1: Near-Term Enhancements (Q1 2026)
1. **Frontend Component Modularization:**
   - Decompose `apps/web/src/app/app/page.tsx` into modular sub-tab components to improve maintainability and testability.
2. **PostgreSQL Production Target:**
   - Add Docker Compose configuration for PostgreSQL with automated Alembic migration tracking.
3. **Advanced OCR for Document Ingestion:**
   - Integrate Tesseract or PyMuPDF OCR pipeline for scanned historical regulatory filings and non-digital PDFs.

---

## Phase 2: Medium-Term Capabilities (Q2 2026)
1. **Automated Continuous Portfolio Monitoring:**
   - Scheduled daily SEC EDGAR polling and delta tracking against active investment theses.
   - Alert notifications when an invalidation condition is triggered (e.g. gross margin compression > 300 bps).
2. **Dense Vector Embeddings & Hybrid Search:**
   - Add semantic search across company filing archives using `pgvector` or Qdrant with hybrid BM25 + dense retrieval.
3. **Export Formats:**
   - Add export targets for Excel financial models (`.xlsx` with linked DCF formulas) and PowerPoint presentation decks (`.pptx`).

---

## Phase 3: Long-Term Institutional Ecosystem (Q3-Q4 2026)
1. **Multi-Organization Syndicate Collaboration:**
   - Shared multi-tenant investigation rooms for co-investors in private equity and venture capital syndicates.
2. **Direct SEC EDGAR Real-Time WebSocket Feeds:**
   - Instantaneous ingestion of 8-K material event filings within seconds of submission to the SEC.
3. **Custom Fine-Tuned Financial Evaluation Models:**
   - Specialized lightweight models fine-tuned on SEC footnote forensic accounting and financial disclosures.
