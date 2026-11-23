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
  ChevronRight
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Institutional Header */}
      <header className="border-b border-[#20252e] bg-[#0b0d10]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-emerald-950 border border-emerald-500/40 flex items-center justify-center font-mono font-bold text-emerald-400 text-sm tracking-wider">
              M
            </div>
            <span className="font-semibold text-lg tracking-wider text-slate-100 uppercase">
              Meridian
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#1c222b] text-slate-400 border border-[#2d3748] tracking-widest uppercase">
              Institutional Intelligence
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
            <Link href="#capabilities" className="hover:text-slate-100 transition-colors">Capabilities</Link>
            <Link href="#specialists" className="hover:text-slate-100 transition-colors">Specialist Framework</Link>
            <Link href="#boardroom" className="hover:text-slate-100 transition-colors">Adversarial Deliberation</Link>
            <Link href="#evidence" className="hover:text-slate-100 transition-colors">Evidence Integrity</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link 
              href="/demo"
              className="text-sm px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all shadow-sm shadow-emerald-950 flex items-center space-x-1.5"
            >
              <span>Explore Flagship Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/app"
              className="text-sm px-4 py-2 rounded border border-[#2d3748] hover:border-slate-500 text-slate-200 transition-all font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6 max-w-7xl mx-auto flex-1">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded border border-emerald-500/20 bg-emerald-950/30 text-emerald-400 text-xs font-mono mb-8 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Enterprise Research & Corporate Decision Engine</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-serif tracking-tight text-slate-100 leading-[1.12] mb-6">
            Understand the company behind the numbers.
          </h1>
          
          <p className="text-lg text-slate-400 leading-relaxed mb-10">
            Independent company intelligence for institutional capital, corporate strategy, and forensic due diligence. 
            Investigate corporate lineage, cross-examine financial health, subject claims to adversarial scrutiny, and verify evidence down to the page passage.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link 
              href="/demo"
              className="px-6 py-3.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all flex items-center justify-center space-x-2 text-sm shadow-lg shadow-emerald-950/50"
            >
              <span>Explore Live Flagship Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/app"
              className="px-6 py-3.5 rounded border border-[#2d3748] hover:border-slate-500 text-slate-300 font-medium transition-all text-sm flex items-center justify-center space-x-2"
            >
              <span>Open Custom Workspace</span>
            </Link>
          </div>
        </div>

        {/* Hero Terminal Preview */}
        <div className="mt-16 rounded-lg border border-[#20252e] bg-[#10141a] overflow-hidden shadow-2xl">
          <div className="h-10 bg-[#161c24] border-b border-[#20252e] px-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#353e4d]"></div>
              <div className="w-3 h-3 rounded-full bg-[#353e4d]"></div>
              <div className="w-3 h-3 rounded-full bg-[#353e4d]"></div>
              <span className="text-xs font-mono text-slate-400 ml-2">meridian://investigations/inv-8842/boardroom</span>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono text-emerald-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>ACTIVE ADVERSARIAL SESSION</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#20252e] p-6 text-sm">
            {/* Column 1: Specialist Roster */}
            <div className="space-y-4 pr-4">
              <div className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center justify-between">
                <span>Specialist Roster</span>
                <span className="text-emerald-400">9 Active</span>
              </div>
              <div className="space-y-2">
                {[
                  { name: "Financial Analyst", status: "Submitting audit", conf: "94%" },
                  { name: "Forensic Accountant", status: "Disputing concentration", conf: "91%" },
                  { name: "Bull-Case Advocate", status: "Asserting TAM leverage", conf: "78%" },
                  { name: "Bear-Case Advocate", status: "Raising sales fatigue", conf: "86%" },
                  { name: "Final Adjudicator", status: "Formulating verdict", conf: "92%" }
                ].map((s, i) => (
                  <div key={i} className="p-2.5 rounded bg-[#161c24] border border-[#20252e] flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-200 text-xs">{s.name}</div>
                      <div className="text-[11px] text-slate-400">{s.status}</div>
                    </div>
                    <span className="text-xs font-mono text-emerald-400">{s.conf}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Deliberation Floor */}
            <div className="space-y-4 px-4">
              <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Deliberation Floor & Disputed Claims
              </div>
              <div className="p-3 rounded bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200">
                <div className="font-semibold mb-1 flex items-center space-x-1">
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                  <span>Adversarial Conflict Detected</span>
                </div>
                Bear-Case Advocate challenged Bull-Case revenue multiples citing 41% expansion in enterprise procurement cycles and customer concentration.
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-[#161c24] border border-[#20252e] text-slate-300">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Rebuttal — Financial Analyst</span>
                  <p className="mt-1">$164.2M cash cushion affords 4.3 years of runway even under loss of #1 account.</p>
                </div>
                <div className="p-2.5 rounded bg-[#161c24] border border-emerald-500/30 text-emerald-300">
                  <span className="text-emerald-400 font-mono text-[10px] uppercase">Adjudication Ruling</span>
                  <p className="mt-1">Partially Supported: Target ARR discounted by 15% due to proven sales friction.</p>
                </div>
              </div>
            </div>

            {/* Column 3: Evidence Integrity */}
            <div className="space-y-4 pl-4">
              <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Evidence Provenance & Citations
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded bg-[#161c24] border border-[#20252e]">
                  <div className="text-slate-400 text-[10px] uppercase font-mono">SEC Filing / Form 10-K</div>
                  <div className="text-slate-200 font-medium mt-0.5">Item 7: Customer Concentration</div>
                  <div className="text-slate-400 mt-1 text-[11px] italic">
                    "Top 3 accounts represent 28.5% of total annual billings."
                  </div>
                  <div className="mt-2 text-emerald-400 font-mono text-[10px] flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Primary Audited Record (98% Auth)</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#161c24] border border-[#20252e]">
                  <div className="text-slate-400 text-[10px] uppercase font-mono">Institutional Equity Research</div>
                  <div className="text-slate-200 font-medium mt-0.5">Morgan Stanley Due Diligence Note</div>
                  <div className="text-slate-400 mt-1 text-[11px] italic">
                    "Procurement cycles expanded from 65 to 92 days across core cohorts."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section id="capabilities" className="py-20 bg-[#0e1217] border-t border-[#20252e] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">Institutional Discipline</h2>
            <h3 className="text-3xl font-serif text-slate-100">Engineered for absolute research integrity.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-[#141922] border border-[#20252e]">
              <div className="w-10 h-10 rounded bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-medium text-slate-100 mb-2">Multi-Specialist Research Architecture</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Nine logical specialist disciplines analyze every investigation independently, preventing premature consensus and cross-pollinating forensic insights.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-[#141922] border border-[#20252e]">
              <div className="w-10 h-10 rounded bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5">
                <Scale className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-medium text-slate-100 mb-2">Adversarial Deliberation Engine</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Bull and Bear advocates challenge assumptions with hard evidence. Concessions, rebuttals, and unresolved disputes are systematically preserved in the dossier.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-[#141922] border border-[#20252e]">
              <div className="w-10 h-10 rounded bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-medium text-slate-100 mb-2">Immutable Evidence Traceability</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                No assertion is presented as verified fact without verifiable provenance. Every metric links to source disclosures, filings, and reliability scores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#20252e] bg-[#0b0d10] py-12 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300 uppercase tracking-wider">MERIDIAN</span>
            <span>—</span>
            <span>Enterprise Company Intelligence Platform</span>
          </div>
          <div className="flex items-center space-x-6">
            <span>Security & Compliance</span>
            <span>Governance</span>
            <span>API Docs</span>
            <span>Institutional Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
