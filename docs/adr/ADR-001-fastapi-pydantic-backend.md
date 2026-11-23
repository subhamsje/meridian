# ADR-001: Asynchronous Backend Architecture with FastAPI and Pydantic v2

## Status
Accepted

## Context
MERIDIAN requires an institutional-grade API backend capable of:
1. Handling high-throughput concurrent requests from institutional analysts.
2. Managing long-running multi-agent deliberations and real-time Server-Sent Events (SSE).
3. Enforcing strict schema validation and serialization for financial metrics, evidence items, and agent mandates.
4. Auto-generating compliant OpenAPI 3.1 specifications for enterprise institutional integration.

## Decision
We adopted **FastAPI** coupled with **Pydantic v2** and **SQLAlchemy 2.0**:
- **FastAPI**: Provides asynchronous request handling via Starlette, native ASGI concurrency, and clean dependency injection (`Depends`) for multi-tenant organization authorization.
- **Pydantic v2**: Written in Rust (`pydantic-core`), providing 5-20x faster serialization over v1, strict runtime type validation, and robust data integrity guarantees.
- **SQLAlchemy 2.0 with Alembic**: Fully typed relational ORM supporting both SQLite (for local zero-dependency testing) and PostgreSQL (for production multi-tenant deployments).

## Consequences
### Positive
- Sub-millisecond latency for cached endpoints and telemetry tracking.
- Strict validation prevents corrupt financial figures or malformed JSON from reaching agent reasoning loops.
- Native SSE support via `StreamingResponse` enables smooth token and deliberation streaming.

### Negative / Trade-offs
- Requires careful handling of synchronous database sessions within async route handlers (`db: Session = Depends(get_db)`).
- Forward-reference annotations in Python 3.10 require careful type rebuilding.
