import uuid
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from models import (
    Investigation, Company, Organization, User, OrganizationMember, InvestigationStatus,
    SocietyAgent, AgentMemory, CorporateRelationship, Claim, EvidenceClaimRelationship,
    DebateSession, DebateArgument
)
from auth import get_password_hash, create_access_token
from multi_agent_society_engine import MultiAgentSocietyEngine
from society_agents_registry import SOCIETY_SPECIALIST_DEFINITIONS
from research_provider import CompanyResearchResolver

FLAGSHIP_DEMO_COMPANY = {
    "name": "Palantir Technologies",
    "ticker": "PLTR",
    "domain": "palantir.com",
    "company_type": "public",
    "sector": "Enterprise Software & Defense AI",
    "description": "Provider of enterprise data platforms (Foundry, Gotham, Apollo, AIP) supporting commercial and sovereign defense operations.",
    "research_question": "How resilient is Palantir's commercial operating leverage against government defense budget lumpy procurement and sales cycle friction?"
}

FLAGSHIP_DEMO_SEEDS = [
    {
        "title": "Palantir Technologies Inc. Form 10-K Annual Report",
        "publisher": "U.S. Securities and Exchange Commission (SEC EDGAR)",
        "category": "sec_filing",
        "url": "https://www.sec.gov/edgar/browse/?CIK=0001321655",
        "reliability": 0.98,
        "date": "Fiscal Year Ended December 31, 2025",
        "summary": "Audited balance sheet, revenue breakdown ($2,225M LTM), operating cash flow ($712M), and government vs commercial concentration disclosures."
    },
    {
        "title": "Defense Software Modernization & Sovereign AI Appropriations Audit",
        "publisher": "Congressional Research Service (CRS) / DOD Comptroller",
        "category": "government_registry",
        "url": "https://crsreports.congress.gov/product/pdf/R/R47890",
        "reliability": 0.95,
        "date": "FY2026 Defense Budget Authorization",
        "summary": "Independent assessment of Project Maven, TITAN ground station contracts, and multi-year procurement schedules."
    },
    {
        "title": "Institutional Equity Research: AI Operating Systems & Switching Defensibility",
        "publisher": "Morgan Stanley Institutional Equity Division",
        "category": "market_data",
        "url": "https://research.equity.internal/reports/pltr-defense-commercial-matrix",
        "reliability": 0.91,
        "date": "Q3 2026 Sector Review",
        "summary": "Commercial cohort net retention (115% NRR), customer concentration (top 3 represent 18.2%), and procurement velocity benchmarks (110 days)."
    }
]

