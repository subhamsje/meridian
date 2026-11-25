# MERIDIAN — External Integrations & Service Status

| Integration Service | Purpose | Implementation File | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **SEC EDGAR API** | Primary SEC 10-K/10-Q filing retrieval | `research_provider.py` | **OPERATIONAL** | Uses custom institutional User-Agent header; falls back to cached CIK mapping. |
| **yfinance Engine** | Real-time global equity market quotes & multiples | `research_provider.py` | **OPERATIONAL** | Retrieves revenue, P/E, 52-week channels, gross margin for global tickers (`NVDA`, `RELIANCE.NS`, `TM`). |
| **RBI Reference Currency** | USD to INR conversion with Indian Numbering | `currency_service.py` | **OPERATIONAL** | Formats currency in ₹ Lakh, ₹ Crore, and ₹ Lakh Crore standards. |
| **PyMuPDF Engine** | High-precision PDF text extraction | `document_parser.py` | **OPERATIONAL** | Extracts text with page headers; handles 0-byte and corrupted streams gracefully. |
| **ReportLab PDF Engine**| Institutional PDF document compilation | `investment_dossier.py`| **OPERATIONAL** | Compiles 19-section PDF with custom styles and dynamic table formatting. |
| **DuckDB In-Process**  | Fast OLAP scenario & Monte Carlo modeling | `scenario_simulation_engine.py` | **OPERATIONAL** | In-process columnar calculations with zero network latency. |
| **Google Gemini API**   | Live LLM completions (Flash & Pro) | `provider_manager.py` | **CONFIGURED** | Requires active, unrestricted `GEMINI_API_KEY`. |
| **OpenAI API**          | GPT-4o enterprise model dispatch | `provider_manager.py` | **CONFIGURED** | Ready upon providing `OPENAI_API_KEY`. |
| **Anthropic Claude API**| Claude 3.5 Sonnet & Haiku model dispatch | `provider_manager.py` | **CONFIGURED** | Ready upon providing `ANTHROPIC_API_KEY`. |
| **Ollama Local Engine** | Self-hosted local open-weights inference | `provider_manager.py` | **CONFIGURED** | Tested against `http://localhost:11434`. |
