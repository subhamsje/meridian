# MERIDIAN — Local Development & Environment Setup

## 1. Monorepo Structure
MERIDIAN is organized as a monorepo containing:
- `apps/web`: Next.js 16 frontend application.
- `apps/api`: FastAPI / Python backend service.
- `tests`: Automated integration, unit, and resilience test suites.
- `docs`: Technical architecture, development, and audit documentation.

---

## 2. Recommended Local Environment
- **OS:** macOS or Linux (Ubuntu 22.04+).
- **Python:** 3.10+ in a dedicated virtualenv (`python3 -m venv venv && source venv/bin/activate`).
- **Node.js:** v20 LTS with `pnpm` (`npm install -g pnpm`).

---

## 3. Database Reset & Reseeding
To reinitialize the SQLite database from scratch:
```bash
cd apps/api
rm -f meridian.db
python3 -c "from database import init_db; init_db()"
python3 -c "from flagship_demo import ensure_flagship_demo_seeded; from database import SessionLocal; db = SessionLocal(); ensure_flagship_demo_seeded(db)"
```
This recreates all tables, applies foreign keys and indexes, and seeds the audited NVIDIA Corporation flagship dataset.
