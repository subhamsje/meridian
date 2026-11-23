import Link from "next/link";
import { 
  Building2, 
  ShieldCheck, 
  Scale, 
  TrendingUp, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Search,
  Layers,
  ChevronRight,
  Network,
  Users,
  Compass,
  Database,
  BarChart3
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#111315] text-[#e5e7eb]">
      {/* Top Institutional Header */}
      <header className="border-b border-[#30353c] bg-[#181b1f] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded bg-[#20242a] border border-[#30353c] flex items-center justify-center font-mono font-bold text-[#e5e7eb] text-xs">
              M
            </div>
            <span className="font-semibold text-xs tracking-wider uppercase text-[#e5e7eb]">
              Meridian
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#20242a] text-[#a0a7b1] border border-[#30353c]">
              Institutional Terminal
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs text-[#a0a7b1]">
            <Link href="#architecture" className="hover:text-[#e5e7eb] transition-colors">Architecture</Link>
            <Link href="#society" className="hover:text-[#e5e7eb] transition-colors">Specialist Framework</Link>
            <Link href="#deliberation" className="hover:text-[#e5e7eb] transition-colors">Adversarial Deliberation</Link>
            <Link href="#provenance" className="hover:text-[#e5e7eb] transition-colors">Provenance Standard</Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link 
              href="/demo"
              className="text-xs px-3 py-1.5 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium transition-colors flex items-center space-x-1.5"
            >
              <span>Explore Flagship Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link 
              href="/app"
              className="text-xs px-3 py-1.5 rounded border border-[#30353c] hover:bg-[#20242a] text-[#e5e7eb] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-7xl mx-auto flex-1 w-full">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded border border-[#30353c] bg-[#181b1f] text-[#a0a7b1] text-xs font-mono mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
            <span>ENTERPRISE COMPANY INTELLIGENCE & ADVERSARIAL RESEARCH</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-[#f8fafc] leading-[1.15] mb-5">
            Understand the company behind the numbers.
          </h1>
          
          <p className="text-base text-[#a0a7b1] leading-relaxed mb-8">
            An intelligence platform built for institutional capital, forensic research, and corporate strategy teams. 
            Investigate corporate lineage, evaluate unit economics, stress-test growth theses through adversarial debate, and verify every claim against primary regulatory disclosures.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <Link 
              href="/demo"
              className="px-5 py-2.5 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium transition-colors flex items-center justify-center space-x-2 text-xs"
            >
              <span>Explore Live Flagship: Palantir (NYSE: PLTR)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link 
              href="/app"
              className="px-5 py-2.5 rounded border border-[#30353c] hover:bg-[#181b1f] text-[#e5e7eb] font-medium transition-colors text-xs flex items-center justify-center space-x-2"
            >
              <span>Open Custom Workspace</span>
            </Link>
          </div>
        </div>

        {/* Institutional Workstation Preview */}
        <div className="mt-14 rounded border border-[#30353c] bg-[#181b1f] overflow-hidden">
          <div className="h-9 bg-[#141619] border-b border-[#30353c] px-4 flex items-center justify-between text-xs font-mono text-[#737c88]">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#30353c]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#30353c]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#30353c]"></span>
              <span className="text-[#a0a7b1] ml-2">meridian://investigations/palantir-tech-pltr/deliberation-floor</span>
            </div>
            <div className="flex items-center space-x-2 text-[#10b981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              <span>ADJUDICATED SESSION</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#30353c] p-5 text-xs bg-[#111315]">
            {/* Column 1: Specialist Roster */}
            <div className="space-y-3 pr-4">
              <div className="text-[10px] font-mono uppercase text-[#737c88] tracking-wider flex items-center justify-between">
                <span>Specialist Roster</span>
                <span className="text-[#a0a7b1]">16 Active</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { name: "Sarah Chen, CFA", role: "Principal Financial Analyst", status: "VERIFIED" },
                  { name: "Marcus Holst, CPA/CFF", role: "Senior Forensic Accountant", status: "DISPUTED" },
                  { name: "Vikram Seth, LLM", role: "Corporate Structure Investigator", status: "VERIFIED" },
                  { name: "Cassandra Cross", role: "Red-Team Investigator", status: "STRESSED" },
                  { name: "The Hon. Justice Simon Cross", role: "Final Epistemic Adjudicator", status: "RULING FILED" }
                ].map((s, i) => (
                  <div key={i} className="p-2 rounded bg-[#181b1f] border border-[#30353c] flex items-center justify-between">
                    <div>
                      <div className="font-medium text-[#e5e7eb] text-xs">{s.name}</div>
                      <div className="text-[10px] text-[#737c88]">{s.role}</div>
                    </div>
                    <span className="text-[9px] font-mono text-[#a0a7b1]">{s.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Deliberation Floor */}
            <div className="space-y-3 px-4">
              <div className="text-[10px] font-mono uppercase text-[#737c88] tracking-wider">
                Deliberation Floor & Disputed Claims
              </div>
              <div className="p-3 rounded bg-[#181b1f] border border-[#f59e0b]/40 text-xs text-[#fef3c7]">
                <div className="font-semibold mb-1 flex items-center space-x-1 text-[#f59e0b]">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Epistemic Challenge in Deliberation</span>
                </div>
                Red-Team challenged Bull multiple expansion citing $2,225M revenue baseline, customer concentration of 18.2%, and 110-day procurement cycles.
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="p-2.5 rounded bg-[#181b1f] border border-[#30353c] text-[#cbd5e1]">
                  <span className="text-[#737c88] font-mono text-[9px] uppercase">Rebuttal — Financial Analyst</span>
                  <p className="mt-0.5 font-serif leading-relaxed">$3,670M cash reserves provide substantial runway even under near-term operating margin compression.</p>
                </div>
                <div className="p-2.5 rounded bg-[#181b1f] border border-[#8b5cf6]/40 text-[#e0e7ff]">
                  <span className="text-[#8b5cf6] font-mono text-[9px] uppercase">Adjudication — Justice Simon Cross</span>
                  <p className="mt-0.5 font-serif leading-relaxed">Growth thesis ruled Partially Supported; valuation terminal multiple discounted by 15%.</p>
                </div>
              </div>
            </div>

            {/* Column 3: Audited Metrics */}
            <div className="space-y-3 pl-4">
              <div className="text-[10px] font-mono uppercase text-[#737c88] tracking-wider">
                Audited Baseline Parameters
              </div>
              <div className="space-y-1.5">
                {[
                  { label: "LTM Revenue", val: "$2,225.0M", std: "GAAP ASC 606" },
                  { label: "Gross Margin", val: "79.5%", std: "GAAP Standard" },
                  { label: "Operating Cash Flow", val: "$712.0M", std: "Statement of Cash Flows" },
                  { label: "Cash & Equivalents", val: "$3,670.0M", std: "Balance Sheet" },
                  { label: "Net Revenue Retention", val: "115.0%", std: "Trailing Cohort" },
                  { label: "Sales Cycle Friction", val: "110 Days", std: "Blended Enterprise/Defense" }
                ].map((m, i) => (
                  <div key={i} className="p-2 rounded bg-[#181b1f] border border-[#30353c] flex items-center justify-between">
                    <div>
                      <div className="text-[10.5px] text-[#a0a7b1]">{m.label}</div>
                      <div className="text-[9px] text-[#737c88] font-mono">{m.std}</div>
                    </div>
                    <span className="font-mono font-bold text-xs text-[#f8fafc]">{m.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Section */}
      <section id="architecture" className="py-16 border-t border-[#30353c] bg-[#141619]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <div className="text-[10px] font-mono uppercase text-[#737c88] tracking-wider mb-1">Architecture</div>
            <h2 className="text-2xl font-serif font-bold text-[#f8fafc]">
              Designed for institutional analytical precision.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded bg-[#181b1f] border border-[#30353c]">
              <Network className="w-5 h-5 text-[#3b82f6] mb-3" />
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-1">Corporate Graph Intelligence</h3>
              <p className="text-xs text-[#a0a7b1] leading-relaxed">
                Map corporate lineages, sovereign defense programs, multi-cloud hosting, and commercial client cohorts with provenance inspection.
              </p>
            </div>

            <div className="p-5 rounded bg-[#181b1f] border border-[#30353c]">
              <Users className="w-5 h-5 text-[#10b981] mb-3" />
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-1">16-Specialist Society</h3>
              <p className="text-xs text-[#a0a7b1] leading-relaxed">
                Autonomous specialist agents operate under distinct analytical mandates with persistent individual and shared memory.
              </p>
            </div>

            <div className="p-5 rounded bg-[#181b1f] border border-[#30353c]">
              <Scale className="w-5 h-5 text-[#f59e0b] mb-3" />
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-1">Adversarial Deliberation</h3>
              <p className="text-xs text-[#a0a7b1] leading-relaxed">
                Bull, bear, forensic, and red-team analysts challenge assertions on a formal debate floor with judicial adjudications.
              </p>
            </div>

            <div className="p-5 rounded bg-[#181b1f] border border-[#30353c]">
              <ShieldCheck className="w-5 h-5 text-[#8b5cf6] mb-3" />
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-1">100% Provenance Standard</h3>
              <p className="text-xs text-[#a0a7b1] leading-relaxed">
                Every extracted claim, financial figure, and relationship links directly to primary SEC 10-K or government records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="border-t border-[#30353c] bg-[#111315] py-8 text-xs text-[#737c88]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#e5e7eb]">MERIDIAN</span>
            <span>•</span>
            <span>Institutional Research & Corporate Intelligence</span>
          </div>
          <div className="font-mono text-[11px] text-[#737c88]">
            SEC EDGAR CIK 0001321655 • Congressional Research Service Verified
          </div>
        </div>
      </footer>
    </div>
  );
}
