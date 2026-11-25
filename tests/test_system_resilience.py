"""
MERIDIAN System Resilience, Failure Recovery & Edge-Case Test Suite
Validates document parsing resilience, provider diagnostics, currency bounds,
and orchestrator fallbacks under adverse conditions.
"""

import pytest
import io
import json
import os
import sys

# Ensure apps/api is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../apps/api")))

from document_parser import DocumentParsingService
from provider_manager import ProviderManager
from agent_orchestrator import ModelOrchestrationService, AgentMandateSchema
from currency_service import CurrencyService
from investment_dossier import InvestmentDossierGenerator


def test_document_parser_empty_bytes_resilience():
    """Validates that parsing a 0-byte document never raises an unhandled exception."""
    res = DocumentParsingService.parse_document("empty_filing.pdf", b"", "application/pdf")
    assert res["extraction_status"] == "empty"
    assert res["file_size_bytes"] == 0
    assert res["page_or_sheet_count"] == 0
    assert "empty" in res["error_message"].lower()
    assert res["extracted_text"] == ""


def test_document_parser_multi_encoding_resilience():
    """Validates that non-UTF-8 encoded files (e.g. Latin-1) are safely decoded."""
    latin1_text = "Valoración estimada en 500M con márgenes del 18.5% y crédito garantizado."
    raw_bytes = latin1_text.encode("latin-1")
    
    res = DocumentParsingService.parse_document("financial_note.txt", raw_bytes, "text/plain")
    assert res["extraction_status"] == "processed"
    assert "Valoración" in res["extracted_text"]
    assert len(res["checksum_sha256"]) == 64


def test_document_parser_csv_and_json_parsing():
    """Validates CSV and JSON parsing with structured metadata."""
    csv_content = "Year,Revenue_USD_M,Gross_Margin\n2022,26914,0.569\n2023,60922,0.727\n2024,120000,0.750"
    res_csv = DocumentParsingService.parse_document("financials.csv", csv_content.encode("utf-8"), "text/csv")
    assert res_csv["extraction_status"] == "processed"
    assert "Revenue_USD_M" in res_csv["extracted_text"]
    assert res_csv["extracted_metadata"]["row_count"] == 3

    json_content = json.dumps({"company": "NVDA", "sector": "Semiconductors", "wacc": 0.098})
    res_json = DocumentParsingService.parse_document("metadata.json", json_content.encode("utf-8"), "application/json")
    assert res_json["extraction_status"] == "processed"
    assert res_json["extracted_metadata"]["is_valid_json"] is True
    assert "Semiconductors" in res_json["extracted_text"]


def test_provider_manager_diagnostics_structure():
    """Validates that provider manager diagnostics return a complete and valid health matrix."""
    diagnostics = ProviderManager.get_system_diagnostics()
    assert "status" in diagnostics
    assert "active_llm_count" in diagnostics
    assert "operational_providers" in diagnostics
    assert "matrix" in diagnostics
    assert len(diagnostics["matrix"]) == 4

    provider_ids = [item["provider"] for item in diagnostics["matrix"]]
    assert "openai" in provider_ids
    assert "anthropic" in provider_ids
    assert "gemini" in provider_ids
    assert "ollama" in provider_ids

    for item in diagnostics["matrix"]:
        assert "health" in item
        assert "latency_ms" in item
        assert isinstance(item["latency_ms"], (int, float))


def test_orchestration_active_model_selection():
    """Validates dynamic model routing based on available environment credentials."""
    active_model = ModelOrchestrationService.get_active_model()
    assert isinstance(active_model, str)
    assert len(active_model) > 0


def test_currency_conversion_institutional_bounds():
    """Validates Indian Numbering System formatting across various monetary scales."""
    # Zero
    res_zero = CurrencyService.convert_usd_to_inr(0)
    assert res_zero.converted_amount == 0.0
    assert "₹0" in res_zero.formatted_inr

    # 1 Billion USD = ~8600 Crore INR
    res_1b = CurrencyService.convert_usd_to_inr(1_000_000_000)
    assert res_1b.converted_amount > 80_000_000_000
    assert "Cr" in res_1b.formatted_inr

    # 1 Trillion USD = ~86 Lakh Crore INR
    res_1t = CurrencyService.convert_usd_to_inr(1_000_000_000_000)
    assert "Lakh Cr" in res_1t.formatted_inr


def test_claim_statement_sanitization_resilience():
    """Validates that duplicate qualification strings are properly stripped."""
    raw_statement = (
        "Enterprise gross margins expanded to 75.3% "
        "(Qualified: subject to customer concentration risks) "
        "(Qualified: subject to customer concentration risks)"
    )
    sanitized = InvestmentDossierGenerator.sanitize_claim_statement(raw_statement)
    assert sanitized.count("(Qualified: subject to customer concentration risks)") == 1
