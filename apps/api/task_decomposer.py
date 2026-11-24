"""
MERIDIAN Dynamic Task Decomposition & Specialist Mandate Synthesis Engine
Analyzes company profile, industry archetypes, financial indicators, and user objectives
to dynamically formulate targeted, non-duplicated research tasks with isolated scopes.
Supports standard institutional archetypes as well as adaptive decomposition for unfamiliar industries.
"""

import uuid
import re
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from models import (
    Company, Investigation, InvestigationExecution, ResearchPlan, SpecialistTask, InvestigationDocument
)

# Industry Archetype Profiles with specialized analytical questions
ARCHETYPE_MANDATE_BLUEPRINTS = {
    "semiconductor_hardware": {
        "archetype": "Semiconductor, AI Compute & Hardware Systems",
        "uncertainties": [
            "Advanced packaging (TSMC CoWoS-L) and substrate allocation constraints",
            "Hyperscaler Capex digestion cycles and return on invested capital (ROIC) compression",
            "US Department of Commerce BIS export control escalations on accelerator compute densities",
            "High Bandwidth Memory (HBM3e/HBM4) pricing premiums and gross margin sustainability"
        ],
        "gaps": ["Customer concentration among top 4 hyperscalers", "Foundry wafer allocation vs committed purchase obligations"],
        "specialists": [
            {
                "role": "Semiconductor Architecture & Silicon Systems Analyst",
                "task_suffix": "silicon_arch",
                "objective": "Audit architectural roadmap (Blackwell GB200 vs Hopper H200/B200), compute density, FLOPs per watt, and interconnect moat (NVLink).",
                "questions": [
                    "What is the actual compute and inference performance multiple of the Blackwell architecture compared to Hopper?",
                    "How defensible is the proprietary NVLink interconnect and switch fabric against standard Ethernet/InfiniBand?",
                    "What software lock-in is enforced through CUDA and enterprise software libraries?"
                ],
                "scope_boundaries": "Focus on GPU/accelerator microarchitecture, die sizes, interconnect bandwidth, and software moats. Exclude macro interest rates.",
                "domain_filter": "silicon_architecture",
                "required_evidence": ["Architecture Whitepapers", "Hot Chips Conference Disclosures", "SEC 10-K Product Disclosures"],
                "excluded_areas": ["Consumer marketing promotions", "General corporate HR policies"],
                "token_budget": 2900
            },
            {
                "role": "Hyperscaler Capex & ROI Sustainability Specialist",
                "task_suffix": "hyperscaler_roi",
                "objective": "Analyze Big Tech Capex budgets (Microsoft, Meta, Alphabet, Amazon), cloud monetization rates, and compute depreciation headwinds.",
                "questions": [
                    "What percentage of revenue is concentrated in the top 4 hyperscaler customers?",
                    "Are hyperscalers generating sufficient end-user software ROI to sustain 2025-2026 Capex trajectories?",
                    "What is the timeline and risk of in-house custom ASIC displacement (Google TPU, AWS Trainium, Meta MTIA)?"
                ],
                "scope_boundaries": "Hyperscaler Capex models, cloud revenue per GPU hour, ASIC cannibalization, customer concentration.",
                "domain_filter": "hyperscaler_capex",
                "required_evidence": ["Hyperscaler 10-Q Capex Disclosures", "Cloud Instance Pricing Tables", "Customer Concentration Disclosures"],
                "excluded_areas": ["Foundry chemical etching processes"],
                "token_budget": 2800
            },
            {
                "role": "Supply Chain, Foundry & Advanced Packaging Auditor",
                "task_suffix": "packaging_supply_chain",
                "objective": "Investigate TSMC wafer fab capacity, CoWoS packaging bottlenecks, HBM3e/HBM4 supplier yields (SK Hynix, Micron, Samsung), and supply obligations.",
                "questions": [
                    "What are the committed purchase obligations for wafer fabrication and advanced packaging?",
                    "Is CoWoS-L packaging packaging capacity expanding fast enough to meet guided unit volumes?",
                    "What are the contractual inventory cancellation terms with foundries and OSAT partners?"
                ],
                "scope_boundaries": "Foundry agreements, OSAT packaging lead times, purchase commitments, inventory write-down exposure.",
                "domain_filter": "supply_chain_packaging",
                "required_evidence": ["SEC 10-K Note on Commitments and Contingencies", "TSMC Earnings Transcripts", "Supplier Purchase Obligations"],
                "excluded_areas": ["Corporate board governance"],
                "token_budget": 2700
            },
            {
                "role": "Geopolitical & Export Control Sanctions Specialist",
                "task_suffix": "export_controls",
                "objective": "Examine US Department of Commerce BIS export controls, China market revenue degradation (H20 restrictions), and sovereign AI initiatives.",
                "questions": [
                    "What percentage of total revenue remains exposed to Greater China market restrictions?",
                    "What are the compliance parameters and margin impacts of modified regional SKUs (e.g. H20)?",
                    "Can sovereign national AI infrastructure demand offset Chinese market restrictions?"
                ],
                "scope_boundaries": "BIS export regulations, regional trade restrictions, China revenue risk factors, tariff exposure.",
                "domain_filter": "export_controls",
                "required_evidence": ["US BIS Export Administration Regulations", "SEC 10-K Item 1A Risk Factors", "Regional Revenue Disclosures"],
                "excluded_areas": ["Silicon transistor layout design"],
                "token_budget": 2600
            },
            {
                "role": "Gross Margin & Financial Solvency Auditor",
                "task_suffix": "margin_solvency",
                "objective": "Audit gross margin sustainability (70-75% peak levels), R&D operating leverage, working capital cycles, and cash conversion.",
                "questions": [
                    "Can gross margins remain above 73% as Blackwell system complexity and cooling components scale?",
                    "What are the unbilled accounts receivable trends and customer credit terms?",
                    "How durable is free cash flow generation after accounting for inventory build-up?"
                ],
                "scope_boundaries": "Income statement margins, cash flow dynamics, working capital, inventory reserves.",
                "domain_filter": "financial_filings",
                "required_evidence": ["Audited Income Statements", "Consolidated Balance Sheets", "Cash Flow Statements", "Inventory Footnotes"],
                "excluded_areas": ["Consumer gaming community sentiment"],
                "token_budget": 2800
            }
        ]
    },
    "enterprise_saas": {
        "archetype": "B2B Enterprise SaaS & Cloud Intelligence",
        "uncertainties": [
            "Customer expansion durability and Net Revenue Retention (NRR) degradation",
            "Customer Acquisition Cost (CAC) payback elongation under macro budget tightening",
            "Enterprise procurement cycle friction and contract renewal vulnerability"
        ],
        "gaps": ["Detailed logo churn vs dollar churn breakdown", "Gross margin profile by professional services vs subscription"],
        "specialists": [
            {
                "role": "Revenue Quality & Financial Sustainability Analyst",
                "task_suffix": "fin_sustainability",
                "objective": "Audit recurring revenue quality, gross margins, cash burn rate, and capital runway.",
                "questions": [
                    "What proportion of reported ARR is organic versus acquired or professional services?",
                    "Are gross margins compressing due to underlying cloud hosting/LLM inference costs?",
                    "What is the operational cash flow run-rate and effective cash runway?"
                ],
                "scope_boundaries": "Focus strictly on GAAP/non-GAAP revenue, cash balances, cost of goods sold, and burn rate.",
                "domain_filter": "financial_filings",
                "required_evidence": ["SEC 10-K/10-Q Item 7 MD&A", "Audited Income Statement", "Cash Flow Statement"],
                "excluded_areas": ["Marketing branding", "Executive board compensation"],
                "token_budget": 2800
            },
            {
                "role": "SaaS Unit Economics & Retention Specialist",
                "task_suffix": "unit_economics",
                "objective": "Evaluate Net Revenue Retention, CAC payback periods, LTV/CAC ratios, and cohort churn.",
                "questions": [
                    "Is Net Revenue Retention (>115%) driven by seat expansion or price increases?",
                    "What is the estimated fully-burdened CAC payback period across enterprise cohorts?",
                    "What customer retention signals exist in disclosures or customer case studies?"
                ],
                "scope_boundaries": "Analyze unit metrics, retention dynamics, and payback economics.",
                "domain_filter": "unit_economics",
                "required_evidence": ["Customer cohort disclosures", "Sales efficiency metrics", "NRR disclosures"],
                "excluded_areas": ["Patent litigation", "Tax entity structure"],
                "token_budget": 2600
            },
            {
                "role": "Competitive Moat & Hyperscaler Positioning Analyst",
                "task_suffix": "competitive_moat",
                "objective": "Determine market position, software stickiness, pricing power, and hyperscaler bundling risks.",
                "questions": [
                    "How vulnerable is the company's product suite to native AWS, Azure, or GCP platform features?",
                    "What switching costs prevent enterprise clients from migrating to competitors?",
                    "How does the company's win-rate against legacy and emerging competitors trend?"
                ],
                "scope_boundaries": "Examine competitive positioning, differentiation, and moat durability.",
                "domain_filter": "competitive_intelligence",
                "required_evidence": ["Competitor pricing models", "Industry analyst evaluations", "Customer win/loss disclosures"],
                "excluded_areas": ["Accounting depreciation methods"],
                "token_budget": 2500
            },
            {
                "role": "Product Architecture & Technical Defensibility Analyst",
                "task_suffix": "tech_architecture",
                "objective": "Investigate technical defensibility, proprietary ontology/IP, scalability, and AI platform integration.",
                "questions": [
                    "Does the core software leverage proprietary defensible IP or commoditized wrapper models?",
                    "How scalable is the data pipeline architecture across air-gapped or multi-cloud environments?",
                    "What are the infrastructure dependencies and third-party API vulnerabilities?"
                ],
                "scope_boundaries": "Evaluate technical architecture, patents, platform defensibility, and reliability.",
                "domain_filter": "technical_specifications",
                "required_evidence": ["Technical whitepapers", "Patent disclosures", "System architecture specs"],
                "excluded_areas": ["Sales commission structures"],
                "token_budget": 2400
            },
            {
                "role": "Forensic Accounting & Reporting Consistency Auditor",
                "task_suffix": "forensic_accounting",
                "objective": "Audit financial footnotes, revenue recognition timing, customer concentration, and unverified management claims.",
                "questions": [
                    "Are there discrepancies between billings, deferred revenue, and recognized revenue?",
                    "What percentage of gross ARR is concentrated in the top 3-5 institutional customers?",
                    "Are pro-forma Non-GAAP adjustments masking structural operating losses?"
                ],
                "scope_boundaries": "Rigorous verification of disclosures, footnote anomalies, and concentration risks.",
                "domain_filter": "audit_footnotes",
                "required_evidence": ["Footnotes to Financial Statements", "Concentration of Risk Disclosures", "Related-party transactions"],
                "excluded_areas": ["UI/UX feature roadmaps"],
                "token_budget": 2900
            }
        ]
    },
    "biotech_pharma": {
        "archetype": "Biotechnology & Clinical Therapeutics",
        "uncertainties": [
            "Clinical trial primary endpoint efficacy vs adverse event safety profiles",
            "FDA advisory committee regulatory approval pathway hurdles",
            "Cash runway durability prior to Phase 3 milestone readout"
        ],
        "gaps": ["Trial participant dropout rates", "Off-target biological binding data"],
        "specialists": [
            {
                "role": "Clinical Pipeline & Endpoint Biostatistician",
                "task_suffix": "clinical_efficacy",
                "objective": "Audit trial endpoints, statistical significance (p-values), patient sample size, and placebo response.",
                "questions": ["Are Phase 2 efficacy endpoints statistically robust or relying on post-hoc subgroup analysis?", "What is the therapeutic index relative to existing standard-of-care?"],
                "scope_boundaries": "Clinical trial data, protocol design, efficacy statistics.",
                "domain_filter": "clinical_trials",
                "required_evidence": ["Clinical trial protocols", "Peer-reviewed medical disclosures", "FDA briefing documents"],
                "excluded_areas": ["Sales marketing materials"],
                "token_budget": 2800
            },
            {
                "role": "FDA Regulatory & Commercial Exclusivity Specialist",
                "task_suffix": "fda_regulatory",
                "objective": "Examine patent expiration cliffs, patent term extensions, and FDA breakthrough therapy designations.",
                "questions": ["When do primary composition-of-matter patents expire?", "What regulatory hurdles or black-box warnings could FDA mandate?"],
                "scope_boundaries": "Patent cliffs, regulatory designations, and exclusivity.",
                "domain_filter": "patent_regulatory",
                "required_evidence": ["Orange Book patent listings", "FDA advisory committee transcripts"],
                "excluded_areas": ["Software architecture"],
                "token_budget": 2600
            },
            {
                "role": "Biotech Capital Runway & Dilution Analyst",
                "task_suffix": "biotech_capital",
                "objective": "Model clinical R&D cash burn, future financing requirements, and secondary offering dilution risks.",
                "questions": ["How many months of cash runway remain at current clinical burn rate?", "What financing milestone triggers dilution?"],
                "scope_boundaries": "R&D burn rate, cash runway, dilution risk.",
                "domain_filter": "financial_filings",
                "required_evidence": ["10-Q cash statement", "R&D expenditure breakdowns"],
                "excluded_areas": ["Brand marketing"],
                "token_budget": 2700
            }
        ]
    },
    "defense_industrial": {
        "archetype": "Defense Hardware & Sovereign Industrial Infrastructure",
        "uncertainties": [
            "Federal procurement continuing resolutions and contract award delays",
            "Single-source defense subcontractor supply chain chokepoints",
            "Fixed-price contract cost overrun penalties"
        ],
        "gaps": ["Classified program backlog details", "Component supplier sole-source dependencies"],
        "specialists": [
            {
                "role": "Defense Procurement & Contract Structure Analyst",
                "task_suffix": "defense_contracts",
                "objective": "Audit prime contractor status, IDIQ contract vehicle ceiling, and funded vs unfunded backlog.",
                "questions": ["What portion of contract backlog is funded vs contingent on future congressional appropriations?", "Are contracts Cost-Plus-Incentive-Fee or Firm-Fixed-Price?"],
                "scope_boundaries": "DoD procurement mechanisms, program budget lines, contract type.",
                "domain_filter": "government_procurement",
                "required_evidence": ["DoD Comptroller budget books", "Federal Procurement Data System records", "SEC 10-K Item 1"],
                "excluded_areas": ["Consumer marketing"],
                "token_budget": 2800
            },
            {
                "role": "Subcontractor Supply Chain & Export Control Auditor",
                "task_suffix": "supply_chain",
                "objective": "Investigate Tier-2/Tier-3 supplier dependencies, ITAR export restrictions, and specialized component lead times.",
                "questions": ["Are key optical/semiconductor components vulnerable to single-source foreign supply disruptions?", "How do ITAR compliance rules restrict international exports?"],
                "scope_boundaries": "Hardware supply chain, export controls, manufacturing capacity.",
                "domain_filter": "supply_chain_audits",
                "required_evidence": ["Supplier disclosures", "ITAR/EAR filings", "Production facility audits"],
                "excluded_areas": ["Web application code"],
                "token_budget": 2600
            },
            {
                "role": "Industrial Margins & Cash Flow Forensic Analyst",
                "task_suffix": "industrial_margins",
                "objective": "Verify percentage-of-completion revenue recognition, milestone billings, and defense program margins.",
                "questions": ["Are unbilled receivables accumulating due to milestone delivery disputes?", "What are the structural EBIT margins by defense program?"],
                "scope_boundaries": "Contract accounting, working capital, inventory, and program margins.",
                "domain_filter": "financial_filings",
                "required_evidence": ["10-K Note on Revenue Recognition", "Working Capital disclosures"],
                "excluded_areas": ["Social media sentiment"],
                "token_budget": 2700
            }
        ]
    },
    "fintech_payments": {
        "archetype": "Fintech, Digital Payments & Financial Infrastructure",
        "uncertainties": [
            "Take-rate compression under interchange fee caps and network routing regulations",
            "Credit underwriting loss provisions during economic deceleration",
            "Customer Acquisition Cost escalation in crowded consumer/SMB credit markets"
        ],
        "gaps": ["Cohort gross payment volume retention", "Partner bank sponsor agreement terms"],
        "specialists": [
            {
                "role": "Payments Unit Economics & Take Rate Analyst",
                "task_suffix": "payments_economics",
                "objective": "Audit Net Take Rate, Total Payment Volume (TPV), interchange pass-through fees, and transaction processing costs.",
                "questions": ["What is the net take rate after deducting interchange and network assessment fees?", "Is volume growth driven by low-margin enterprise or high-margin SMB merchants?"],
                "scope_boundaries": "TPV, gross/net take rate, transaction margin, payment gateway fees.",
                "domain_filter": "payment_metrics",
                "required_evidence": ["10-K TPV disclosures", "Network fee schedules", "Take rate reconciliation"],
                "excluded_areas": ["Hardware manufacturing"],
                "token_budget": 2700
            },
            {
                "role": "Credit Risk, Capital Adequacy & Loss Provision Auditor",
                "task_suffix": "credit_risk",
                "objective": "Evaluate loan default rates, net charge-offs, CECL loss reserves, and warehouse funding facility covenants.",
                "questions": ["What is the 30/60/90-day delinquency rate across loan vintages?", "Are warehouse funding facilities subject to mark-to-market margin calls?"],
                "scope_boundaries": "Credit performance, loss reserves, debt covenants, regulatory capital.",
                "domain_filter": "credit_reserves",
                "required_evidence": ["Credit quality footnotes", "Warehouse facility agreements", "Delinquency charts"],
                "excluded_areas": ["Branding campaigns"],
                "token_budget": 2800
            },
            {
                "role": "Financial Regulatory & Compliance Specialist",
                "task_suffix": "fin_regulatory",
                "objective": "Assess Consumer Financial Protection Bureau (CFPB) oversight, sponsor bank agreements, state money transmitter licenses, and AML/KYC enforcement.",
                "questions": ["What are the operational dependencies on charter sponsor banks?", "Are there pending CFPB inquiries into fee disclosures or lending practices?"],
                "scope_boundaries": "Banking regulations, CFPB rules, licensing, compliance audits.",
                "domain_filter": "regulatory_compliance",
                "required_evidence": ["CFPB consent orders", "State money transmitter licenses", "Bank partnership disclosures"],
                "excluded_areas": ["Front-end UX design"],
                "token_budget": 2600
            }
        ]
    },
    "energy_cleantech": {
        "archetype": "Energy Transition, Grid Infrastructure & Clean Technology",
        "uncertainties": [
            "Regional transmission operator (RTO) grid interconnection queue delays",
            "Interest rate sensitivity on project finance debt and Levelized Cost of Energy (LCOE)",
            "Inflation Reduction Act (IRA) tax credit qualification and domestic content requirements"
        ],
        "gaps": ["Interconnection study completion dates", "Power Purchase Agreement (PPA) fixed-price escalator terms"],
        "specialists": [
            {
                "role": "Project Economics & Levelized Cost of Energy Analyst",
                "task_suffix": "lcoe_economics",
                "objective": "Model LCOE, capital expenditure per megawatt-hour, capacity factors, and PPA contract durations.",
                "questions": ["What is the unlevered project IRR across contracted vs merchant assets?", "How does an interest rate movement of 100bps impact project debt service coverage ratios (DSCR)?"],
                "scope_boundaries": "Project cash flows, capex per MW, PPA pricing, debt service coverage.",
                "domain_filter": "project_finance",
                "required_evidence": ["PPA contract summaries", "Project finance debt schedules", "Capacity factor disclosures"],
                "excluded_areas": ["Consumer marketing"],
                "token_budget": 2700
            },
            {
                "role": "Grid Interconnection & Regulatory Auditor",
                "task_suffix": "grid_interconnection",
                "objective": "Evaluate ISO/RTO interconnection queue status, grid upgrade cost allocations, and FERC regulatory approvals.",
                "questions": ["What are the estimated network upgrade costs assigned by the regional grid operator?", "What is the historical queue drop-out rate in target ISO jurisdictions?"],
                "scope_boundaries": "Interconnection studies, FERC dockets, utility transmission capacity.",
                "domain_filter": "utility_regulatory",
                "required_evidence": ["RTO interconnection cluster reports", "FERC filings", "Utility interconnection agreements"],
                "excluded_areas": ["Web interface design"],
                "token_budget": 2600
            }
        ]
    }
}

