# MERIDIAN — Comprehensive Codebase Reverse Engineering & Technical Audit

## 1. Monorepo Inventory & Metrics

| Domain | Files Count | Code Size | Core Framework |
| :--- | :--- | :--- | :--- |
| **Backend API (`apps/api`)** | 22 Python files | ~340 KB | FastAPI 0.115, SQLAlchemy 2.0, Pydantic v2, DuckDB, LiteLLM |
| **Frontend Web (`apps/web`)** | 12 TSX/TS files | ~180 KB | Next.js 16.4.6, React 19, Tailwind CSS v4, Lucide, D3 |
| **Test Suites (`tests`)** | 10 Test files | ~75 KB | Pytest 9.1, FastApi TestClient |
| **Documentation (`docs`)** | 26 Markdown files | ~120 KB | Architecture, Development, Audit Specifications |

---

## 2. Dead Code, Duplication & Architectural Weaknesses Audit

### Identified & Resolved Items:
1. **Removed Pseudo-Random Financial Number Generator (`research_provider.py`):**
   - *Previous state:* An earlier implementation generated synthetic revenue, margin, and cash balances for unrecognised companies using `hashlib.sha256(ticker.encode()).hexdigest()`.
   - *Audit finding:* Unacceptable for an institutional research platform.
   - *Remediation:* Replaced with live `yfinance` global equity retrieval, verified venture disclosures for private unicorns, and explicit `data_availability: "SPARSE"` reporting with zero hallucinated figures for unknown entities.
2. **Eliminated Duplicate Static Sections 10–12 in Demo Dossier (`demo/page.tsx`):**
   - *Previous state:* Static mock sections were appended after dynamic section loops.
   - *Remediation:* Converted into rich inline modules inside the dynamic 19-section memorandum.
3. **Fixed `"concludes: None"` in Debate Transcripts (`scenario_simulation_engine.py`):**
   - *Previous state:* Null initial positions evaluated to `"None"` in agent opening statements.
   - *Remediation:* Enforced fallback to specialist mandates and analytical standards.
4. **Resolved Navigation Bar Overflow Clipping at 1280px:**
   - *Previous state:* Main tabs and inline sub-tabs competed in a single row, pushing `Workspace | Split` offscreen.
   - *Remediation:* Streamlined top tab bar and placed view-specific sub-tabs in dedicated secondary toolbars.

---

## 3. Persistent Architectural Strengths
- **Durable Orchestration:** State transitions are committed to the relational database at each stage rather than residing solely in volatile worker memory.
- **Auditable Cryptographic Provenance:** Every evidence item and document computes a SHA-256 hash upon ingestion.
- **Multi-Model Decoupling:** LiteLLM abstraction allows swapping between OpenAI, Claude, Gemini, and local Ollama without modifying business logic.
