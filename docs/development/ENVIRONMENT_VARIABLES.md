# MERIDIAN — Environment Variables Specification

## Core System Environment Variables

| Variable Name | Level | Default | Description |
| :--- | :--- | :--- | :--- |
| `SECRET_KEY` | Backend | `meridian-production-secret...` | HMAC secret key used to encode and decode JWT tokens. |
| `DATABASE_URL` | Backend | `sqlite:///./meridian.db` | Connection URL for the relational database. |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| Backend | `1440` (24h) | JWT session expiration window. |
| `NEXT_PUBLIC_API_URL` | Frontend | `http://127.0.0.1:8000/api/v1` | URL where the browser makes REST & SSE calls. |

---

## AI & Multi-Model Provider API Keys

| Variable Name | Level | Default | Description |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Backend | None | Google AI Studio key for Gemini 3.8 Flash & Pro. |
| `GOOGLE_API_KEY` | Backend | None | Alternative fallback key for Google Generative AI. |
| `OPENAI_API_KEY` | Backend | None | OpenAI API key for GPT-4o & GPT-4o-mini. |
| `ANTHROPIC_API_KEY` | Backend | None | Anthropic Claude key for Claude 3.5 Sonnet & Haiku. |
| `OLLAMA_BASE_URL` | Backend | `http://127.0.0.1:11434` | Endpoint for local self-hosted Ollama models. |

---

## Financial Data & Ingestion Keys

| Variable Name | Level | Default | Description |
| :--- | :--- | :--- | :--- |
| `SEC_EDGAR_USER_AGENT` | Backend | `MeridianResearch compliance@meridian.internal` | Required by SEC EDGAR to prevent rate-limiting. |
