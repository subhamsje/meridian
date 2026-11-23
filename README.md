# MERIDIAN — Enterprise Company Intelligence Platform

Understand the company behind the numbers. Independent corporate intelligence, multi-specialist research, and evidence in every conclusion.

## Architecture
- **Web App**: Next.js 16 (App Router, Turbopack, Tailwind CSS v4, Lucide Icons)
- **API Engine**: FastAPI, SQLAlchemy 2.0, Pydantic, PBKDF2/JWT Auth, SSE Event Stream
- **Specialist Deliberation**: 9 distinct specialist roles (Financial, Forensic, Market, Competitive, Bull, Bear, Evidence Verifier, Adjudicator)
- **Persistence**: Relational SQLite / PostgreSQL with primary source provenance citations

## Quickstart

### 1. Backend Engine
```bash
cd apps/api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend Research Workspace
```bash
cd apps/web
pnpm install
pnpm dev
```
Access the application at `http://localhost:3000`.

### 3. Running Automated Tests
```bash
cd meridian
PYTHONPATH=apps/api python3 -m pytest tests/test_backend.py -v
```
