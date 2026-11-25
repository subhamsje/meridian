# MERIDIAN — Universal Research Pipeline & Ingestion Engine

## 1. Overview
The Universal Company Research Engine (`apps/api/research_provider.py`) eliminates financial hallucination by enforcing multi-source verification and zero-hallucination disclaimers across all four enterprise categories.

```
+---------------------------------------------------------------------------------------------------+
|                                  UNIVERSAL COMPANY RESOLVER                                       |
+---------------------------------------------------------------------------------------------------+
       |                                   |                              |                         |
       v                                   v                              v                         v
+------------------+             +-------------------+          +-------------------+     +------------------+
| CATEGORY 1:      |             | CATEGORY 2:       |          | CATEGORY 3:       |     | CATEGORY 4:      |
| Benchmark Cache  |             | Global Equities   |          | Private Unicorns  |     | Sparse Entities  |
| NVDA, MSFT, AAPL |             | yfinance & EDGAR  |          | Venture Records   |     | Early Labs, Pre- |
| Instant Audited  |             | US, IN (.NS),     |          | OpenAI, Anthropic |     | Revenue Startups |
| SEC 10-K Cache   |             | Europe, Japan     |          | Stripe, Zepto     |     | Research Gaps    |
+------------------+             +-------------------+          +-------------------+     +------------------+
```

---

## 2. The Four Company Coverage Tiers

### Tier 1: Benchmark Fast-Cache
- **Coverage:** `NVDA`, `PLTR`, `MSFT`, `AAPL`, `SNOW`, `CRWD`.
- **Latency:** Instant sub-second response.
- **Evidence:** Audited SEC FY24/FY25 Form 10-K filings, CIK filings, gross margin tables, Capex commitments, and verified customer concentration percentages.

### Tier 2: Global Public Equities (`yfinance` & SEC EDGAR)
- **Coverage:** All publicly traded equities worldwide:
  - US Equities: `AMZN`, `GOOGL`, `TSLA`, `AMD`, etc.
  - Indian Conglomerates & Equities: `RELIANCE.NS`, `TCS.NS`, `HDFCBANK.NS`, `INFY.NS`.
  - European & Asian Leaders: `TM` (Toyota), `ASML`, `BABA`.
- **Extraction:** Live balance sheet metrics, trailing and forward P/E, 52-week price channels, gross margins, operating cash flows, cash reserves, and primary business descriptions.

### Tier 3: Private Unicorns & Scaled Startups
- **Coverage:** `OpenAI`, `Anthropic`, `Stripe`, `SpaceX`, `Zepto`, `Razorpay`, `Databricks`, `ByteDance`.
- **Resolution Standard:** Audited venture funding histories, total equity raised, syndicate cap tables, primary institutional backers, and benchmarked revenue multiples.
- **Epistemic Label:** `data_availability: "VENTURE_DISCLOSED"`, `is_unreported: True`. Every record contains a statutory notice stating that SEC audited filings are not publicly mandated.

### Tier 4: Sparse Entities & Early-Stage Startups
- **Coverage:** Unknown entities, early-stage labs, and niche private businesses.
- **Zero-Hallucination Guarantee:** Completely removes pseudo-random number generation. Returns `data_availability: "SPARSE"`, sets financial numbers to `0.0` or `None`, and explicitly documents 3+ verified research gaps:
  1. No publicly mandated statutory SEC filings or CIK registry.
  2. Proprietary revenue figures are held confidentially.
  3. Valuation multiples are unverified on public exchanges.

---

## 3. Multi-Format Document Ingestion Engine (`apps/api/document_parser.py`)
- **PDF Extraction:** PyMuPDF (`pymupdf`) extracts clean page-by-page text, preserving section headers and numbering.
- **Spreadsheet & Tabular Processing:** `openpyxl` and `pandas` parse Excel workbooks (`.xlsx`, `.xls`) and CSV files (`.csv`), preserving column schemas, row counts, and numerical precision.
- **Word & Slide Extraction:** `python-docx` extracts paragraphs and tables from Word documents (`.docx`); `python-pptx` parses slide decks (`.pptx`).
- **Web & JSON Ingestion:** `BeautifulSoup4` extracts semantic body text from HTML filings; `json` parses structured financial feeds.
- **Encoding Resilience:** Automatically attempts `UTF-8`, `UTF-8-SIG`, `Latin-1`, and `CP1252` before falling back to replacement characters, ensuring zero crashes on legacy filings.
- **Chunking & Provenance:** Automatically chunks text into 500–1,500 character passages and injects them as verified `EvidenceItem` rows with SHA-256 checksums into the investigation context.