class DynamicTaskDecomposer:
    """
    Decomposes an investigation into a tailored, dependency-aware research plan
    with distinct specialist task assignments, domain filters, and budgets.
    Features adaptive decomposition for unfamiliar industries and custom document sets.
    """

    @classmethod
    def detect_archetype(cls, company: Company) -> str:
        text = f"{company.name} {company.ticker or ''} {company.sector or ''} {company.description or ''}".lower()
        if any(w in text for w in ["nvda", "nvidia", "semiconductor", "gpu", "accelerator", "foundry", "wafer", "cowos", "tsmc", "chip"]):
            return "semiconductor_hardware"
        if any(w in text for w in ["biotech", "pharma", "clinical", "therapeutic", "drug", "oncology"]):
            return "biotech_pharma"
        if any(w in text for w in ["defense", "aerospace", "sovereign", "titan", "military", "hardware", "weapon"]):
            return "defense_industrial"
        if any(w in text for w in ["payment", "fintech", "banking", "lending", "credit", "interchange"]):
            return "fintech_payments"
        if any(w in text for w in ["energy", "cleantech", "solar", "wind", "battery", "grid", "lcoe"]):
            return "energy_cleantech"
        if any(w in text for w in ["saas", "software", "cloud", "platform", "enterprise"]):
            return "enterprise_saas"
        return "unfamiliar_industry"

    @classmethod
    def decompose_unfamiliar_industry(
        cls,
        company: Company,
        user_objective: Optional[str] = None,
        doc_summaries: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Synthesizes dynamic specialist mandates for an unfamiliar industry or novel startup,
        deriving analytical angles from company attributes, document extracts, and research goals.
        """
        sector_label = company.sector or "Specialized Emerging Industry"
        obj_text = user_objective or f"Institutional forensic analysis of {company.name}"
        doc_hint = f" Documents provided: {len(doc_summaries)}." if doc_summaries else ""

        return {
            "archetype": f"{sector_label} (Adaptive Forensic Decomposition)",
            "uncertainties": [
                f"Core technology defensibility and operational scalability in {sector_label}",
                "Unit economics durability, gross margin sustainability, and capital expenditure run-rate",
                "Regulatory clearances, customer adoption friction, and supplier dependency risks"
            ],
            "gaps": [
                "Proprietary technical performance verification vs competitor alternatives",
                "Detailed cost breakdown and customer concentration in disclosures"
            ],
            "specialists": [
                {
                    "role": f"{company.name} Core Technology & Architecture Auditor",
                    "task_suffix": "core_technology",
                    "objective": f"Audit core technological claims, IP defensibility, engineering feasibility, and performance benchmarks in {sector_label}.",
                    "questions": [
                        "What is the verified performance differential of the company's product versus closest existing alternatives?",
                        "Does the company possess enforceable proprietary patents or defensible technical barriers to entry?",
                        "What are the primary operational failure points or engineering bottlenecks?"
                    ],
                    "scope_boundaries": "Deep technical analysis, engineering claims, patents, and system architecture. Exclude macro financial valuation.",
                    "domain_filter": "technology_architecture",
                    "required_evidence": ["Product Technical Specs", "Patents and IP Filings", "Benchmarking Reports"],
                    "excluded_areas": ["Marketing slogans", "Social media metrics"],
                    "token_budget": 2800
                },
                {
                    "role": f"{company.name} Unit Economics & Capital Efficiency Analyst",
                    "task_suffix": "unit_economics",
                    "objective": "Audit cost of goods sold, gross margin profile, customer acquisition costs, and cash burn rate.",
                    "questions": [
                        "What is the true fully-loaded unit economic margin across primary customer segments?",
                        "What is the current monthly cash burn and effective runway before additional capital is required?",
                        "How sensitive are margins to scale, component input costs, or pricing pressure?"
                    ],
                    "scope_boundaries": "Unit margins, cost structure, working capital, cash runway.",
                    "domain_filter": "financial_filings",
                    "required_evidence": ["Audited Financials", "Cost Breakdown Disclosures", "Cash Flow Statements"],
                    "excluded_areas": ["Source code quality"],
                    "token_budget": 2700
                },
                {
                    "role": f"{company.name} Market Demand & Competitive Moat Specialist",
                    "task_suffix": "market_moat",
                    "objective": f"Examine addressable market size, customer switching costs, contract retention, and competitive positioning in {sector_label}.",
                    "questions": [
                        "What are the realistic switching costs preventing customers from adopting competing solutions?",
                        "What is the verifiable enterprise adoption rate and renewal profile?",
                        "What incumbent platform risks could commoditize this business model?"
                    ],
                    "scope_boundaries": "Competitive landscape, customer churn, market dynamics, distribution advantages.",
                    "domain_filter": "competitive_intelligence",
                    "required_evidence": ["Customer Case Studies", "Market Share Reports", "Competitor Comparison Tables"],
                    "excluded_areas": ["Accounting depreciation schedules"],
                    "token_budget": 2600
                },
                {
                    "role": f"{company.name} Regulatory, Compliance & Supply Chain Auditor",
                    "task_suffix": "regulatory_supply",
                    "objective": f"Evaluate regulatory compliance requirements, jurisdictional licensing, and critical supply chain dependencies in {sector_label}.",
                    "questions": [
                        "What regulatory certifications or licenses are mandatory to operate legally at commercial scale?",
                        "Are there sole-source supplier dependencies or key vendor chokepoints?",
                        "What legal or compliance liabilities could disrupt commercial operations?"
                    ],
                    "scope_boundaries": "Licensing, compliance frameworks, supply chain vendors, environmental/legal liabilities.",
                    "domain_filter": "regulatory_compliance",
                    "required_evidence": ["Regulatory Filings", "Vendor Agreements", "Compliance Certifications"],
                    "excluded_areas": ["Brand marketing materials"],
                    "token_budget": 2600
                },
                {
                    "role": f"{company.name} Forensic Integrity & Governance Specialist",
                    "task_suffix": "forensic_governance",
                    "objective": "Investigate financial disclosure consistency, related-party transactions, governance structure, and customer concentration.",
                    "questions": [
                        "Are there anomalies or inconsistencies between executive public claims and documentary evidence?",
                        "What percentage of business volume is concentrated in the top 3 customers or partners?",
                        "Are related-party agreements or insider transactions present?"
                    ],
                    "scope_boundaries": "Forensic audit, footnote verification, governance integrity, concentration risk.",
                    "domain_filter": "audit_footnotes",
                    "required_evidence": ["Governance Disclosures", "Footnotes to Financials", "Customer Concentration Disclosures"],
                    "excluded_areas": ["Front-end design"],
                    "token_budget": 2800
                }
            ]
        }

    @classmethod
    def decompose_investigation(
        cls,
        investigation: Investigation,
        execution: InvestigationExecution,
        db: Session,
        user_objective: Optional[str] = None
    ) -> ResearchPlan:
        company = investigation.company
        archetype_key = cls.detect_archetype(company)
        
        # Check if there are uploaded documents
        docs = db.query(InvestigationDocument).filter(
            InvestigationDocument.investigation_id == investigation.id
        ).all()
        doc_summaries = [f"{d.filename} ({d.file_type}, {d.file_size_bytes}B)" for d in docs] if docs else []

        if archetype_key == "unfamiliar_industry":
            blueprint = cls.decompose_unfamiliar_industry(company, user_objective, doc_summaries)
        else:
            blueprint = ARCHETYPE_MANDATE_BLUEPRINTS.get(
                archetype_key,
                ARCHETYPE_MANDATE_BLUEPRINTS["enterprise_saas"]
            )

        objective = user_objective or investigation.scenario_prompt or f"Thorough forensic investment evaluation of {company.name}"

        # 1. Create ResearchPlan entity
        plan = ResearchPlan(
            execution_id=execution.id,
            investigation_id=investigation.id,
            company_archetype=blueprint["archetype"],
            rationale=(
                f"Dynamic task decomposition for {company.name} ({company.ticker or 'PRIVATE'}). "
                f"Classified under {blueprint['archetype']}. "
                f"Synthesized {len(blueprint['specialists'])} specialized non-overlapping analytical mandates."
            ),
            primary_uncertainties=blueprint["uncertainties"],
            information_gaps=blueprint["gaps"],
            total_tasks_count=len(blueprint["specialists"])
        )
        db.add(plan)
        db.flush()

        # 2. Instantiate isolated SpecialistTasks
        for idx, spec in enumerate(blueprint["specialists"]):
            task_id = f"task_{company.name.lower()[:4]}_{spec['task_suffix']}"
            
            # Domain-relevant documents
            relevant_docs = [f"Document_{spec['domain_filter']}"]
            if docs:
                relevant_docs.extend([d.filename for d in docs[:3]])

            task = SpecialistTask(
                execution_id=execution.id,
                research_plan_id=plan.id,
                task_id=task_id,
                specialist_role=spec["role"],
                research_objective=spec["objective"],
                specific_questions=spec["questions"],
                scope_boundaries=spec["scope_boundaries"],
                required_evidence=spec["required_evidence"],
                excluded_areas=spec["excluded_areas"],
                relevant_document_refs=relevant_docs,
                permitted_tools=["retrieve_domain_evidence", "inspect_footnote_citation", "audit_financial_model", "query_document_store"],
                dependencies=[] if idx == 0 else [f"task_{company.name.lower()[:4]}_{blueprint['specialists'][0]['task_suffix']}"],
                expected_deliverables=[
                    "Independent factual claims with exact citations",
                    "Epistemic confidence rating (0.0 to 1.0)",
                    "Materiality assessment"
                ],
                completion_criteria=f"Must submit at least 1 verified, auditable claim grounded in {spec['domain_filter']} with specific evidence citations.",
                token_budget=spec.get("token_budget", 2500),
                time_budget_sec=60,
                tool_call_budget=5,
                status="pending"
            )
            db.add(task)

        db.commit()
        return plan
