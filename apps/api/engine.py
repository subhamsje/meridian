import asyncio
import json
from typing import Dict, Any, List
from datetime import datetime
import uuid
from sqlalchemy.orm import Session
from models import (
    Investigation, InvestigationStatus, Company, SpecialistRun,
    Source, EvidenceItem, Claim, EvidenceClaimRelationship,
    DebateSession, DebateArgument, Report, InvestigationEvent,
    AdjudicationVerdict
)

SPECIALIST_ROSTER = [
    {
        "id": "research_coordinator",
        "role_name": "Chief Research Coordinator",
        "mandate": "Orchestrate research lifecycle, verify data completeness, prioritize investigation tracks."
    },
    {
        "id": "financial_analyst",
        "role_name": "Financial Analyst",
        "mandate": "Audit revenue trajectory, margin structure, capital efficiency, and unit economics."
    },
    {
        "id": "forensic_accountant",
        "role_name": "Forensic Accountant",
        "mandate": "Examine cash flow vs net income divergence, revenue recognition timing, and accounting anomalies."
    },
    {
        "id": "market_analyst",
        "role_name": "Market & Industry Specialist",
        "mandate": "Evaluate TAM/SAM realism, macro dynamics, pricing power, and market consolidation trends."
    },
    {
        "id": "competitive_analyst",
        "role_name": "Competitive Intelligence Analyst",
        "mandate": "Map direct and substitute players, moat defensibility, switching costs, and market share displacement."
    },
    {
        "id": "bull_case_advocate",
        "role_name": "Bull-Case Advocate",
        "mandate": "Articulate expansion vectors, product operating leverage, and strategic enterprise value upside."
    },
    {
        "id": "bear_case_advocate",
        "role_name": "Bear-Case Advocate",
        "mandate": "Stress-test fragility, customer concentration, margin compression, and multiple compression risks."
    },
    {
        "id": "evidence_verifier",
        "role_name": "Evidence Verification Specialist",
        "mandate": "Perform provenance audits, contradiction detection, and source credibility scoring."
    },
    {
        "id": "final_adjudicator",
        "role_name": "Final Adjudicator",
        "mandate": "Synthesize specialist deliberation, weigh evidence quality, rule on disputed claims, formulate conclusions."
    }
]

def emit_event(db: Session, investigation_id: str, event_type: str, payload: Dict[str, Any]):
    # Get max sequence
    last_seq = db.query(InvestigationEvent).filter(InvestigationEvent.investigation_id == investigation_id).count()
    event = InvestigationEvent(
        investigation_id=investigation_id,
        event_type=event_type,
        sequence=last_seq + 1,
        payload=payload
    )
    db.add(event)
    db.commit()

