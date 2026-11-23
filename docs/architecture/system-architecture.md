# MERIDIAN System Architecture & Domain Specifications

## 1. Modular Architecture Overview

MERIDIAN operates as an enterprise-grade modular application with clear boundaries between the frontend research terminal, API gateway & business logic, background execution pipeline, and persistent storage.

```
+-------------------------------------------------------------+
|               MERIDIAN Research Terminal (Next.js)          |
|  - Workspace Registry, Adversarial Boardroom & Floor        |
|  - Evidence Inspector, Citation Graph, Quantitative Scenarios|
+------------------------------+------------------------------+
                               | HTTP / SSE
                               v
+-------------------------------------------------------------+
|                 FastAPI Application Engine                   |
|  - Organization Scoped Multi-Tenant Authorizer               |
|  - Identity Resolution & Extensible Research Provider        |
|  - Multi-Specialist Deliberation & Adjudication Pipeline    |
|  - Server-Sent Event (SSE) Stream with Last-Event-ID Resume |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                 PostgreSQL Persistent Store                  |
|  - Users, Organizations, Companies, Investigations          |
|  - Specialists, Claims, Arguments, Evidence Citations        |
|  - Quantitative Reports, Scenario Matrices, Event Logs      |
+-------------------------------------------------------------+
```

## 2. Security Boundaries & Multi-Tenancy
- **Tenant Isolation**: Every investigation is bound to an `organization_id`. All sub-resources (specialists, claims, debates, evidence, reports) validate organization tenancy at the authorization layer.
- **Evidence Provenance**: No conclusion is emitted without an immutable citation record preserving source URL, publisher, location passage, and reliability score.
