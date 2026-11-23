import pytest

def test_flagship_demo_public_seeding_and_pipeline(client):
    # 1. Hit public /api/v1/demo/flagship endpoint
    demo_res = client.get("/api/v1/demo/flagship")
    assert demo_res.status_code == 200
    data = demo_res.json()
    assert "investigation_id" in data
    assert "access_token" in data
    assert data["company"]["ticker"] == "PLTR"
    assert len(data["seeds"]) >= 3

    inv_id = data["investigation_id"]
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1b. Stage 01: Test Mandate Modification
    mandate_res = client.put(f"/api/v1/investigations/{inv_id}/mandate", headers=headers, json={
        "mandate": "Evaluate the sustainability of Palantir commercial growth, government contract exposure, and long-term competitive positioning."
    })
    assert mandate_res.status_code == 200
    assert mandate_res.json()["status"] == "updated"

    # 2. Stage 02: Verify Knowledge Graph extraction & rich entity network
    graph_res = client.get(f"/api/v1/investigations/{inv_id}/graph", headers=headers)
    assert graph_res.status_code == 200
    graph = graph_res.json()
    assert len(graph["nodes"]) >= 4
    assert len(graph["edges"]) >= 3

    # 3. Stage 03: Verify Society Roster (16 specialists) & Interactions
    agents_res = client.get(f"/api/v1/investigations/{inv_id}/society/agents", headers=headers)
    assert agents_res.status_code == 200
    agents = agents_res.json()
    assert len(agents) == 16
    agent_ids = {a["agent_id"] for a in agents}
    assert "corporate_structure_investigator" in agent_ids
    assert "red_team_investigator" in agent_ids

    # 3a. Stage 03: Test Whole-Society Interrogation
    all_res = client.post(f"/api/v1/investigations/{inv_id}/society/interrogate-all", headers=headers, json={
        "question": "What is Palantir's moat against cloud hyperscaler commoditization?"
    })
    assert all_res.status_code == 200
    all_data = all_res.json()
    assert all_data["status"] == "success"
    assert len(all_data["responses"]) == 16

    # 3b. Stage 03: Test Targeted Single-Agent Intervention
    single_res = client.post(f"/api/v1/investigations/{inv_id}/society/intervene", headers=headers, json={
        "agent_id": "red_team_investigator",
        "message": "What is the single highest-probability vector for multiple compression?"
    })
    assert single_res.status_code == 200
    single_data = single_res.json()
    assert single_data["status"] == "answered"
    assert "red_team_investigator" in single_data["agent_id"]

    inter_res = client.get(f"/api/v1/investigations/{inv_id}/society/interactions", headers=headers)
    assert inter_res.status_code == 200
    assert len(inter_res.json()) >= 6

    # 3b. Stage 03: Test Exogenous Shock / Hypothetical Event Injection
    hypo_res = client.post(f"/api/v1/investigations/{inv_id}/society/hypothetical", headers=headers, json={
        "event_description": "U.S. defense appropriations reduced by 25% amidst federal procurement delays."
    })
    assert hypo_res.status_code == 200
    hypo_data = hypo_res.json()
    assert hypo_data["is_hypothetical"] is True
    assert "U.S. Department of Defense" in hypo_data["affected_entities"]
    assert "bear_analyst" in hypo_data["affected_agents"]
    assert hypo_data["stressed_metrics"]["terminal_multiple"] == "3.0x ARR"
    assert hypo_data["stressed_metrics"]["revenue_usd_m"] < 2225.0

    # Verify hypothetical retrieval endpoint
    get_hypo_res = client.get(f"/api/v1/investigations/{inv_id}/society/hypotheticals", headers=headers)
    assert get_hypo_res.status_code == 200
    assert len(get_hypo_res.json()) >= 1

    # 4. Stage 04: Verify Boardroom Debate Session & Interactive Challenge
    debates_res = client.get(f"/api/v1/investigations/{inv_id}/debates", headers=headers)
    assert debates_res.status_code == 200
    debates = debates_res.json()
    assert len(debates) >= 1
    debate_id = debates[0]["id"]

    claims_res = client.get(f"/api/v1/investigations/{inv_id}/claims", headers=headers)
    assert claims_res.status_code == 200
    claims = claims_res.json()
    assert len(claims) >= 1
    claim_id = claims[0]["id"]

    # Submit adversarial challenge from bear analyst
    challenge_res = client.post(f"/api/v1/investigations/{inv_id}/debates/{debate_id}/challenge", headers=headers, json={
        "claim_id": claim_id,
        "challenger_agent_id": "bear_analyst",
        "challenge_text": "Federal procurement delays make this claim overly optimistic given historical budget sequestration cycles."
    })
    assert challenge_res.status_code == 200
    chal_data = challenge_res.json()
    assert chal_data["challenge"]["argument_type"] == "challenge"
    assert chal_data["rebuttal"]["argument_type"] == "rebuttal"
    assert chal_data["adjudication"]["argument_type"] == "adjudication"

    # 5. Stage 05: Verify Intelligence Dossier
    reports_res = client.get(f"/api/v1/investigations/{inv_id}/reports", headers=headers)
    assert reports_res.status_code == 200
    reports = reports_res.json()
    assert len(reports) >= 1
    assert reports[0]["financial_analysis"]["revenue_usd_m"] == 2225.0
