import React, { useState } from 'react';
import { 
  ArrowRight, Check, Landmark, FileText, Bell, Sparkles, ShieldCheck
} from 'lucide-react';

interface LandingPageProps {
  onSelectTier: (tier: 1 | 2 | 3) => void;
  activeTier: 1 | 2 | 3;
  onEnterConsole: () => void;
  onGoToLogin: () => void;
}

export function FlowtLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      {/* Absolute minimalist geometric brand symbol */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full text-zinc-100 fill-none stroke-current"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="20" y="20" width="60" height="60" rx="16" strokeWidth="6" />
        <path
          d="M35 50 C 45 40, 55 60, 65 50"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default function LandingPage({ onSelectTier, activeTier, onEnterConsole, onGoToLogin }: LandingPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeStageTab, setActiveStageTab] = useState<1 | 2 | 3>(3);

  const priceMultiplier = billingCycle === 'yearly' ? 0.8 : 1;

  const tiers = [
    {
      id: 1 as const,
      name: "Tier I: Invoicing Core",
      price: 99,
      description: "Essential multi-currency invoicing system and analytical dashboard.",
      features: [
        "Create, edit & delete invoices",
        "Multi-currency conversion engine",
        "Interactive analytics charts",
        "Base currency multiplier index",
        "Clean print-ready invoice layouts",
        "Local state-saving persistence"
      ],
      stageGroup: "Stage 1 Capabilities",
      cta: "Launch Invoicing Console",
      badge: "Base",
      color: "border-zinc-900 bg-zinc-950 text-zinc-300 hover:border-zinc-750"
    },
    {
      id: 2 as const,
      name: "Tier II: Pro Reconciliation",
      price: 149,
      description: "Adds automatic bank matching and customer outreach sweeps.",
      features: [
        "All invoicing core tools included",
        "Simulated wire ingress matching",
        "Smart reference correlation",
        "Configurable grace-period filters",
        "Automated sweep execution logs",
        "Historical communications outbox"
      ],
      stageGroup: "Stage 1 & 2 Capabilities",
      cta: "Launch Pro Console",
      badge: "Standard",
      color: "border-zinc-800 bg-zinc-950 text-zinc-100 hover:border-zinc-500 ring-1 ring-zinc-805"
    },
    {
      id: 3 as const,
      name: "Tier III: Copilot Integration",
      price: 299,
      description: "Complete platform access backed by an interactive Gemini AI assistant.",
      features: [
        "Invoicing & reconciliation logs",
        "Context-aware accounting assistant",
        "Outreach outreach draft builder",
        "Natural language ledger searches",
        "Cashflow risk identification",
        "Server-side AI chat companion"
      ],
      stageGroup: "Stage 1, 2 & 3 Access",
      cta: "Launch Copilot Console",
      badge: "Complete",
      color: "border-zinc-700 bg-zinc-950 text-white hover:border-zinc-300 shadow-[0_4px_20px_rgba(255,255,255,0.02)]"
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans" id="flowt-landing-page">
      
      {/* Navigation Layer */}
      <header className="border-b border-zinc-900/40 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-50 px-6 md:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FlowtLogo className="w-7 h-7" />
          <div className="flex items-center gap-2">
            <span className="text-sm tracking-wider font-light text-zinc-100 uppercase">FLOWT</span>
            <span className="text-[9px] font-mono uppercase tracking-widest bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-sm">
              Demo Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onGoToLogin}
            className="text-xs font-light tracking-wide text-zinc-400 hover:text-white border border-transparent hover:border-zinc-800 px-3.5 py-1.5 rounded-md transition-all duration-300 cursor-pointer hover:bg-zinc-900/40"
          >
            Sign In with Key
          </button>
          <button
            onClick={onEnterConsole}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium tracking-wide rounded-md bg-zinc-100 hover:bg-white text-zinc-950 hover:scale-[1.03] hover:ring-1 hover:ring-white/40 active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            Enter Console <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        </div>
      </header>

      {/* Hero Banner Grid Area */}
      <section className="relative pt-24 pb-20 px-6 md:px-12 text-center md:max-w-4xl md:mx-auto space-y-6">
        
        {/* Simple Understated Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-zinc-900 border border-zinc-800 rounded-sm text-[10px] text-zinc-400 font-mono">
          <span>Continuous Cashflow Platform</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-white max-w-2xl mx-auto leading-tight">
          Modern invoicing and bank reconciliation for growing business teams.
        </h1>
        
        <p className="text-xs md:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed font-light">
          A modular, three-stage accounting dashboard supporting customized multi-currency invoices, immediate deposit sweeps, and context-aware virtual assistance.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => onSelectTier(3)}
            className="px-6 py-2.5 text-xs font-semibold tracking-wide rounded-md bg-zinc-100 hover:bg-white text-zinc-950 hover:scale-[1.03] hover:ring-1 hover:ring-white active:scale-[0.98] transition-all duration-305 cursor-pointer shadow-sm"
          >
            Select Tier III Complete
          </button>
          <button
            onClick={onEnterConsole}
            className="px-6 py-2.5 text-xs font-light tracking-wide rounded-md bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 hover:border-zinc-500 hover:scale-[1.03] active:scale-[0.98] text-zinc-300 hover:text-white transition-all duration-305 cursor-pointer"
          >
            Open Interactive Demo
          </button>
        </div>
      </section>

      {/* Product Stages Segment */}
      <section className="py-16 bg-zinc-950 border-t border-b border-zinc-900 px-6 md:px-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Operations Framework</h2>
            <p className="text-lg font-light text-white uppercase">The Three Modules of FLOWT</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex justify-center gap-1 p-1 bg-zinc-905 border border-zinc-900 max-w-sm mx-auto rounded-sm">
            <button
              onClick={() => setActiveStageTab(1)}
              className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-mono transition-all rounded-sm duration-200 ${
                activeStageTab === 1 
                  ? 'bg-zinc-100 text-zinc-950 font-medium' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 cursor-pointer'
              }`}
            >
              Stage I
            </button>
            <button
              onClick={() => setActiveStageTab(2)}
              className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-mono transition-all rounded-sm duration-200 ${
                activeStageTab === 2 
                  ? 'bg-zinc-100 text-zinc-950 font-medium' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 cursor-pointer'
              }`}
            >
              Stage II
            </button>
            <button
              onClick={() => setActiveStageTab(3)}
              className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-mono transition-all rounded-sm duration-200 ${
                activeStageTab === 3 
                  ? 'bg-zinc-100 text-zinc-950 font-medium' 
                  : 'text-zinc-550 hover:text-zinc-300 hover:bg-zinc-900/40 cursor-pointer'
              }`}
            >
              Stage III
            </button>
          </div>

          {/* Active Stage Detail */}
          <div className="border border-zinc-900 bg-zinc-950/60 p-6 md:p-8 rounded-lg">
            {activeStageTab === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-3">
                  <span className="inline-block px-2 py-0.5 rounded-sm bg-zinc-900 border border-zinc-800 font-mono text-[9px] uppercase text-zinc-400">
                    Draft & Currency Toolset
                  </span>
                  <h3 className="text-base font-light text-white uppercase">Invoicing & Analytical Dashboard</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    Build precise billing accounts for international corporate clients. Define custom quantities and currency items representing actual client deliverables. Stream analytical conversions against live USD rate indexes.
                  </p>
                  <ul className="text-xs text-zinc-500 space-y-1.5 font-mono">
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-zinc-400 stroke-[1.5]" /> Professional invoice generator panels
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-zinc-400 stroke-[1.5]" /> Interactive analytics with area & stacked charts
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-zinc-400 stroke-[1.5]" /> Clean instant draft preview system
                    </li>
                  </ul>
                </div>
                <div className="md:col-span-4 bg-zinc-900/30 p-5 rounded-lg border border-zinc-900 text-center font-mono">
                  <FileText className="w-8 h-8 text-zinc-400 mx-auto mb-2 stroke-[1.5]" />
                  <span className="text-[9px] uppercase text-zinc-500 tracking-wider">Availability</span>
                  <div className="text-sm font-medium text-white mt-1 uppercase">Standard Core</div>
                  <p className="text-[8px] text-zinc-500 mt-1">Included in all plans</p>
                </div>
              </div>
            )}

            {activeStageTab === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-3">
                  <span className="inline-block px-2 py-0.5 rounded-sm bg-zinc-900 border border-zinc-800 font-mono text-[9px] uppercase text-zinc-400">
                    Remittance Engine
                  </span>
                  <h3 className="text-base font-light text-white uppercase">Bank Reconciliation & Outbox sweeps</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    Unify banking wires and accounting records. Register bank wire deposits, map them directly against outstanding invoices based on reference matching, and configure custom automated communication alerts.
                  </p>
                  <ul className="text-xs text-zinc-500 space-y-1.5 font-mono">
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-zinc-400 stroke-[1.5]" /> Bank wire feeds and simulated deposits
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-zinc-400 stroke-[1.5]" /> Immediate Match & Pay reconciliation indicators
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-zinc-400 stroke-[1.5]" /> Configurable cron-based outbox reminders sweep
                    </li>
                  </ul>
                </div>
                <div className="md:col-span-4 bg-zinc-900/30 p-5 rounded-lg border border-zinc-900 text-center font-mono">
                  <Landmark className="w-8 h-8 text-zinc-400 mx-auto mb-2 stroke-[1.5]" />
                  <span className="text-[9px] uppercase text-zinc-500 tracking-wider">Availability</span>
                  <div className="text-sm font-medium text-white mt-1 uppercase font-semibold">Tier II & III</div>
                  <p className="text-[8px] text-zinc-500 mt-1">Requires Reconciler upgrade</p>
                </div>
              </div>
            )}

            {activeStageTab === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-3">
                  <span className="inline-block px-2 py-0.5 rounded-sm bg-zinc-900 border border-zinc-800 font-mono text-[9px] uppercase text-zinc-400">
                    SME Intelligent Layer
                  </span>
                  <h3 className="text-base font-light text-white uppercase">Contextual AI Copilot</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    Interact directly with your active financial datasets using natural query patterns. Research client billing logs, identify missing matching bank wire transfers, and compose professional outstanding reminders.
                  </p>
                  <ul className="text-xs text-zinc-500 space-y-1.5 font-mono">
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-zinc-400 stroke-[1.5]" /> Accurate client transaction mapping inputs
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-zinc-400 stroke-[1.5]" /> Server-side secure Gemini 3.5 LLM integration
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-zinc-400 stroke-[1.5]" /> Multi-turn chat terminal with dynamic suggestions
                    </li>
                  </ul>
                </div>
                <div className="md:col-span-4 bg-zinc-900/30 p-5 rounded-lg border border-zinc-900 text-center font-mono">
                  <Sparkles className="w-8 h-8 text-zinc-400 mx-auto mb-2 stroke-[1.5]" />
                  <span className="text-[9px] uppercase text-zinc-500 tracking-wider">Availability</span>
                  <div className="text-sm font-medium text-white mt-1 uppercase font-semibold">Tier III Complete</div>
                  <p className="text-[8px] text-zinc-500 mt-1">Requires active Copilot access</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Models Section */}
      <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto space-y-12" id="pricing-matrix">
        <div className="text-center space-y-2">
          <h2 className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Pricing Plans</h2>
          <p className="text-2xl font-light text-white uppercase">Flexible options for international teams</p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto font-light">
            Toggle annual billing to activate a 20% savings margin on your service desk.
          </p>

          {/* Duration Toggle Switch */}
          <div className="inline-flex items-center gap-3 bg-zinc-900 p-1 border border-zinc-800 mt-4 rounded-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1 text-[10px] uppercase tracking-wider rounded-sm font-mono transition-all duration-200 ${
                billingCycle === 'monthly' 
                  ? 'bg-zinc-100 text-zinc-950 font-medium' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-950/55 cursor-pointer'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1 text-[10px] uppercase tracking-wider rounded-sm font-mono transition-all relative duration-200 ${
                billingCycle === 'yearly' 
                  ? 'bg-zinc-100 text-zinc-950 font-medium' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-950/55 cursor-pointer'
              }`}
            >
              Annually
              <span className="absolute -top-2.5 -right-3 px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-white text-[8px] rounded-sm font-mono font-bold">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {tiers.map((tier) => {
            const isSelected = activeTier === tier.id;
            const currentPrice = Math.round(tier.price * priceMultiplier);
            const priceLabel = billingCycle === 'yearly' ? `/mo` : `/mo`;

            return (
              <div 
                key={tier.id} 
                className={`border p-6 rounded-lg flex flex-col justify-between transition-all duration-350 relative hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] ${tier.color} ${
                  isSelected ? 'border-zinc-300 shadow-md scale-[1.01]' : 'border-zinc-900'
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <span className="font-mono text-zinc-500 text-[9px] uppercase tracking-wider">{tier.stageGroup}</span>
                    <h3 className="text-sm font-light text-white uppercase mt-0.5 tracking-wide">{tier.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[8px] font-mono rounded-sm uppercase tracking-wider">
                    {tier.badge}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed h-10 overflow-hidden mb-6 font-light">{tier.description}</p>

                {/* Price Display */}
                <div className="p-4 bg-zinc-900/10 border border-zinc-900/80 mb-6 font-mono rounded-sm">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl text-zinc-400 font-light">$</span>
                    <span className="text-3xl font-light text-white tracking-tight">{currentPrice}</span>
                    <span className="text-zinc-500 text-[10px] ml-1">{priceLabel}</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <div className="text-[9px] text-zinc-400 mt-1 font-light">
                      Billed globally at ${currentPrice * 12}/year
                    </div>
                  )}
                </div>

                {/* Feature checklist */}
                <div className="space-y-3 mb-8 flex-1">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block border-b border-zinc-900 pb-1.5">
                    Feature Scope Matrix
                  </span>
                  <ul className="space-y-2 text-xs">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-zinc-400 font-light">
                        <Check className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5 stroke-[1.5]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action button */}
                <button
                  onClick={() => onSelectTier(tier.id)}
                  className={`w-full py-2.5 text-xs font-semibold tracking-wider uppercase rounded-sm transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? 'bg-zinc-100 text-zinc-950 hover:bg-white hover:scale-[1.02] hover:ring-1 hover:ring-white/50 active:scale-[0.99]' 
                      : 'bg-zinc-950 hover:bg-zinc-900 text-zinc-300 border border-zinc-900 hover:border-zinc-500 hover:scale-[1.02] active:scale-[0.99] hover:text-white'
                  }`}
                >
                  {isSelected ? `Active Plan` : tier.cta}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-t border-zinc-900 text-center bg-zinc-950">
        <div className="max-w-4xl mx-auto space-y-4 px-6">
          <div className="flex justify-center items-center gap-1.5 text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-zinc-400 stroke-[1.5]" /> Secured Remittance Gateway
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-mono text-zinc-650 py-2">
            <div>✓ STRIPE READY</div>
            <div>✓ ACH / SEPA CHANNELS</div>
            <div>✓ GEMINI CORE INTEL</div>
            <div>✓ SYNCHRONIZED RECONCILING</div>
          </div>
        </div>
      </section>

      {/* Global Interactive Footer */}
      <footer className="py-12 border-t border-zinc-900/60 bg-zinc-950 text-center text-[9px] text-zinc-650 tracking-widest uppercase font-mono">
        FLOWT — {new Date().getFullYear()} — STAGE DEMO ENVIRONMENT ACTIVE
      </footer>
    </div>
  );
}
