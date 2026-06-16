import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, Check, Landmark, FileText, Bell, Sparkles, ShieldCheck,
  TrendingUp, Coins, MessageSquare, Send, RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';

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
  const [activeStageTab, setActiveStageTab] = useState<1 | 2 | 3>(1);

  // Dynamic interactive states for Flowt's 3-stage module illustrations
  const [stage1Currency, setStage1Currency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [stage2Status, setStage2Status] = useState<'idle' | 'matching' | 'success'>('idle');
  const [stage3Chat, setStage3Chat] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: "Hello! I am Flowt's SME Core Copilot. Choose one of the preset analysis requests below to simulate a real-time ledger intelligence sweep." }
  ]);
  const [stage3Typing, setStage3Typing] = useState(false);

  const handleStage2Match = () => {
    if (stage2Status !== 'idle') return;
    setStage2Status('matching');
    setTimeout(() => {
      setStage2Status('success');
    }, 1600);
  };

  const resetStage2 = () => {
    setStage2Status('idle');
  };

  const handleStage3Query = (prompt: string, answer: string) => {
    if (stage3Typing) return;
    
    // Add user message to chat log
    setStage3Chat(prev => [...prev, { role: 'user', text: prompt }]);
    setStage3Typing(true);
    
    setTimeout(() => {
      setStage3Chat(prev => [...prev, { role: 'assistant', text: answer }]);
      setStage3Typing(false);
    }, 1200);
  };

  const resetStage3Chat = () => {
    setStage3Chat([
      { role: 'assistant', text: "Hello! I am Flowt's SME Core Copilot. Choose one of the preset analysis requests below to simulate a real-time ledger intelligence sweep." }
    ]);
    setStage3Typing(false);
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
    let height = canvas.height = canvas.parentElement?.offsetHeight || 600;

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }[] = [];

    // Create 55 neural connection nodes
    const particleCount = 55;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45, // slow motion kinetic float
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1.5
      });
    }

    const handleResize = () => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.offsetWidth;
        height = canvas.height = canvas.parentElement.offsetHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw all nodes
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Warm bounce or wrapping at borders
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(37, 99, 235, 0.7)'; // Brighter blue-600 (Royal Blue)
        ctx.fill();
        
        // Glow effect for nodes
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(29, 78, 216, 0.15)'; // Blue-700 glow
        ctx.fill();
      });

      // Draw vector lines between adjacent nodes (within maxDistance)
      const maxDistance = 150;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pi = particles[i];
          const pj = particles[j];

          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.35; // increased alpha
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative overflow-x-hidden" id="flowt-landing-page">
      
      {/* Global Pinned Interactive Vibe - stays behind everything across scroll */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Neural Network dynamic particle canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-45 mix-blend-screen" />

        {/* Subtle premium grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#121214_1px,transparent_1px),linear-gradient(to_bottom,#121214_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_35%,#000_60%,transparent_100%)] opacity-70" />

        {/* Ambient Glow Orb 1 - Royal Blue */}
        <motion.div 
          className="absolute top-[20%] left-[15%] w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[100px]"
          animate={{
            x: [-30, 45, -30],
            y: [-25, 35, -25],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Ambient Glow Orb 2 - Soft Steel/Lavender Indigo Accent */}
        <motion.div 
          className="absolute top-[50%] left-[60%] w-[520px] h-[520px] rounded-full bg-indigo-500/8 blur-[120px]"
          animate={{
            x: [35, -35, 35],
            y: [25, -30, 25],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Premium bottom vignetting - fades beautifully into full black lower sections */}
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
      </div>

      {/* Dynamic Island Floating Navigation Dock - Pinned to the screen viewport */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 flex justify-center w-full pointer-events-none">
        <header className="pointer-events-auto bg-zinc-950/85 backdrop-blur-xl border border-zinc-850 rounded-full py-2 px-3 md:px-6 h-14 flex items-center justify-between w-full max-w-4xl shadow-2xl shadow-black/90">
          <div className="flex items-center gap-2.5">
            <FlowtLogo className="w-6.5 h-6.5" />
            <span className="text-xs tracking-wider font-semibold text-zinc-100 uppercase font-sans hidden sm:inline">FLOWT</span>
          </div>

          {/* Dynamic Island Navigation Tabs */}
          <nav className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => {
                const el = document.getElementById('details-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition-all duration-200 cursor-pointer"
            >
              Details
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('pricing-details');
                if (el) {
                   el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition-all duration-200 cursor-pointer"
            >
              Pricing
            </button>
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={onGoToLogin}
              className="text-[10px] md:text-xs font-light tracking-wide text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-full transition-all duration-300 cursor-pointer hover:bg-zinc-900/40"
            >
              Sign In
            </button>
            <button
              onClick={onEnterConsole}
              className="inline-flex items-center gap-1 px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-medium tracking-wide rounded-full bg-zinc-100 hover:bg-white text-zinc-950 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer"
            >
              Console <ArrowRight className="w-3 h-3 stroke-[1.5]" />
            </button>
          </div>
        </header>
      </div>

      {/* Hero Banner Area - elegant transparent background to display global backdrop */}
      <section className="relative pt-44 pb-28 px-6 md:px-16 text-left overflow-hidden bg-transparent z-10" id="landing-hero-container">
        
        {/* Content container - elevated, left-aligned, spacious visual negative space */}
        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
  
          {/* Main Hero Header - Ultra Premium Display */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white max-w-4xl leading-[1.12] font-sans"
          >
            Modern billing and bank payment matching for business teams.
          </motion.h1>
          
          {/* Paragraph copy - increased font size and clarity */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed font-light"
          >
            A clean billing system composed of three main modules: custom multi-currency invoicing, automatic bank transaction tracking, and an analytical payment assistant.
          </motion.p>
  
          {/* Action Buttons - Left Aligned */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: "easeOut" }}
            className="flex flex-wrap items-center justify-start gap-4 pt-4"
          >
            <button
              onClick={() => {
                const el = document.getElementById('pricing-details');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-8 py-3.5 text-sm font-bold tracking-wider uppercase rounded bg-blue-600 hover:bg-blue-500 text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-lg shadow-blue-900/20"
            >
              See Pricing
            </button>
            <button
              onClick={onEnterConsole}
              className="px-8 py-3.5 text-sm font-light tracking-wider uppercase rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-500 hover:scale-[1.02] active:scale-[0.98] text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer"
            >
              Launch Console
            </button>
          </motion.div>
        
        </div>
      </section>

      {/* Product Stages Segment */}
      <section id="details-section" className="py-16 bg-zinc-950 border-t border-b border-zinc-900 px-6 md:px-12">
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
                <div className="md:col-span-5 space-y-4">
                  <span className="inline-block px-2 py-0.5 rounded-sm bg-zinc-900 border border-zinc-800 font-mono text-[9px] uppercase text-zinc-405">
                    Draft & Currency Toolset
                  </span>
                  <h3 className="text-base font-medium text-white uppercase tracking-wide">Invoicing & Analytical Dashboard</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    Build precise billing accounts for international corporate clients. Define custom quantities and currency items representing actual client deliverables. Stream analytical conversions against live USD rate indexes.
                  </p>
                  <ul className="text-xs text-zinc-500 space-y-2 font-mono">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-500 stroke-[2]" /> Professional invoice generator panels
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-500 stroke-[2]" /> Interactive analytics with area & stacked charts
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-500 stroke-[2]" /> Clean instant draft preview system
                    </li>
                  </ul>
                </div>
                
                {/* Interactive Stage I Illustration Box */}
                <div className="md:col-span-7 bg-zinc-950/80 border border-zinc-900 rounded-xl p-5 md:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                  {/* Subtle glass effect glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
                  
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">Live Invoice Module</span>
                      <div className="text-xs font-semibold text-white tracking-wider">INV-2026-004</div>
                    </div>
                    {/* Interactive Currency Buttons */}
                    <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded border border-zinc-850">
                      {(['USD', 'EUR', 'GBP'] as const).map(curr => (
                        <button
                          key={curr}
                          onClick={() => setStage1Currency(curr)}
                          className={`px-2.5 py-1 text-[9px] font-mono rounded-sm transition-all duration-150 cursor-pointer ${
                            stage1Currency === curr
                              ? 'bg-blue-600 text-white font-bold'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3.5 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <div className="text-zinc-500 font-mono text-[9px] uppercase">Client Account</div>
                        <div className="font-mono text-[11px] text-zinc-300">Acme Labs International</div>
                      </div>
                      <div className="text-right">
                        <div className="text-zinc-500 font-mono text-[9px] uppercase">Status</div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20">DRAFT</span>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-b border-zinc-900/65 py-3.5 my-1">
                      <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                        <span>1. Core Infrastructure Deployment</span>
                        <span className="text-zinc-200">
                          {stage1Currency === 'USD' && '$8,500.00'}
                          {stage1Currency === 'EUR' && '€7,820.00'}
                          {stage1Currency === 'GBP' && '£6,630.00'}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                        <span>2. SME Knowledge Base Indexing</span>
                        <span className="text-zinc-200">
                          {stage1Currency === 'USD' && '$4,000.00'}
                          {stage1Currency === 'EUR' && '€3,680.00'}
                          {stage1Currency === 'GBP' && '£3,120.00'}
                        </span>
                      </div>
                    </div>

                    {/* Total & Mini Chart */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-550 uppercase">Total Valuation</span>
                        <div className="text-xl font-bold text-white tracking-tight mt-0.5 transition-all">
                          {stage1Currency === 'USD' && '$12,500.00'}
                          {stage1Currency === 'EUR' && '€11,500.00'}
                          {stage1Currency === 'GBP' && '£9,750.00'}
                        </div>
                      </div>

                      {/* Interactive rate indicator trend */}
                      <div className="w-24 h-8 relative select-none">
                        <svg className="w-full h-full" viewBox="0 0 100 40">
                          <polyline
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="1.5"
                            points="0,32 20,28 40,35 60,15 80,20 100,5"
                          />
                          <circle cx="100" cy="5" r="2.5" fill="#60a5fa" />
                        </svg>
                        <span className="absolute -top-3.5 right-0 text-[8px] font-mono text-emerald-500 flex items-center gap-0.5">
                          <TrendingUp className="w-2 h-2" /> Live index matching
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStageTab === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 space-y-4">
                  <span className="inline-block px-2 py-0.5 rounded-sm bg-zinc-900 border border-zinc-800 font-mono text-[9px] uppercase text-zinc-405">
                    Remittance Engine
                  </span>
                  <h3 className="text-base font-medium text-white uppercase tracking-wide">Bank Reconciliation & Outbox sweeps</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    Unify banking wires and accounting records. Register bank wire deposits, map them directly against outstanding invoices based on reference matching, and configure custom automated communication alerts.
                  </p>
                  <ul className="text-xs text-zinc-500 space-y-2 font-mono">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2]" /> Bank wire feeds and simulated deposits
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2]" /> Immediate Match & Pay reconciliation indicators
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2]" /> Configurable cron-based outbox reminders sweep
                    </li>
                  </ul>
                </div>
                
                {/* Interactive Stage II Illustration Box */}
                <div className="md:col-span-7 bg-zinc-950/80 border border-zinc-900 rounded-xl p-5 md:p-6 shadow-2xl relative min-h-[300px] flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
                  
                  {/* Title & Status */}
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-zinc-550 uppercase font-semibold">Automated matching Ledger</span>
                      <div className="text-xs font-semibold text-white tracking-wider flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-emerald-400" /> Remittance matching engine
                      </div>
                    </div>
                    {stage2Status === 'success' && (
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/25 animate-pulse uppercase tracking-wider">
                        Active Sync
                      </span>
                    )}
                  </div>

                  {/* Wire Matching Graphic Cards */}
                  <div className="space-y-4 flex-1 flex flex-col justify-center">
                    {stage2Status === 'idle' ? (
                      <div className="space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Bank wire */}
                          <div className="bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-850 space-y-1">
                            <span className="text-[8px] font-mono text-zinc-550 uppercase tracking-wider block">Simulated Wire Ingress</span>
                            <div className="text-xs font-bold text-zinc-100">$12,500.00</div>
                            <div className="text-[9px] font-mono text-zinc-400 select-all truncate bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-900">Memo: Ref #INV-2026-004</div>
                            <div className="text-[8px] font-mono text-zinc-500">Origin: Chase Business Direct</div>
                          </div>

                          {/* Outstanding invoice */}
                          <div className="bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-850 space-y-1">
                            <span className="text-[8px] font-mono text-amber-500/80 uppercase tracking-wider block font-semibold">Pending Invoice</span>
                            <div className="text-xs font-bold text-zinc-100">$12,500.00</div>
                            <div className="text-[9px] font-mono text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-900">ID: INV-2026-004</div>
                            <div className="text-[8px] font-mono text-amber-500/60">Reminders scheduled: Every 48h</div>
                          </div>
                        </div>

                        <button
                          onClick={handleStage2Match}
                          className="w-full py-2.5 rounded-lg text-xs font-mono bg-zinc-900 border border-zinc-800 hover:border-zinc-500 hover:bg-zinc-850 hover:text-white text-zinc-350 transition-all cursor-pointer flex items-center justify-center gap-2 group"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-180 transition-all duration-500" />
                          Trigger Matching Sweep
                        </button>
                      </div>
                    ) : stage2Status === 'matching' ? (
                      <div className="py-6 flex flex-col items-center justify-center space-y-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full border-2 border-zinc-800 border-t-emerald-500 animate-spin" />
                          <Coins className="w-4 h-4 text-zinc-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div className="space-y-1 text-center">
                          <p className="text-xs font-mono text-zinc-300 animate-pulse">Running reference validation...</p>
                          <p className="text-[9px] font-mono text-zinc-550">Mapping Wire Ref against Outstanding Ledger Invoices</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Success card content */}
                        <div className="bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/20 space-y-2">
                          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold">
                            <Check className="w-4 h-4 stroke-[2]" /> REMITTANCE MATCH SUCCESSFUL
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400 leading-relaxed space-y-1">
                            <div className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✓</span> Wire Memo <code className="text-white px-1 bg-zinc-900 rounded border border-zinc-800">INV-2026-004</code> mapped perfectly to client <span className="text-zinc-200">Acme Labs Intl</span></div>
                            <div className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✓</span> Invoice Status advanced to <span className="text-emerald-400 font-semibold px-1 py-0.2 bg-emerald-500/10 rounded">PAID</span></div>
                            <div className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✓</span> Outbox auto-reminder sweep program safely canceled for this record</div>
                          </div>
                        </div>

                        <button
                          onClick={resetStage2}
                          className="w-full py-2 rounded-lg text-[10px] font-mono bg-zinc-900 border border-zinc-800 hover:text-white text-zinc-550 hover:bg-zinc-850 cursor-pointer text-center"
                        >
                          Reset Sweep Simulation
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeStageTab === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 space-y-4">
                  <span className="inline-block px-2 py-0.5 rounded-sm bg-zinc-900 border border-zinc-800 font-mono text-[9px] uppercase text-zinc-405">
                    SME Intelligent Layer
                  </span>
                  <h3 className="text-base font-medium text-white uppercase tracking-wide">Contextual AI Copilot</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    Interact directly with your active financial datasets using natural query patterns. Research client billing logs, identify missing matching bank wire transfers, and compose professional outstanding reminders.
                  </p>
                  <ul className="text-xs text-zinc-500 space-y-2 font-mono">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-400 stroke-[2]" /> Accurate client transaction mapping inputs
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-400 stroke-[2]" /> Server-side secure Gemini 3.5 LLM integration
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-400 stroke-[2]" /> Multi-turn chat terminal with dynamic suggestions
                    </li>
                  </ul>
                </div>
                
                {/* Interactive Stage III Illustration Box */}
                <div className="md:col-span-7 bg-zinc-950/80 border border-zinc-900 rounded-xl p-4 md:p-5 shadow-2xl relative min-h-[300px] flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
                  
                  {/* AI Copilot header */}
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">Gemini LLM Assistant</span>
                    </div>
                    {stage3Chat.length > 1 && (
                      <button
                        onClick={resetStage3Chat}
                        className="text-[9px] font-mono text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
                      >
                        Clear Chat
                      </button>
                    )}
                  </div>

                  {/* Chat logs */}
                  <div className="flex-1 overflow-y-auto max-h-[150px] space-y-3 min-h-[140px] pr-1 scrollbar-none font-sans">
                    {stage3Chat.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-2.5 items-start ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-5 h-5 rounded-full bg-indigo-950/60 border border-indigo-900/60 flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                          </div>
                        )}
                        <div
                          className={`p-2.5 rounded-lg max-w-[85%] text-[10.5px] leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-zinc-900 text-zinc-100 border border-zinc-800'
                              : 'bg-zinc-905/60 text-zinc-400 border border-zinc-900/60'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {stage3Typing && (
                      <div className="flex gap-2.5 items-start justify-start">
                        <div className="w-5 h-5 rounded-full bg-indigo-950/40 border border-indigo-900/35 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                        </div>
                        <div className="p-2.5 bg-zinc-905/60 border border-zinc-900/60 rounded-lg text-[10px] text-zinc-500 font-mono italic animate-pulse">
                          Copilot digesting data streams...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interactive Query Presets */}
                  <div className="pt-3 border-t border-zinc-900 mt-2.5 space-y-2">
                    <span className="text-[8px] font-mono text-zinc-550 uppercase tracking-wider block">Ask the Copilot:</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => handleStage3Query(
                          "Are there any immediate risk factors?",
                          "⚠️ Cashflow Alert: Outstanding invoice INV-2026-004 ($12,500) has exceeded the Acme average settlement profile by 4.5 days. Gemini risk vector recommends pushing a Stage II email sweep."
                        )}
                        disabled={stage3Typing}
                        className="px-2.5 py-1.5 text-[9px] font-mono rounded bg-zinc-900 border border-zinc-850 hover:border-indigo-500/50 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        ⚡ Risk factors
                      </button>
                      <button
                        onClick={() => handleStage3Query(
                          "Draft a polite email outreach reminder",
                          "✉️ Outreach Draft Generated: 'Hey Acme Billing, hope all is well! Just checking in on INV-2026-004 ($12.5k). Let us know if you need our bank wire remittance addresses again. Thanks!'"
                        )}
                        disabled={stage3Typing}
                        className="px-2.5 py-1.5 text-[9px] font-mono rounded bg-zinc-900 border border-zinc-850 hover:border-indigo-500/50 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        ✉️ Draft email
                      </button>
                      <button
                        onClick={() => handleStage3Query(
                          "Summarize outstanding general ledger balance",
                          "📊 Total Outstanding: $12,500.00 across 1 aging account. Flowt Stage I automated balance metrics show healthy average payment terms of 11.2 days."
                        )}
                        disabled={stage3Typing}
                        className="px-2.5 py-1.5 text-[9px] font-mono rounded bg-zinc-900 border border-zinc-850 hover:border-indigo-500/50 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        📊 Ledger outline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Models Section */}
      <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto space-y-12" id="pricing-details">
        <div className="text-center space-y-2">
          <h2 className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Pricing Plans</h2>
          <p className="text-2xl font-light text-white uppercase">Flexible options for international teams</p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto font-light">
            Toggle annual billing to activate a 25% savings margin on your service desk.
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
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block border-b border-zinc-900 pb-1.5">
                    Included Capabilities
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
