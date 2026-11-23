# ADR-003: Multi-Agent Society Orchestration and Model Portability with LiteLLM

## Status
Accepted

## Context
MERIDIAN operates a persistent society of 16 specialized agents (Forensic Accountant, Sovereign Risk Officer, Competitive Strategist, Bull Analyst, Bear Analyst, etc.).
Hardcoding proprietary LLM client libraries (e.g., standard OpenAI SDK or Anthropic SDK) creates vendor lock-in, complicates deployment across enterprise environments with varying API key policies, and risks total service outage when external APIs fail or are rate-limited.

## Decision
We engineered the **ModelOrchestrationService** utilizing **LiteLLM** (`litellm`) and **Pydantic v2**:
- **LiteLLM**: Unified proxy and client layer supporting over 100+ LLM providers (OpenAI, Anthropic Claude, Google Gemini, Azure OpenAI, AWS Bedrock, and local Ollama) using an identical interface.
- **Pydantic v2 Schema Validation**: All agent structured outputs (atomic claims, peer challenges, evidence citations) are validated against strict Pydantic schemas.
- **Empirical Grounded Offline Fallback**: In offline, sandboxed, or keyless evaluation environments, the orchestrator automatically synthesizes grounded responses derived strictly from primary SEC 10-K regulatory filings, preventing pipeline crashes.

## Consequences
### Positive
- Vendor independence: Enterprise customers can route specialist reasoning to local models (Ollama/vLLM) or private cloud endpoints (Azure/AWS) without code modifications.
- Unified token usage and cost accounting: Every prompt and completion tracks exact input/output tokens and USD costs.
- High resilience: Automated fallback ensures uninterrupted demonstration execution even during network partitions.

### Negative / Trade-offs
- LiteLLM introduces a dependency footprint that requires runtime compatibility shims in certain Python environments (e.g., `typing.NotRequired` on Python 3.10).
