# MERIDIAN — Technical Debt & Code Quality Review

## 1. Architectural Review & Debt Inventory

### High Priority
- **Large Component Size in `apps/web/src/app/app/page.tsx`:**
  - *Observation:* `app/page.tsx` is ~3,800 lines long, orchestrating multiple tabs, modal dialogs, and SSE subscriptions.
  - *Recommendation:* Decompose into modular feature components under `apps/web/src/components/workspace/` (e.g. `DebateTab.tsx`, `FinancialsTab.tsx`, `OverviewTab.tsx`, `ReportTab.tsx`).

### Medium Priority
- **Database Engine Migration for Multi-Worker Environments:**
  - *Observation:* SQLite 3 with WAL mode performs well for single-instance setups, but a horizontally scaled multi-worker deployment requires PostgreSQL with connection pooling.
  - *Recommendation:* Abstract connection strings in `database.py` to support seamless switching to PostgreSQL (`postgresql+psycopg2://`).

### Low Priority
- **Vector Search / Embedding Cache:**
  - *Observation:* Document passages are currently stored as text chunks in the database and queried by location reference and keyword relevance.
  - *Recommendation:* Add an optional `pgvector` or FAISS embedding index for semantic semantic retrieval over large multi-gigabyte 10-K filing archives.
