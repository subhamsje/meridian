import pytest
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../apps/api")))
from research_provider import CompanyResearchResolver

def test_benchmark_resolution():
    """Verify known benchmarks return institutional ground truth."""
    for ticker in ["NVDA", "PLTR", "MSFT", "AAPL", "SNOW", "CRWD"]:
        p = CompanyResearchResolver.resolve_company(name="", ticker=ticker)
        assert p is not None
        assert p.ticker == ticker
        assert p.revenue_ltm_m > 0
        assert p.gross_margin_pct > 0
        assert p.cash_reserves_m > 0
        assert len(p.verified_sources) >= 2
        assert len(p.relationships) >= 2
        assert p.data_availability == "HIGH"
        assert p.is_unreported is False

def test_live_public_equity_resolution():
    """Verify live public equities resolve real financials from public disclosure archives."""
    # Test Indian public conglomerate
    reliance = CompanyResearchResolver.resolve_company(name="Reliance Industries", ticker="RELIANCE.NS")
    assert reliance is not None
    assert reliance.ticker == "RELIANCE.NS"
    assert reliance.revenue_ltm_m > 1000000.0  # In INR millions
    assert reliance.data_availability == "HIGH"
    assert reliance.is_unreported is False
    assert any("RELIANCE" in s["title"] for s in reliance.verified_sources)

    # Test Global Automotive entity
    toyota = CompanyResearchResolver.resolve_company(name="Toyota Motor", ticker="TM")
    assert toyota is not None
    assert toyota.ticker == "TM"
    assert toyota.revenue_ltm_m > 100000.0
    assert toyota.gross_margin_pct > 0.0

def test_private_unicorn_and_startup_resolution():
    """Verify private unicorns and startups resolve with grounded venture metrics."""
    openai = CompanyResearchResolver.resolve_company(name="OpenAI")
    assert openai is not None
    assert "OpenAI" in openai.name
    assert openai.data_availability in ["HIGH", "MODERATE"]
    assert openai.revenue_ltm_m > 0
    assert openai.cash_reserves_m > 0
    assert openai.is_unreported is False
    assert len(openai.primary_risks) >= 2

    zepto = CompanyResearchResolver.resolve_company(name="Zepto")
    assert zepto is not None
    assert "Zepto" in zepto.name
    assert zepto.revenue_ltm_m > 0
    assert zepto.is_unreported is False

def test_sparse_entity_resolution_no_hallucination():
    """Verify unlisted, sparse entities never fabricate fake random revenue numbers."""
    sparse = CompanyResearchResolver.resolve_company(name="Acme Stealth AI Frontier Labs")
    assert sparse is not None
    assert sparse.data_availability == "SPARSE"
    assert sparse.is_unreported is True
    assert sparse.revenue_ltm_m == 0.0
    assert sparse.gross_margin_pct == 0.0
    assert sparse.cash_reserves_m == 0.0
    # Explicit research gaps must be present
    assert len(sparse.research_gaps) >= 3
    assert any("Form 10-K" in g for g in sparse.research_gaps)
    assert any("Absence of Statutory Financial Filings" in r["category"] for r in sparse.primary_risks)
