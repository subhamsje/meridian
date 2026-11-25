# MERIDIAN — Troubleshooting & Diagnostic Guide

## Common Issues & Verified Resolutions

### 1. `{"detail":"Not Found"}` when navigating to `/docs`
- **Root Cause:** In `apps/api/main.py`, FastAPI is configured with `docs_url="/api/docs"` and `openapi_url="/api/openapi.json"`.
- **Resolution:** Open [http://localhost:8000/api/docs](http://localhost:8000/api/docs) instead of `/docs`.

### 2. LiteLLM reports `GeminiException: models/gemini-1.5-flash is not found`
- **Root Cause:** Google deprecated `gemini-1.5-flash` for new API calls, recommending `gemini-3.8-flash` or `gemini-2.5-flash`. Additionally, LiteLLM requires the `gemini/` prefix.
- **Resolution:** `ProviderManager` and `agent_orchestrator.py` have been updated to format models as `gemini/gemini-3.8-flash`. Verify your key with `curl -s http://127.0.0.1:8000/api/v1/providers/diagnostics`.

### 3. Missing or Zero-Byte File Ingestion Error
- **Root Cause:** Uploading an empty 0-byte file previously triggered unhandled exceptions in `pymupdf` or `pandas.read_csv`.
- **Resolution:** `DocumentParsingService.parse_document` guards `file_size == 0`, returning `extraction_status: "empty"` with a descriptive error message without throwing a 500 error.

### 4. Horizontal Navigation Clipping on Laptops / Small Displays (1280×800)
- **Root Cause:** Overly wide tab badges (`Overview completed`) expanded the tab bar beyond the available container width.
- **Resolution:** Tab definitions have been streamlined and view-specific subtabs moved into secondary toolbars, providing over 170px of clearance at 1280px resolution.

### 5. `concludes: None` in Agent Interactions
- **Root Cause:** When `SocietyAgent.initial_position` was null, string formatting evaluated `None` as a literal string.
- **Resolution:** `scenario_simulation_engine.py` dynamically checks `initial_position or current_position or mandate` to ensure all statements are grounded in real mandates.