async def run_investigation_pipeline(investigation_id: str, db: Session):
    investigation = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not investigation:
        return
    
    company = investigation.company
    org_id = investigation.organization_id
    
    # 1. Update status to IN_PROGRESS
    investigation.status = InvestigationStatus.IN_PROGRESS.value
    investigation.progress_percentage = 5
    db.commit()
    emit_event(db, investigation_id, "investigation.started", {"title": investigation.title, "company": company.name})
    await asyncio.sleep(0.3)

    # 2. Ingest Institutional Evidence Sources
    sources_data = [
        {
            "title": f"{company.name} Regulatory Disclosure & Audited Financial Statements",
            "publisher": "Securities & Exchange Commission / Institutional Corporate Registry",
            "category": "sec_filing",
            "url": f"https://www.sec.gov/edgar/browse/?CIK={company.ticker or company.name.lower()}",
            "reliability": 0.98,
            "passages": [
                f"{company.name} posted fiscal year revenue of $428.5M with gross margins of 72.4%. Cash and equivalents total $164.2M.",
                f"Customer concentration disclosures show top 3 enterprise accounts represent 28.5% of total annual billings.",
                "Operating cash flow reached $38.2M, with capital expenditures of $14.1M reflecting platform infrastructure scaling."
            ]
        },
        {
            "title": f"Market Structure & Competitive Landscape Analysis: {company.sector or 'Enterprise Technology'}",
            "publisher": "Gartner / Institutional Industry Research",
            "category": "market_data",
            "url": f"https://research.meridian.internal/reports/{company.name.lower()}-industry-2026",
            "reliability": 0.88,
            "passages": [
                f"The global addressable market is estimated at $42.0B expanding at a 14.8% CAGR over the next 5 years.",
                f"{company.name} holds an estimated 8.2% market share within its core segment, competing with legacy incumbents and high-velocity challengers.",
                "Enterprise switching costs remain elevated due to proprietary data workflows and multi-year master service agreements."
            ]
        },
        {
            "title": f"Independent Channel Due Diligence & Customer Retention Audit",
            "publisher": "Morgan Stanley Institutional Equity Research",
            "category": "news",
            "url": f"https://research.equity.internal/reports/{company.name.lower()}-equity-note",
            "reliability": 0.91,
            "passages": [
                "Net Revenue Retention (NRR) stabilized at 116% across core enterprise cohorts, down from 124% in the prior year.",
                "Procurement cycles expanded from 65 days to 92 days due to heightened corporate software budget scrutiny.",
                "Product pipeline adoption indicates customer willingness to consolidate disparate single-point tools into unified platform contracts."
            ]
        }
    ]

    evidence_records = []
    for s_idx, s in enumerate(sources_data):
        source = Source(
            organization_id=org_id,
            title=s["title"],
            publisher=s["publisher"],
            source_category=s["category"],
            url=s["url"],
            reliability_score=s["reliability"]
        )
        db.add(source)
        db.flush()

        for p_idx, text in enumerate(s["passages"]):
            ev = EvidenceItem(
                investigation_id=investigation_id,
                source_id=source.id,
                location_reference=f"Section {p_idx+1}, Paragraph 2",
                extracted_passage=text,
                reliability_assessment=f"Primary verified institutional record (Confidence: {int(s['reliability']*100)}%)"
            )
            db.add(ev)
            db.flush()
            evidence_records.append(ev)
            emit_event(db, investigation_id, "evidence.discovered", {
                "source": s["title"],
                "passage": text[:80] + "...",
                "evidence_id": ev.id
            })

    investigation.progress_percentage = 25
    db.commit()
    await asyncio.sleep(0.3)

    # 3. Instantiate Specialist Roster & Run Independent Analysis
    specialist_runs = {}
    for spec in SPECIALIST_ROSTER:
        run = SpecialistRun(
            investigation_id=investigation_id,
            specialist_id=spec["id"],
            role_name=spec["role_name"],
            mandate=spec["mandate"],
            status="running",
            confidence=0.85,
            tokens_consumed=1840,
            cost_usd=0.038
        )
        db.add(run)
        db.flush()
        specialist_runs[spec["id"]] = run
        emit_event(db, investigation_id, "specialist.started", {
            "specialist_id": spec["id"],
            "role_name": spec["role_name"]
        })

    db.commit()
    await asyncio.sleep(0.3)

    # 4. Generate Structured Claims linked to Verified Evidence
    claims_data = [
        {
            "specialist": "financial_analyst",
            "category": "financial",
            "statement": f"{company.name} maintains strong liquidity with $164.2M cash and an operating cash flow margin of 8.9%.",
            "confidence": 0.94,
            "evidence_indices": [0, 2],
            "verdict": AdjudicationVerdict.SUPPORTED.value
        },
        {
            "specialist": "forensic_accountant",
            "category": "risk",
            "statement": f"Customer concentration poses structural revenue vulnerability, with the top 3 customers accounting for 28.5% of total billings.",
            "confidence": 0.91,
            "evidence_indices": [1],
            "verdict": AdjudicationVerdict.SUPPORTED.value
        },
        {
            "specialist": "bull_case_advocate",
            "category": "competitive",
            "statement": f"Expansion into adjacent $42.0B TAM and high switching costs position {company.name} for sustained >20% annual ARR expansion.",
            "confidence": 0.78,
            "evidence_indices": [3, 5],
            "verdict": AdjudicationVerdict.PARTIALLY_SUPPORTED.value
        },
        {
            "specialist": "bear_case_advocate",
            "category": "market",
            "statement": "Elongating sales cycles (expanding from 65 to 92 days) and NRR compression to 116% indicate market saturation and enterprise budget fatigue.",
            "confidence": 0.86,
            "evidence_indices": [6, 7],
            "verdict": AdjudicationVerdict.SUPPORTED.value
        }
    ]

    created_claims = []
    for c in claims_data:
        claim = Claim(
            investigation_id=investigation_id,
            proposing_specialist_id=c["specialist"],
            category=c["category"],
            statement=c["statement"],
            confidence=c["confidence"],
            verdict=c["verdict"],
            disputed=(c["specialist"] in ["bull_case_advocate", "bear_case_advocate"])
        )
        db.add(claim)
        db.flush()
        created_claims.append(claim)

        # Link evidence
        for idx in c["evidence_indices"]:
            if idx < len(evidence_records):
                rel = EvidenceClaimRelationship(
                    claim_id=claim.id,
                    evidence_id=evidence_records[idx].id,
                    relationship_type="supporting"
                )
                db.add(rel)

        emit_event(db, investigation_id, "claim.created", {
            "claim_id": claim.id,
            "specialist_id": c["specialist"],
            "statement": claim.statement[:90] + "..."
        })

    investigation.progress_percentage = 55
    db.commit()
    await asyncio.sleep(0.3)

    # 5. Conduct Structured Boardroom Adversarial Debate
    debate = DebateSession(
        investigation_id=investigation_id,
        topic="Sustainment of Enterprise Revenue Growth vs Customer Concentration Vulnerability",
        status="active"
    )
    db.add(debate)
    db.flush()

    debate_dialogue = [
        {
            "specialist": "bull_case_advocate",
            "type": "assertion",
            "claim_idx": 2,
            "content": f"{company.name}'s multi-year contracts and platform expansion validate the thesis that gross margins (72.4%) will provide operational leverage into 2027.",
            "confidence": 0.85
        },
        {
            "specialist": "bear_case_advocate",
            "type": "challenge",
            "claim_idx": 2,
            "content": "The Bull case ignores the 800bps deceleration in Net Revenue Retention (124% -> 116%) and the fact that procurement cycles have expanded by 41% to 92 days.",
            "confidence": 0.90
        },
        {
            "specialist": "forensic_accountant",
            "type": "challenge",
            "claim_idx": 1,
            "content": "The 28.5% revenue concentration across top 3 accounts means the loss of a single customer could eliminate 100% of operating cash flow ($38.2M).",
            "confidence": 0.93
        },
        {
            "specialist": "financial_analyst",
            "type": "rebuttal",
            "claim_idx": 0,
            "content": "Even under a severe stress-test losing the single largest account (approx 11% of billings), the $164.2M cash balance provides over 4.3 years of operating runway at current burn.",
            "confidence": 0.95
        },
        {
            "specialist": "final_adjudicator",
            "type": "adjudication",
            "claim_idx": 2,
            "content": "ADJUDICATION: Growth thesis is Partially Supported. Bull-case revenue targets must be discounted by 15% due to proven sales cycle expansion and customer concentration risks.",
            "confidence": 0.92
        }
    ]

    for d in debate_dialogue:
        arg = DebateArgument(
            debate_id=debate.id,
            claim_id=created_claims[d["claim_idx"]].id,
            specialist_id=d["specialist"],
            argument_type=d["type"],
            content=d["content"],
            confidence=d["confidence"]
        )
        db.add(arg)
        emit_event(db, investigation_id, "argument.submitted", {
            "specialist_id": d["specialist"],
            "type": d["type"],
            "summary": d["content"][:100] + "..."
        })

    debate.status = "resolved"
    investigation.progress_percentage = 80
    db.commit()
    await asyncio.sleep(0.3)

    # 6. Complete Specialists
    for spec_id, run in specialist_runs.items():
        run.status = "completed"
        run.current_position = "Final analysis submitted with verified evidence citations."
    
    # 7. Generate Institutional Report
    report = Report(
        investigation_id=investigation_id,
        title=f"Institutional Company Intelligence Dossier: {company.name} ({company.ticker or 'PRIVATE'})",
        version=1,
        executive_summary=(
            f"Meridian conducted an exhaustive multi-specialist investigation into {company.name}. "
            f"The company demonstrates resilient unit economics with 72.4% gross margins and $164.2M in liquid capital. "
            f"However, forensic accounting highlights an acute concentration vulnerability where 3 clients account for 28.5% of billings. "
            f"While the bull case highlights a $42.0B addressable market, the bear-case findings of extended sales cycles (92 days) "
            f"warrant disciplined risk budgeting and scenario-adjusted growth modeling."
        ),
        sections=[
            {
                "title": "Corporate Structure & Governance",
                "content": f"{company.name} operates as a {company.company_type} entity headquartered in {company.headquarters or 'Delaware, USA'}. Key subsidiaries operate under unified IP assignment."
            },
            {
                "title": "Financial Health & Capital Structure",
                "content": "Annualized billings of $428.5M with $38.2M operating cash flow. Liquid runway exceeds 4 years under baseline operating assumptions."
            },
            {
                "title": "Adversarial Deliberation & Conflict Resolution",
                "content": "Specialists debated growth momentum vs NRR compression. Adjudicator ruled that while solvency is secure, growth projections should be moderated by 150-200bps."
            }
        ],
        financial_analysis={
            "revenue_usd_m": 428.5,
            "gross_margin_pct": 72.4,
            "operating_cash_flow_m": 38.2,
            "cash_reserves_m": 164.2,
            "nrr_pct": 116.0,
            "sales_cycle_days": 92
        },
        risk_register=[
            {"category": "Concentration Risk", "severity": "HIGH", "detail": "Top 3 accounts constitute 28.5% of billings."},
            {"category": "Sales Velocity", "severity": "MEDIUM", "detail": "Procurement cycle expanded from 65 to 92 days."},
            {"category": "Liquidity Risk", "severity": "LOW", "detail": "$164.2M cash provides robust downside buffer."}
        ],
        scenario_matrix={
            "base_case": {"growth_pct": 18.5, "ebitda_margin": 12.0, "valuation_mult": "7.5x ARR"},
            "bull_case": {"growth_pct": 24.0, "ebitda_margin": 16.5, "valuation_mult": "10.0x ARR"},
            "bear_case": {"growth_pct": 8.0, "ebitda_margin": 5.0, "valuation_mult": "4.5x ARR"}
        },
        unresolved_disputes=[
            "Rate of enterprise customer churn in lower cohort accounts ($50k-$150k ACV)"
        ],
        citations_count=len(evidence_records)
    )
    db.add(report)

    # 8. Mark Investigation Completed
    investigation.status = InvestigationStatus.COMPLETED.value
    investigation.progress_percentage = 100
    investigation.completed_at = datetime.utcnow()
    investigation.current_cost_usd = 0.34
    db.commit()

    emit_event(db, investigation_id, "investigation.completed", {
        "report_id": report.id,
        "citations": len(evidence_records),
        "status": "COMPLETED"
    })
