# MERIDIAN — API Endpoint Reference Matrix

Base Route: `/api/v1`
Interactive Swagger UI: `http://localhost:8000/api/docs`
OpenAPI JSON Schema: `http://localhost:8000/api/openapi.json`

---

## 1. Authentication & Tenant Endpoints

| Method | Endpoint | Purpose | Request Body | Auth Required | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new organization & analyst account | `{email, password, full_name, organization_name}` | No | Verified |
| `POST` | `/auth/login` | Login and obtain JWT token | `{email, password}` | No | Verified |
| `GET` | `/auth/me` | Fetch authenticated analyst & organization profile | None | Bearer JWT | Verified |
| `GET` | `/demo/flagship` | Seed & return token for institutional NVDA demo | None | No | Verified |

---

## 2. Investigation & Execution Endpoints

| Method | Endpoint | Purpose | Request Body | Auth Required | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/investigations` | List all investigations for current tenant | Query params | Bearer JWT | Verified |
| `POST` | `/investigations` | Create new investigation | `{company_name, ticker, sector, depth, debate_mode}` | Bearer JWT | Verified |
| `GET` | `/investigations/{id}` | Get detailed investigation metadata | None | Bearer JWT | Verified |
| `POST` | `/investigations/{id}/executions/start` | Start durable 7-stage execution | None | Bearer JWT | Verified |
| `POST` | `/investigations/{id}/executions/cancel` | Abort active running execution | None | Bearer JWT | Verified |
| `GET` | `/investigations/{id}/executions` | List durable execution runs | None | Bearer JWT | Verified |
| `GET` | `/investigations/{id}/events/stream` | Server-Sent Events real-time progress stream | Query `?token=...` | Bearer / Token | Verified |

---

## 3. Society, Debate & Claims Endpoints

| Method | Endpoint | Purpose | Request Body | Auth Required | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/investigations/{id}/society/agents` | List active specialists & confidence | None | Bearer JWT | Verified |
| `GET` | `/investigations/{id}/society/interactions` | Fetch debate transcript messages | None | Bearer JWT | Verified |
| `GET` | `/investigations/{id}/claims` | Fetch registered claims & verdicts | None | Bearer JWT | Verified |
| `POST` | `/investigations/{id}/society/intervene` | God-view simulation intervention | `{event_description, target_specialists}` | Bearer JWT | Verified |
| `POST` | `/investigations/{id}/society/interview` | 1-on-1 specialist interview query | `{agent_id, question}` | Bearer JWT | Verified |
| `POST` | `/investigations/{id}/society/survey` | Plenary multi-specialist survey | `{prompt}` | Bearer JWT | Verified |

---

## 4. Financials, Knowledge Graph & Reports

| Method | Endpoint | Purpose | Request Body | Auth Required | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/investigations/{id}/graph` | Corporate knowledge graph (nodes, edges) | None | Bearer JWT | Verified |
| `GET` | `/investigations/{id}/stock` | 30-day stock series & valuation metrics | None | Bearer JWT | Verified |
| `GET` | `/investigations/{id}/dossier` | Complete 19-section research memorandum | None | Bearer JWT | Verified |
| `GET` | `/investigations/{id}/dossier/pdf` | Download official compiled ReportLab PDF | None | No / Public | Verified |
| `POST` | `/investigations/{id}/documents` | Upload & ingest research files (multipart) | `files: List[UploadFile]` | Bearer JWT | Verified |
| `GET` | `/investigations/{id}/documents` | List ingested files and extraction status | None | Bearer JWT | Verified |

---

## 5. Providers & Currency Diagnostic Endpoints

| Method | Endpoint | Purpose | Request Body | Auth Required | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/providers/status` | Current configuration of all LLM providers | None | No | Verified |
| `GET` | `/providers/diagnostics` | Live connectivity ping & health matrix | None | No | Verified |
| `POST` | `/providers/test` | Latency ping on single provider/model | `{provider_id, model_id}` | No | Verified |
| `GET` | `/currency/rate` | Current USD/INR benchmark exchange rate | None | No | Verified |
| `POST` | `/currency/convert` | Convert USD amount to Indian Numbering System | `{amount_usd}` | No | Verified |
