# MERIDIAN — Contributing & Engineering Standards

## 1. Code Standards
- **Python / Backend:** PEP 8 compliance, explicit type annotations, Pydantic v2 schemas for all requests/responses, SQLAlchemy 2.0 ORM patterns.
- **TypeScript / Frontend:** Strict mode enabled, React 19 hooks, Tailwind CSS utility classes, zero inline pseudo-random math.
- **Zero Hallucination Standard:** Never generate synthetic financial statements for real companies using pseudo-random number generators. If an entity is sparse or private, set `data_availability: "SPARSE"` and document explicit research gaps.

---

## 2. Pre-Commit Checklist
Before submitting a PR or pushing commits:
1. Run backend test suite: `pytest tests` (all 34 tests must pass).
2. Run frontend build: `cd apps/web && pnpm build` (must compile with 0 errors).
3. Verify no horizontal overflow at 1280×800 and 1440×900 viewports.
4. Keep commits granular, prefixed with conventional commit types (`feat:`, `fix:`, `test:`, `docs:`).
