import pytest
import asyncio
from models import Investigation, Company
from company_discovery import CompanyDiscoveryEngine
from research_ingestion import ResearchIngestionEngine
from investment_dossier import InvestmentDossierGenerator
from multi_agent_society_engine import MultiAgentSocietyEngine

def test_company_discovery_engine_public_and_private():
    # 1. Test Public Company Discovery (NVIDIA / NVDA)
    nvda_results = asyncio.run(CompanyDiscoveryEngine.discover("NVDA"))
    assert len(nvda_results) >= 1
    nvda = nvda_results[0]
    assert nvda.company_type == "public"
    assert nvda.ticker == "NVDA"
    assert "Jensen Huang" in nvda.founders
    assert nvda.data_availability == "HIGH"
    assert nvda.market_cap_usd is not None

    # 2. Test Private Unicorn Discovery (OpenAI)
    oai_results = asyncio.run(CompanyDiscoveryEngine.discover("OpenAI"))
    assert len(oai_results) >= 1
    oai = oai_results[0]
    assert oai.company_type == "private"
    assert "Sam Altman" in oai.founders
    assert oai.data_availability == "HIGH"
    assert oai.market_cap_usd >= 100_000_000_000

    # 3. Test Private Startup Discovery (Zepto)
    zepto_results = asyncio.run(CompanyDiscoveryEngine.discover("Zepto"))
    assert len(zepto_results) >= 1
    zepto = zepto_results[0]
    assert zepto.company_type in ["startup", "private"]
    assert "Aadit Palicha" in zepto.founders
    assert zepto.data_availability in ["HIGH", "MODERATE"]

    # 4. Test Profile Details Resolution
    profile = CompanyDiscoveryEngine.resolve_profile_details(oai)
    assert profile is not None
    assert profile["name"] == "OpenAI"
    assert "ChatGPT" in profile["short_description"]


