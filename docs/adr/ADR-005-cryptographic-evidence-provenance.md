# ADR-005: Cryptographic Evidence Provenance and Regulatory Disclosure Ingestion

## Status
Accepted

## Context
In institutional forensic intelligence and legal investigation, synthetic claims or ungrounded generative summaries are intolerable. Every quantitative figure, contractual relationship, or corporate claim must be traced back to its primary documentary disclosure (e.g., SEC Form 10-K, Congressional Research Service reports, Department of Defense award notices) with tamper-proof provenance.

## Decision
We implemented the **ResearchIngestionEngine** and **Cryptographic Evidence Registry**:
1. **Document Ingestion (`BeautifulSoup4` + `lxml`)**:
   - Parses official SEC HTML/XML regulatory filings and disclosure tables.
   - Extracts structured numerical items (Revenue, Gross Margin, Operating Cash Flow, R&D expense, Sovereign Customer concentration) directly from audited disclosure tables.
2. **Cryptographic SHA-256 Provenance Hashing**:
   - Every raw text chunk, table row, and extracted disclosure is hashed using SHA-256:
     $$\text{Provenance Hash} = \text{SHA256}(\text{source\_id} \parallel \text{filing\_period} \parallel \text{raw\_disclosure\_bytes})$$
   - Hashes are immutably stored alongside evidence items in SQLite/PostgreSQL.
   - The Provenance Inspector exposes these hashes and allows analysts to verify that the extracted claim matches the exact byte sequence of the filed regulatory document.

## Consequences
### Positive
- Zero tolerance for hallucination: Every number in MERIDIAN's dossier is linked to an audited primary filing.
- Audit readiness: Compliance teams and institutional auditors can independently verify citations against EDGAR archives using the SHA-256 hash.
- Open-source parsing: Utilizes standard `beautifulsoup4` without expensive commercial scrapers.

### Negative / Trade-offs
- Parsing legacy EDGAR HTML formats requires robust fallback heuristics when XBRL or table schemas vary across historical filing years.
