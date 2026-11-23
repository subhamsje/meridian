import uuid
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from models import Investigation, Company, Organization, User, OrganizationMember, InvestigationStatus
from auth import get_password_hash, create_access_token
from multi_agent_society_engine import MultiAgentSocietyEngine

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
