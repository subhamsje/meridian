"""
MERIDIAN Multi-Model Provider Abstraction & Health Check Layer
Supports OpenAI, Anthropic, Google Gemini, Ollama, and compatible local endpoints.
Provides health diagnostics, model discovery, connection testing, and latency benchmarking.
"""

import os
import time
from typing import Dict, Any, List, Optional
import litellm

class ProviderManager:
    """
    Manages multi-provider configurations, status introspection, and connectivity testing.
    """

    PROVIDERS_SCHEMA = [
        {
            "id": "openai",
            "name": "OpenAI Enterprise",
            "env_key": "OPENAI_API_KEY",
            "models": ["gpt-4o", "gpt-4o-mini", "o1-mini", "gpt-4-turbo"],
            "default_model": "gpt-4o-mini",
            "context_window": 128000,
            "structured_output_support": True
        },
        {
            "id": "anthropic",
            "name": "Anthropic Claude",
            "env_key": "ANTHROPIC_API_KEY",
            "models": ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-haiku-20240307"],
            "default_model": "claude-3-5-sonnet-20241022",
            "context_window": 200000,
            "structured_output_support": True
        },
        {
            "id": "gemini",
            "name": "Google Gemini",
            "env_key": "GEMINI_API_KEY",
            "alt_env_key": "GOOGLE_API_KEY",
            "models": ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash-exp"],
            "default_model": "gemini-1.5-flash",
            "context_window": 1000000,
            "structured_output_support": True
        },
        {
            "id": "ollama",
            "name": "Ollama / Local Inference",
            "env_key": "OLLAMA_BASE_URL",
            "default_endpoint": "http://localhost:11434",
            "models": ["llama3.2", "qwen2.5-coder", "mistral", "phi3"],
            "default_model": "llama3.2",
            "context_window": 32768,
            "structured_output_support": False
        }
    ]

    @classmethod
    def get_provider_statuses(cls) -> Dict[str, Any]:
        """
        Introspects system environment and reports health status of all supported LLM providers.
        """
        statuses = []
        any_connected = False

        for p in cls.PROVIDERS_SCHEMA:
            has_primary = bool(os.getenv(p.get("env_key", "")))
            has_alt = bool(os.getenv(p.get("alt_env_key", ""))) if "alt_env_key" in p else False
            configured = has_primary or has_alt

            # Check special case for Ollama local host
            if p["id"] == "ollama" and not configured:
                configured = os.path.exists("/usr/local/bin/ollama") or os.path.exists("/opt/homebrew/bin/ollama")

            if configured:
                status = "connected"
                any_connected = True
            else:
                status = "not_configured"

            statuses.append({
                "id": p["id"],
                "name": p["name"],
                "status": status,
                "configured": configured,
                "models": p["models"],
                "default_model": p["default_model"],
                "context_window": p["context_window"],
                "structured_output": p["structured_output_support"]
            })

        return {
            "orchestrator_engine": "litellm_unified_router",
            "active_default_model": "gpt-4o-mini",
            "fallback_model": "claude-3-haiku-20240307",
            "execution_mode": "multi_model_orchestrated" if any_connected else "grounded_offline_synthesis",
            "providers_count": len(statuses),
            "connected_count": sum(1 for s in statuses if s["configured"]),
            "providers": statuses
        }

    @classmethod
    def test_provider_connection(cls, provider_id: str, model: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes a real low-token diagnostic completion to measure latency and verify credentials.
        """
        target = next((p for p in cls.PROVIDERS_SCHEMA if p["id"] == provider_id), None)
        if not target:
            return {"status": "error", "error": f"Unknown provider ID: {provider_id}"}

        chosen_model = model or target["default_model"]
        start_time = time.time()

        try:
            # LiteLLM ping execution
            res = litellm.completion(
                model=chosen_model,
                messages=[{"role": "user", "content": "PING: Respond with 'PONG'."}],
                max_tokens=5,
                temperature=0.0
            )
            latency_ms = int((time.time() - start_time) * 1000)
            return {
                "status": "connected",
                "provider": provider_id,
                "model_tested": chosen_model,
                "latency_ms": latency_ms,
                "response": res.choices[0].message.content.strip(),
                "timestamp": time.time()
            }
        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            err_str = str(e)
            
            if "Authentication" in err_str or "auth" in err_str.lower() or "api_key" in err_str.lower():
                status_code = "authentication_failed"
            elif "rate_limit" in err_str.lower() or "quota" in err_str.lower():
                status_code = "rate_limited"
            elif "not found" in err_str.lower() or "model" in err_str.lower():
                status_code = "model_unavailable"
            else:
                status_code = "temporarily_unavailable"

            return {
                "status": status_code,
                "provider": provider_id,
                "model_tested": chosen_model,
                "latency_ms": latency_ms,
                "error_detail": err_str[:250],
                "timestamp": time.time()
            }
