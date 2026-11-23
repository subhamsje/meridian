# MERIDIAN Relational Data Model Specification

## Core Relational Schema

### 1. Identity & Tenancy
- `users`: `id` (UUID PK), `email` (unique index), `full_name`, `hashed_password` (PBKDF2-HMAC-SHA256), `is_active`, `created_at`.
- `organizations`: `id` (UUID PK), `name`, `slug` (unique index), `tier`, `created_at`.
- `organization_members`: `id` (UUID PK), `organization_id` (FK), `user_id` (FK), `role` (Admin, Lead Investigator, Analyst), `joined_at`.

### 2. Companies & Investigations
- `companies`: `id` (UUID PK), `name` (index), `ticker` (index), `domain`, `sector`, `jurisdiction`, `company_type`.
- `investigations`: `id` (UUID PK), `organization_id` (FK index), `company_id` (FK index), `title`, `status`, `depth`, `scope` (JSON list), `budget_limit_usd`, `current_cost_usd`, `progress_percentage`.

### 3. Multi-Specialist Deliberation
- `specialist_runs`: `id` (UUID PK), `investigation_id` (FK), `specialist_id`, `role_name`, `mandate`, `status`, `confidence`, `current_position`, `tokens_consumed`, `cost_usd`.
- `claims`: `id` (UUID PK), `investigation_id` (FK), `proposing_specialist_id`, `category`, `statement`, `confidence`, `verdict` (Supported, Partially Supported, Contradicted, Inconclusive), `disputed` (boolean).
- `debate_sessions`: `id` (UUID PK), `investigation_id` (FK), `topic`, `status`.
- `debate_arguments`: `id` (UUID PK), `debate_id` (FK), `claim_id` (FK), `specialist_id`, `argument_type` (Assertion, Challenge, Rebuttal, Concession, Adjudication), `content`, `confidence`.

### 4. Evidence Integrity & Citations
- `sources`: `id` (UUID PK), `organization_id` (FK), `title`, `url`, `publisher`, `source_category`, `reliability_score` (0.0 - 1.0).
- `evidence_items`: `id` (UUID PK), `investigation_id` (FK), `source_id` (FK), `location_reference`, `extracted_passage`, `reliability_assessment`.
- `evidence_claim_relationships`: `id` (UUID PK), `claim_id` (FK), `evidence_id` (FK), `relationship_type` (supporting, contradicting).

### 5. Quantitative Reports & Scenarios
- `reports`: `id` (UUID PK), `investigation_id` (FK), `title`, `version`, `executive_summary`, `financial_analysis` (JSON), `scenario_matrix` (JSON), `risk_register` (JSON), `citations_count`.
- `investigation_events`: `id` (UUID PK), `investigation_id` (FK), `event_type`, `sequence` (integer ordering for SSE replay), `payload` (JSON).
