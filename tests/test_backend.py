import pytest
import asyncio

from models import User, Organization, Investigation, AdjudicationVerdict

def test_multi_agent_society_and_intervention(client, db_session):
    # 1. Register User and Organization
    reg = client.post("/api/v1/auth/register", json={
        "email": "lead.investigator@meridian-intel.internal",
        "full_name": "Dr. Eleanor Vance",
        "password": "InstitutionalSecurePassword2026!",
        "organization_name": "Vance Global Intelligence"
    })
    assert reg.status_code == 200
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Investigation into Palantir (PLTR)
    create_res = client.post("/api/v1/investigations", headers=headers, json={
        "company_name": "Palantir Technologies",
        "ticker": "PLTR",
        "domain": "palantir.com",
        "company_type": "public",
        "sector": "Enterprise Software & Defense AI",
        "depth": "comprehensive",
        "budget_limit_usd": 300.0
    })
    assert create_res.status_code == 200
    inv_id = create_res.json()["investigation_id"]

    # 3. Execute 8-round multi-agent society pipeline
    from multi_agent_society_engine import MultiAgentSocietyEngine
    asyncio.run(MultiAgentSocietyEngine.run_full_society_pipeline(inv_id, db_session))

    # 4. Verify Society Agents Roster (16 distinct specialists)
    agents_res = client.get(f"/api/v1/investigations/{inv_id}/society/agents", headers=headers)
    assert agents_res.status_code == 200
    agents = agents_res.json()
    assert len(agents) == 16
    
    agent_ids = [ag["agent_id"] for ag in agents]
    assert "chief_coordinator" in agent_ids
    assert "financial_analyst" in agent_ids
    assert "forensic_accountant" in agent_ids
    assert "bull_analyst" in agent_ids
    assert "bear_analyst" in agent_ids
    assert "evidence_verifier" in agent_ids
    assert "final_adjudicator" in agent_ids
    assert "corporate_structure_investigator" in agent_ids
    assert "red_team_investigator" in agent_ids

    # 5. Verify Persistent Interactions (Direct messaging, challenges, concessions)
    inter_res = client.get(f"/api/v1/investigations/{inv_id}/society/interactions", headers=headers)
    assert inter_res.status_code == 200
    interactions = inter_res.json()
    assert len(interactions) >= 6

    # Verify at least one CHALLENGE and one CONCEDE exists
    types = [i["interaction_type"] for i in interactions]
    assert "CHALLENGE" in types
    assert "CONCEDE" in types

    # 6. Verify Position Revision Tracking on Bull Analyst
    bull_prof_res = client.get(f"/api/v1/investigations/{inv_id}/society/agents/bull_analyst", headers=headers)
    assert bull_prof_res.status_code == 200
    bull_profile = bull_prof_res.json()
    assert len(bull_profile["position_revisions"]) >= 1
    assert "Conceded to Forensic Accountant" in bull_profile["position_revisions"][0]["reason"]

    # 7. Test User Intervention into Agent (Questioning Forensic Accountant)
    intervene_res = client.post(f"/api/v1/investigations/{inv_id}/society/intervene", headers=headers, json={
        "agent_id": "forensic_accountant",
        "message": "What is the primary risk if Palantir loses its largest government contract?"
    })
    assert intervene_res.status_code == 200
    int_data = intervene_res.json()
    assert int_data["status"] == "answered"
    assert "Forensic Accountant" in int_data["response"]
    assert int_data["agent_name"] == "Marcus Holst, CPA/CFF"
    assert "Palantir" in int_data["response"]

    # 8. Verify Graph Nodes and Edges Persisted
    graph_res = client.get(f"/api/v1/investigations/{inv_id}/graph", headers=headers)
    assert graph_res.status_code == 200
    graph_data = graph_res.json()
    assert len(graph_data["nodes"]) >= 2
    assert len(graph_data["edges"]) >= 2

    # 9. Verify Adjudication Verdict and Dossier Generation
    rep_res = client.get(f"/api/v1/investigations/{inv_id}/reports", headers=headers)
    assert rep_res.status_code == 200
    reports = rep_res.json()
    assert len(reports) >= 1
    dossier = reports[0]
    assert dossier["executive_summary"] != ""
    assert dossier["financial_analysis"]["revenue_usd_m"] == 2225.0
    assert len(dossier["scenario_matrix"]) >= 3
    assert dossier["citations_count"] >= 1