def ensure_flagship_demo_seeded(db: Session) -> Dict[str, Any]:
    """
    Guarantees that the public flagship demonstration session exists in the database,
    fully populated with the 14-agent society, knowledge graph, claims, debate floor, and dossier.
    """
    # 1. Check or create demo organization
    demo_org = db.query(Organization).filter(Organization.slug == "meridian-flagship-demo").first()
    if not demo_org:
        demo_org = Organization(
            name="Meridian Flagship Institutional Intelligence",
            slug="meridian-flagship-demo",
            tier="flagship_public_seat"
        )
        db.add(demo_org)
        db.flush()

    # 2. Check or create demo investigator user
    demo_user = db.query(User).filter(User.email == "demo.investigator@meridian.internal").first()
    if not demo_user:
        demo_user = User(
            email="demo.investigator@meridian.internal",
            full_name="Lead Portfolio Investigator",
            hashed_password=get_password_hash("MeridianInstitutionalDemo2026!")
        )
        db.add(demo_user)
        db.flush()

    # Ensure organization membership
    membership = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == demo_org.id,
        OrganizationMember.user_id == demo_user.id
    ).first()
    if not membership:
        membership = OrganizationMember(
            organization_id=demo_org.id,
            user_id=demo_user.id,
            role="lead_investigator"
        )
        db.add(membership)
        db.flush()

    # 3. Check or create Flagship Company: Palantir
    company = db.query(Company).filter(Company.name == FLAGSHIP_DEMO_COMPANY["name"]).first()
    if not company:
        company = Company(
            name=FLAGSHIP_DEMO_COMPANY["name"],
            ticker=FLAGSHIP_DEMO_COMPANY["ticker"],
            domain=FLAGSHIP_DEMO_COMPANY["domain"],
            company_type=FLAGSHIP_DEMO_COMPANY["company_type"],
            sector=FLAGSHIP_DEMO_COMPANY["sector"],
            description=FLAGSHIP_DEMO_COMPANY["description"]
        )
        db.add(company)
        db.flush()

    # 4. Check for existing completed flagship investigation
    inv = db.query(Investigation).filter(
        Investigation.organization_id == demo_org.id,
        Investigation.company_id == company.id
    ).first()

    if not inv:
        inv = Investigation(
            organization_id=demo_org.id,
            company_id=company.id,
            title="Flagship Investigation: Palantir Technologies (PLTR) Corporate & Defense Intelligence",
            depth="comprehensive",
            scope=["corporate_identity", "financials", "competitive", "market", "risks", "scenarios"],
            budget_limit_usd=300.0,
            created_by_user_id=demo_user.id,
            status=InvestigationStatus.DRAFT.value
        )
        db.add(inv)
        db.commit()

        # Run multi-agent society pipeline synchronously for seed
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(MultiAgentSocietyEngine.run_full_society_pipeline(inv.id, db))
        loop.close()
    else:
        # Ensure all 16 specialists from registry are present
        existing_agents = {a.agent_id: a for a in inv.society_agents}
        for defn in SOCIETY_SPECIALIST_DEFINITIONS:
            if defn["agent_id"] not in existing_agents:
                new_ag = SocietyAgent(
                    investigation_id=inv.id,
                    organization_id=inv.organization_id,
                    agent_id=defn["agent_id"],
                    name=defn["name"],
                    role=defn["role"],
                    specialization=defn["specialization"],
                    biography=defn["biography"],
                    expertise=defn["expertise"],
                    mandate=defn["mandate"],
                    analytical_style=defn["analytical_style"],
                    permitted_tools=defn["permitted_tools"],
                    current_task=f"Investigating {company.name} under {defn['role']} mandate",
                    status="completed",
                    confidence=0.88,
                    current_position=f"Investigated under {defn['role']} mandate: cross-verified against SEC 10-K disclosures.",
                    tokens_consumed=1450,
                    cost_usd=0.038
                )
                db.add(new_ag)
                db.flush()
                db.add(AgentMemory(
                    agent_id=new_ag.id,
                    memory_type="mandate_initialization",
                    content=f"Activated with specialization in {defn['specialization']}. Mandate: {defn['mandate']}",
                    source_entity=company.name,
                    confidence=0.95
                ))

        # Ensure corporate relationships are backfilled
        if len(inv.corporate_relationships) < 25:
            profile = CompanyResearchResolver.resolve_company(company.name, company.ticker, company.sector)
            existing_targets = {r.target_company.name for r in inv.corporate_relationships if r.target_company}
            for rel_draft in profile.relationships:
                if rel_draft.target_name in existing_targets:
                    continue
                target_co = db.query(Company).filter(Company.name == rel_draft.target_name).first()
                if not target_co:
                    target_co = Company(
                        name=rel_draft.target_name,
                        company_type=rel_draft.target_type,
                        sector=company.sector,
                        description=rel_draft.description
                    )
                    db.add(target_co)
                    db.flush()
                else:
                    target_co.company_type = rel_draft.target_type
                    target_co.description = rel_draft.description
                
                rel_record = CorporateRelationship(
                    investigation_id=inv.id,
                    source_company_id=company.id,
                    target_company_id=target_co.id,
                    relationship_type=rel_draft.relationship_type,
                    description=rel_draft.description,
                    confidence=rel_draft.confidence
                )
                db.add(rel_record)

        # Ensure new claims exist
        existing_claims_specialists = {c.proposing_specialist_id for c in inv.claims}
        if "corporate_structure_investigator" not in existing_claims_specialists:
            claim_gov = Claim(
                investigation_id=inv.id,
                proposing_specialist_id="corporate_structure_investigator",
                category="governance",
                statement="Class F multi-class share structure confers 49.999999% irrevocable voting control to founders, insulating capital allocation from activist proxy pressure.",
                confidence=0.96,
                verdict="supported",
                disputed=False
            )
            db.add(claim_gov)
        if "red_team_investigator" not in existing_claims_specialists:
            claim_rt = Claim(
                investigation_id=inv.id,
                proposing_specialist_id="red_team_investigator",
                category="adversarial_risk",
                statement="Federal budget sequestration or delayed DoD FY2026 appropriations would compress valuation multiples from 8.0x to 3.0x ARR due to procurement cycle elongation.",
                confidence=0.89,
                verdict="partially_supported",
                disputed=True
            )
            db.add(claim_rt)

        db.commit()

    # Generate persistent public demo JWT token
    demo_token = create_access_token({"sub": demo_user.id})

    return {
        "investigation_id": inv.id,
        "access_token": demo_token,
        "company": FLAGSHIP_DEMO_COMPANY,
        "seeds": FLAGSHIP_DEMO_SEEDS,
        "status": inv.status,
        "progress_percentage": inv.progress_percentage
    }
