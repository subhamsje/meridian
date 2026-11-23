# MERIDIAN Security Assessment & Trust Boundaries

## 1. Authentication & Cryptography
- **Password Hashing**: Standard PBKDF2-HMAC-SHA256 with 100,000 iterations and 16-byte random salt per user.
- **Session Tokens**: Cryptographically signed JSON Web Tokens (HS256) with strict subject claims and expiration timestamps.
- **Secrets Management**: Configuration via environment variables with zero plaintext credentials stored in version control.

## 2. Multi-Tenant Authorization Enforcement
- Every API endpoint manipulating an investigation or sub-resource explicitly resolves `current_organization` from the caller's JWT and queries with `organization_id == org.id`.
- Attempts by tenant B to read or alter tenant A's investigation ID strictly fail with `404 Not Found` (preventing ID enumeration).

## 3. Untrusted External Data Boundary
- External filing texts, news extracts, and web documents are treated as untrusted data.
- Extraction passages are quarantined within structured evidence records and sanitized before presentation in the browser.
- External model calls or prompts are isolated from executive system operations.
