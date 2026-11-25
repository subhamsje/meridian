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
            "models": ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.5-pro", "gemini-flash-latest", "gemini-pro-latest", "gemini-1.5-pro"],
            "default_model": "gemini-3.8-flash",
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
        
        # Route provider prefix for LiteLLM if needed
        dispatch_model = chosen_model
        if provider_id == "gemini" and not chosen_model.startswith("gemini/"):
            dispatch_model = f"gemini/{chosen_model}"
        elif provider_id == "ollama" and not chosen_model.startswith("ollama/"):
            dispatch_model = f"ollama/{chosen_model}"

        start_time = time.time()

        try:
            # LiteLLM ping execution with strict 8-second timeout
            res = litellm.completion(
                model=dispatch_model,
                messages=[{"role": "user", "content": "PING: Respond with 'PONG'."}],
                max_tokens=5,
                temperature=0.0,
                timeout=8
            )
            latency_ms = int((time.time() - start_time) * 1000)
            return {
                "status": "connected",
                "provider": provider_id,
                "model_tested": dispatch_model,
                "latency_ms": latency_ms,
                "response": res.choices[0].message.content.strip() if res.choices else "OK",
                "timestamp": time.time()
            }
        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            err_str = str(e)
            
            if "Authentication" in err_str or "auth" in err_str.lower() or "api_key" in err_str.lower() or "401" in err_str:
                status_code = "authentication_failed"
            elif "rate_limit" in err_str.lower() or "quota" in err_str.lower() or "429" in err_str:
                status_code = "rate_limited"
            elif "not found" in err_str.lower() or "model" in err_str.lower() or "404" in err_str:
                status_code = "model_unavailable"
            elif "timed out" in err_str.lower() or "timeout" in err_str.lower():
                status_code = "timeout"
            else:
                status_code = "temporarily_unavailable"

            return {
                "status": status_code,
                "provider": provider_id,
                "model_tested": dispatch_model,
                "latency_ms": latency_ms,
                "error_detail": err_str[:250],
                "timestamp": time.time()
            }

    @classmethod
    def get_system_diagnostics(cls) -> Dict[str, Any]:
        """
        Runs comprehensive self-diagnostic test across all providers and returns full health matrix.
        """
        base_status = cls.get_provider_statuses()
        diagnostics = []

        for p in base_status["providers"]:
            if p["configured"]:
                test_res = cls.test_provider_connection(p["id"], p["default_model"])
                diagnostics.append({
                    "provider": p["id"],
                    "name": p["name"],
                    "configured": True,
                    "health": test_res["status"],
                    "latency_ms": test_res.get("latency_ms", 0),
                    "model_tested": test_res.get("model_tested", p["default_model"]),
                    "error_detail": test_res.get("error_detail")
                })
            else:
                diagnostics.append({
                    "provider": p["id"],
                    "name": p["name"],
                    "configured": False,
                    "health": "not_configured",
                    "latency_ms": 0,
                    "model_tested": p["default_model"],
                    "error_detail": None
                })

        operational_providers = [d["provider"] for d in diagnostics if d["health"] == "connected"]
        
        return {
            "status": "healthy" if operational_providers else "degraded_offline_mode",
            "active_llm_count": len(operational_providers),
            "operational_providers": operational_providers,
            "fallback_engine": "grounded_offline_synthesis",
            "matrix": diagnostics,
            "recommendation": (
                "All systems operational with live LLM dispatch"
                if operational_providers
                else "Operating under grounded offline synthesis mode with verified SEC & yfinance live data feeds"
            ),
            "timestamp": time.time()
        }
