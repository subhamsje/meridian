# MERIDIAN — Security Findings & Risk Audit

## Audit Summary
A comprehensive security review was performed on the authentication layer, database ORM queries, file ingestion dropzone, and external API integrations.

---

## 1. Vulnerability Findings & Severity Matrix

| Finding ID | Component | Severity | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-001** | `auth.py` | Low | Secret key defaults to development fallback string if `SECRET_KEY` is omitted from environment. | Mitigated: Documented in `.env.example` to enforce unique secret keys in production. |
| **SEC-002** | `document_parser.py` | Low | Large PDF files (>50MB) could consume significant in-memory resources during extraction. | Mitigated: Bounded chunk limits and 12-evidence chunk caps per upload. |
| **SEC-003** | `main.py` | Low | CORS allows regex `https?://.*` in development mode. | Note: Should be restricted to production domain origins upon public deployment. |

---

## 2. Verified Strong Security Controls
- **Parameterized SQL:** 100% of queries use SQLAlchemy 2.0 ORM parameter bindings. Zero raw string interpolation found.
- **Tenant Isolation:** Every investigation and source query explicitly filters by `organization_id`.
- **JWT Protection:** Sensitive investigation and document upload endpoints require valid Bearer token credentials.
- **SHA-256 Provenance:** Every evidence item and uploaded file has an auditable cryptographic checksum.