def test_research_ingestion_and_graph_expansion(db_session, client):
    # Register analyst
    reg = client.post("/api/v1/auth/register", json={
        "email": "dossier.analyst@meridian.internal",
        "full_name": "Marcus Aurelius Vance",
        "password": "InstitutionalPassword2026!",
        "organization_name": "Apex Research Group"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create investigation
    create_res = client.post("/api/v1/investigations", headers=headers, json={
        "company_name": "OpenAI",
        "ticker": "OAI",
        "sector": "Frontier AI Lab",
        "company_type": "private",
        "depth": "comprehensive",
        "budget_limit_usd": 250.0
    })
    assert create_res.status_code == 200
    inv_id = create_res.json()["investigation_id"]

    inv = db_session.query(Investigation).filter(Investigation.id == inv_id).first()
    company = db_session.query(Company).filter(Company.id == inv.company_id).first()

    # Ingest evidence & expand knowledge graph
    ingestion_summary = asyncio.run(ResearchIngestionEngine.ingest(
        db=db_session,
        investigation=inv,
        company=company,
        depth="comprehensive"
    ))
    assert ingestion_summary["evidence_ingested"] >= 3
    assert ingestion_summary["graph_nodes_created"] >= 3

    # Check evidence endpoint
    ev_res = client.get(f"/api/v1/investigations/{inv_id}/evidence", headers=headers)
    assert ev_res.status_code == 200
    evidence_items = ev_res.json()
    assert len(evidence_items) >= 3

    # Verify epistemic status values
    assert all("Reliability:" in (e["reliability_assessment"] or "") for e in evidence_items)

    # Check graph endpoint
    graph_res = client.get(f"/api/v1/investigations/{inv_id}/graph", headers=headers)
    assert graph_res.status_code == 200
    graph_data = graph_res.json()
    assert len(graph_data["nodes"]) >= 3
    assert len(graph_data["edges"]) >= 2


def test_stock_intelligence_endpoint(db_session, client):
    reg = client.post("/api/v1/auth/register", json={
        "email": "quant.trader@meridian.internal",
        "full_name": "Alexander Hamilton Quant",
        "password": "InstitutionalPassword2026!",
        "organization_name": "Hamilton Quantitative Capital"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Public company with NVDA ticker
    inv_res = client.post("/api/v1/investigations", headers=headers, json={
        "company_name": "NVIDIA Corporation",
        "ticker": "NVDA",
        "sector": "Semiconductors",
        "company_type": "public",
        "depth": "standard"
    })
    inv_id = inv_res.json()["investigation_id"]

    stock_res = client.get(f"/api/v1/investigations/{inv_id}/stock", headers=headers)
    assert stock_res.status_code == 200
    stock = stock_res.json()
    assert stock["has_stock"] is True
    assert stock["ticker"] == "NVDA"
    assert stock["current_price"] > 0
    assert stock["market_cap"] > 1_000_000_000_000
    assert len(stock["history"]) >= 5


def test_investment_dossier_and_pdf_generation(db_session, client):
    reg = client.post("/api/v1/auth/register", json={
        "email": "committee.chair@meridian.internal",
        "full_name": "Honorable Evelyn Cross",
        "password": "InstitutionalPassword2026!",
        "organization_name": "Cross Sovereign Endowment"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    inv_res = client.post("/api/v1/investigations", headers=headers, json={
        "company_name": "Palantir Technologies Inc.",
        "ticker": "PLTR",
        "sector": "Enterprise Software & Defense AI",
        "company_type": "public",
        "depth": "comprehensive"
    })
    inv_id = inv_res.json()["investigation_id"]

    # Run multi-agent society pipeline to generate claims and reports
    asyncio.run(MultiAgentSocietyEngine.run_full_society_pipeline(inv_id, db_session))

    # Test JSON Dossier endpoint (11 sections)
    dossier_res = client.get(f"/api/v1/investigations/{inv_id}/dossier", headers=headers)
    assert dossier_res.status_code == 200
    dossier = dossier_res.json()
    assert len(dossier["sections"]) == 11
    assert "investment_decision" in dossier
    assert dossier["investment_decision"]["recommendation"] is not None
    assert dossier["investment_decision"]["confidence_pct"] > 50

    # Verify section titles
    section_titles = [s["title"] for s in dossier["sections"]]
    assert "Executive Summary" in section_titles
    assert "Company Overview & Architecture" in section_titles
    assert "Market & Industry Structure (TAM/SAM)" in section_titles
    assert "Financial Performance & Unit Economics" in section_titles
    assert "Management & Governance Audit" in section_titles
    assert "Investment Decision & Risk Register" in section_titles
    assert "Evidence Appendix & Documentary Sources" in section_titles

    # Test PDF Generation endpoint
    pdf_res = client.get(f"/api/v1/investigations/{inv_id}/dossier/pdf", headers=headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    pdf_bytes = pdf_res.content
    assert len(pdf_bytes) > 2000
    assert pdf_bytes.startswith(b"%PDF-")


def test_tenant_isolation_security(db_session, client):
    # User A in Org A
    reg_a = client.post("/api/v1/auth/register", json={
        "email": "user.alpha@tenant-a.internal",
        "full_name": "User Alpha",
        "password": "TenantPassword2026!",
        "organization_name": "Tenant Alpha Inc"
    })
    token_a = reg_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # User B in Org B
    reg_b = client.post("/api/v1/auth/register", json={
        "email": "user.beta@tenant-b.internal",
        "full_name": "User Beta",
        "password": "TenantPassword2026!",
        "organization_name": "Tenant Beta Inc"
    })
    token_b = reg_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User A creates investigation
    inv_res = client.post("/api/v1/investigations", headers=headers_a, json={
        "company_name": "Classified Defense AI Target",
        "sector": "Defense",
        "company_type": "private"
    })
    inv_id = inv_res.json()["investigation_id"]

    # User A can read their own investigation
    get_a = client.get(f"/api/v1/investigations/{inv_id}", headers=headers_a)
    assert get_a.status_code == 200

    # User B should NOT be able to read User A's investigation (Tenant isolation)
    get_b = client.get(f"/api/v1/investigations/{inv_id}", headers=headers_b)
    assert get_b.status_code in [403, 404]
