# ADR-002: In-Memory Columnar OLAP and Financial Modeling with DuckDB and NumPy

## Status
Accepted

## Context
Institutional financial research requires complex scenario modeling, sensitivity tables, and cohort risk variance calculations (e.g., assessing the enterprise value impact when sovereign customer concentration shocks from 18.2% to 35%, or when ARR terminal multiples compress from 8.0x to 3.0x).
Implementing these calculations via ad-hoc procedural Python loops or heavy external data warehouses introduced latency, code duplication, and external cloud dependencies.

## Decision
We implemented the **InstitutionalAnalyticalEngine** utilizing **DuckDB** (`duckdb`) and **NumPy** (`numpy`):
- **DuckDB**: An embedded columnar OLAP SQL database executing entirely in-process (`:memory:` mode). DuckDB enables vectorized SQL execution with sub-2ms query times on financial matrices without running a separate database server.
- **NumPy**: Vectorized linear algebra and variance calculations for customer concentration risk and cash flow projections.

## Consequences
### Positive
- Sub-2 millisecond execution for 4-case valuation matrices (Base, Bull, Bear, Stress).
- Complete determinism: SQL logic ensures reproducible, verifiable financial arithmetic across all specialist agents.
- Zero external infrastructure dependencies; runs identically in local development, CI/CD, and production container pods.

### Negative / Trade-offs
- Embedded DuckDB database instances in memory do not share state across separate OS processes without explicit disk persistence or connection pooling.
