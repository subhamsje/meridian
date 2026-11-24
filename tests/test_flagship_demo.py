import pytest

def test_flagship_demo_public_seeding_and_pipeline(client):
    # 1. Hit public /api/v1/demo/flagship endpoint
    demo_res = client.get("/api/v1/demo/flagship")
    assert demo_res.status_code == 200
    data = demo_res.json()
    assert "investigation_id" in data
    assert "access_token" in data
    assert data["company"]["ticker"] == "NVDA"
    assert len(data["seeds"]) >= 3

    inv_id = data["investigation_id"]
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1b. Stage 01: Test Mandate Modification
    mandate_res = client.put(f"/api/v1/investigations/{inv_id}/mandate", headers=headers, json={
        "mandate": "Evaluate the durability of NVIDIA 75% gross margins against TSMC advanced packaging bottlenecks and hyperscaler custom silicon displacement."
    })
    assert mandate_res.status_code == 200
    assert mandate_res.json()["status"] == "updated"

    # 2. Stage 02: Verify Knowledge Graph extraction & rich entity network
    graph_res = client.get(f"/api/v1/investigations/{inv_id}/graph", headers=headers)
    assert graph_res.status_code == 200
    graph = graph_res.json()
    assert len(graph["nodes"]) >= 4
    assert len(graph["edges"]) >= 3

    # 3. Stage 03: Verify Society Roster & Specialists
    agents_res = client.get(f"/api/v1/investigations/{inv_id}/society/agents", headers=headers)
    assert agents_res.status_code == 200
    agents = agents_res.json()
    assert len(agents) >= 6
    agent_ids = {a["agent_id"] for a in agents}
    assert "semiconductor_architect" in agent_ids or "corporate_structure_investigator" in agent_ids
    assert "judicial_adjudicator" in agent_ids or "red_team_investigator" in agent_ids

    # 3a. Stage 03: Test Whole-Society Interrogation
    all_res = client.post(f"/api/v1/investigations/{inv_id}/society/interrogate-all", headers=headers, json={
        "question": "What is NVIDIA's moat against cloud hyperscaler custom ASIC commoditization?"
    })
    assert all_res.status_code == 200
    all_data = all_res.json()
    assert all_data["status"] == "success"
    assert len(all_data["responses"]) >= 6

    # 3b. Stage 03: Test Targeted Single-Agent Intervention
    target_agent = agents[0]["agent_id"]
    single_res = client.post(f"/api/v1/investigations/{inv_id}/society/intervene", headers=headers, json={
        "agent_id": target_agent,
        "message": "What is the single highest-probability vector for multiple compression?"
    })
    assert single_res.status_code == 200
    single_data = single_res.json()
    assert single_data["status"] == "answered"
    assert target_agent in single_data["agent_id"]

    inter_res = client.get(f"/api/v1/investigations/{inv_id}/society/interactions", headers=headers)
    assert inter_res.status_code == 200
    assert len(inter_res.json()) >= 4

    # 3c. Stage 03: Test Exogenous Shock / Hypothetical Event Injection
    hypo_res = client.post(f"/api/v1/investigations/{inv_id}/society/hypothetical", headers=headers, json={
        "event_description": "TSMC CoWoS packaging capacity constrained by 40% due to equipment delays."
    })
    assert hypo_res.status_code == 200
    hypo_data = hypo_res.json()
    assert hypo_data["is_hypothetical"] is True

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

    # Submit adversarial challenge from specialist
    challenge_res = client.post(f"/api/v1/investigations/{inv_id}/debates/{debate_id}/challenge", headers=headers, json={
        "claim_id": claim_id,
        "challenger_agent_id": target_agent,
        "challenge_text": "Supply chain gating factors and hyperscaler capex digestion make this claim overly optimistic."
    })
    assert challenge_res.status_code == 200
    chal_data = challenge_res.json()
    assert chal_data["challenge"]["argument_type"] == "challenge"
    assert chal_data["rebuttal"]["argument_type"] == "rebuttal"
    assert chal_data["adjudication"]["argument_type"] == "adjudication"

    # 5. Stage 05: Verify Intelligence Dossier / Reports
    dossier_res = client.get(f"/api/v1/investigations/{inv_id}/dossier", headers=headers)
    assert dossier_res.status_code == 200
    dossier = dossier_res.json()
    assert len(dossier["sections"]) >= 9
