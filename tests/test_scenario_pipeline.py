import pytest
import asyncio
from scenario_simulation_engine import DynamicScenarioEngine

def test_full_scenario_simulation_pipeline(client, db_session):
    # 1. Register User and Organization
    reg = client.post("/api/v1/auth/register", json={
        "email": "scenario.director@meridian-intel.internal",
        "full_name": "Dr. Marcus Vance",
        "password": "InstitutionalSecurePassword2026!",
        "organization_name": "Autonomous Simulation Group"
    })
    assert reg.status_code == 200
    token = reg.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    # 2. Create arbitrary scenario
    scenario_payload = {
        "title": "Ethereum L2 vs Private Ledger Settlement for Central Banks",
        "problem_statement": "Evaluate whether Tier-1 global clearing banks should adopt zero-knowledge Ethereum L2 rollups or build a consortium private permissioned database for wholesale liquidity settlement.",
        "objective": "Determine finality latency, regulatory compliance, and attack surface",
        "source_text": "Primary disclosure: Current settlement friction averages 2.4 days with counterparty risk exposure.",
        "source_urls": ["https://bis.org/publ/qtrpdf/r_qt2403.htm"],
        "agent_count": 6,
        "rounds_count": 6,
        "debate_mode": "adversarial",
        "budget_limit_usd": 150.0,
        "permitted_tools": ["knowledge_graph", "duckdb_math", "doc_retrieval"]
    }

    create_res = client.post("/api/v1/scenarios", json=scenario_payload, headers=auth_headers)
    assert create_res.status_code == 200, create_res.text
    data = create_res.json()
    scenario_id = data["scenario_id"]
    assert data["agents_generated"] == 6
    assert data["status"] == "INITIALIZED"

    # 2. Verify agents exist and have distinct personas
    agents_res = client.get(f"/api/v1/investigations/{scenario_id}/society/agents", headers=auth_headers)
    assert agents_res.status_code == 200
    agents = agents_res.json()
    assert len(agents) == 6
    roles = [a["role"] for a in agents]
    assert "Principal Systems Architect" in roles
    assert "Chief Sovereign Risk Officer" in roles

    # 3. Start Multi-Round Debate Simulation synchronously for test
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(DynamicScenarioEngine.run_multi_round_debate(scenario_id, db_session))

    # 4. Verify interactions and reports were created
    interactions_res = client.get(f"/api/v1/investigations/{scenario_id}/society/interactions", headers=auth_headers)
    assert interactions_res.status_code == 200
    interactions = interactions_res.json()
    assert len(interactions) >= 12  # Openings, challenges, rebuttals, tool calls

    # 5. Test 1-on-1 Agent Interview
    first_agent_id = agents[0]["agent_id"]
    interview_res = client.post(
        f"/api/v1/scenarios/{scenario_id}/interview/{first_agent_id}",
        json={"question": "What is the primary risk of zero-knowledge settlement?"},
        headers=auth_headers
    )
    assert interview_res.status_code == 200
    interview_data = interview_res.json()
    assert interview_data["agent_id"] == first_agent_id
    assert "response" in interview_data

    # 6. Test God-View Intervention
    god_view_res = client.post(
        f"/api/v1/scenarios/{scenario_id}/intervene",
        json={"intervention_text": "Federal Reserve issues new guidance restricting public chain settlement"},
        headers=auth_headers
    )
    assert god_view_res.status_code == 200
    assert god_view_res.json()["status"] == "intervention_applied"

    # 7. Test Scenario Analytics Endpoint
    analytics_res = client.get(f"/api/v1/scenarios/{scenario_id}/analytics", headers=auth_headers)
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert "confidence_series" in analytics_data
    assert "network_nodes" in analytics_data
    assert "network_links" in analytics_data
    assert len(analytics_data["confidence_series"]) == 6

    # 8. Test Plenary Broadcast Survey Across Specialists
    survey_res = client.post(
        f"/api/v1/scenarios/{scenario_id}/survey",
        json={"question": "What is the likelihood of sovereign regulatory intervention against this architecture?"},
        headers=auth_headers
    )
    assert survey_res.status_code == 200
    survey_data = survey_res.json()
    assert survey_data["total_queried"] == 6
    assert "sentiment_breakdown" in survey_data
    assert "consensus_index" in survey_data
    assert len(survey_data["responses"]) == 6
