import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, Bot, User, Trash2, ArrowUpRight, ShieldCheck, Mail, 
  FileText, Check, Copy, Settings, Activity, Database, AlertTriangle, 
  ChevronRight, RefreshCw, FileCheck, Code, HelpCircle
} from 'lucide-react';
import { Invoice, BankTransaction } from '../types.js';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface SmeAiCopilotProps {
  invoices: Invoice[];
  bankTransactions: BankTransaction[];
}

export default function SmeAiCopilot({ invoices, bankTransactions }: SmeAiCopilotProps) {
  // Nested sub-workspace navigation
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'drafts' | 'vectors' | 'diagnostics'>('chat');
  
  // Chat console states
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: `👋 **Welcome to FLOWT Stage III: SME Corporate AI Co-Pilot**\n\nI am your sovereign context-aware accounting assistant. I have mapped your real-time ledger and banking feeds. Tell me what cashflow operations or drafts you need compiled today!`
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Dynamic drafts builder states
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [outreachTone, setOutreachTone] = useState<'cordial' | 'assertive' | 'urgent'>('cordial');
  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [draftLoading, setDraftLoading] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState(false);

  // Auto scroll for chat
  useEffect(() => {
    if (activeSubTab === 'chat') {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatLoading, activeSubTab]);

  // Set default selected invoice for drafts
  useEffect(() => {
    const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue' || inv.status === 'Outstanding');
    if (overdueInvoices.length > 0 && !selectedInvoiceId) {
      setSelectedInvoiceId(overdueInvoices[0].id);
    } else if (invoices.length > 0 && !selectedInvoiceId) {
      setSelectedInvoiceId(invoices[0].id);
    }
  }, [invoices, selectedInvoiceId]);

  // Handle send message logic
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || chatLoading) return;

    const updatedMessages = [...messages, { role: 'user' as const, content: textToSend }];
    setMessages(updatedMessages);
    setUserInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'model', content: data.response }]);
      } else {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'model', 
            content: `⚠️ **[API Security Refusal]** Could not communicate with server co-pilot. Make sure process.env.GEMINI_API_KEY is active in your terminal/environment or consult the workspace.` 
          }
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'model', 
          content: '⚠️ **[Connection Timeout]** Let-down connecting to the server-side AI endpoints.' 
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'model',
        content: `🔄 **Copilot ledger reset.** Conversation history cleared successfully. Ask me anything regarding your active transactions!`
      }
    ]);
  };

  // Automated Outreach generator logic
  const handleGenerateDraft = () => {
    const targetInvoice = invoices.find(inv => inv.id === selectedInvoiceId);
    if (!targetInvoice) return;

    setDraftLoading(true);
    setCopiedStatus(false);

    // Mock quick server-side generation feel
    setTimeout(() => {
      let draftText = '';
      const formattedDate = new Date(targetInvoice.dueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const currencySymbol = targetInvoice.currency === 'USD' ? '$' : targetInvoice.currency === 'EUR' ? '€' : '£';

      if (outreachTone === 'cordial') {
        draftText = `Subject: Friendly Reminder: Outstanding Invoice ${targetInvoice.id} - ${targetInvoice.clientName}

Dear Accounts Receivable Team,

I hope this message finds you well. 

This is a gentle reminder that invoice ${targetInvoice.id}, sent on ${new Date(targetInvoice.issueDate).toLocaleDateString()}, for ${currencySymbol}${targetInvoice.amount.toLocaleString()} was scheduled for payment on ${formattedDate}.

We realize you have a busy operations line, and this may have simply slipped through. If you have already executed this remittance, please disregard this note.

You can verify and securely execute this settlement immediately using our continuous gateway node below:
https://flowt.app/pay/${targetInvoice.id}

If any adjustments are needed, do let us know!

Warm regards,
Accounts Desk
FLOWT Automated Billing Portal`;
      } else if (outreachTone === 'assertive') {
        draftText = `Subject: Overdue Notice: Invoice ${targetInvoice.id} Settlement Pending

To: Accounts Payable Manager, ${targetInvoice.clientName}

This is a formal update regarding outstanding Invoice ${targetInvoice.id} which matured on ${formattedDate}.

As of today, we have not registered the matching wire reference corresponding to the outstanding balance of ${currencySymbol}${targetInvoice.amount.toLocaleString()}. 

Please review the attached invoice summary and initiate immediate payment instruction. You can secure automatic settlement using our Stripe instant ACH channel:
https://flowt.app/pay/${targetInvoice.id}

If we do not receive remittance confirmation within the standard three (3) business days, we will initiate automated client communication sweeps as scheduled on your profile.

Sincerely,
Credit Operations Team,
FLOWT Sovereign Platform`;
      } else {
        draftText = `Subject: URGENT CREDIT RISK DEMAND: Immediate Action Required - Invoice ${targetInvoice.id}

To: Operations Director / Chief Financial Officer, ${targetInvoice.clientName}
CC: Executive Office

This is an URGENT notice that Invoice ${targetInvoice.id} is now severely overdue since ${formattedDate}.

The total outstanding ledger balance of ${currencySymbol}${targetInvoice.amount.toLocaleString()} has been added to our pending litigation and active debt-reconciliation sweep stack.

To prevent negative credit classification on our shared remittance database, you must make immediate payment within the next 24 hours. Execute payment instantly using ACH/Wire coordinates:
https://flowt.app/pay/${targetInvoice.id}

For transaction validation enquiries, contact our active service desk immediately at billing-ops@flowt.app.

Regards,
Corporate Collections Division,
FLOWT Enterprise System`;
      }

      setGeneratedDraft(draftText);
      setDraftLoading(false);
    }, 850);
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(generatedDraft);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  const samplePrompts = [
    {
      label: "Analyze Cashflow Liquidity Risk",
      prompt: "Show me a detailed status and cashflow liquidity report including risk rating on overdue invoices."
    },
    {
      label: "Diagnose Acme Global Invoice",
      prompt: "Show me acme global outstanding invoice details and identify matching wire transfers to settle INV-2026-001."
    },
    {
      label: "Draft München Overdue Email",
      prompt: "Draft a cordova professional overdue notice email for München Creative Group based on invoice parameters."
    }
  ];

  // Format response helper
  const formatMsgText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('```')) return null;
      let formattedLine = line;
      const isBullet = line.startsWith('- ') || line.startsWith('* ');
      const cleanLine = isBullet ? line.slice(2) : line;

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-zinc-300 leading-relaxed py-0.5 font-sans">
            {cleanLine.replace(/\*\*/g, '')}
          </li>
        );
      }

      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-xs font-black uppercase text-violet-400 tracking-wider font-mono mt-3 mb-1">
            {line.slice(4)}
          </h4>
        );
      }

      return (
        <p key={idx} className="text-xs text-zinc-300 leading-relaxed py-0.5 font-sans">
          {line.replace(/\*\*/g, '')}
        </p>
      );
    });
  };

  // Math helper for stats
  const totalOutstanding = invoices
    .filter(inv => inv.status === 'Outstanding' || inv.status === 'Overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueInvoicesCount = invoices.filter(inv => inv.status === 'Overdue').length;

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden p-1 flex flex-col space-y-6" id="sme-ai-copilot-workspace">
      
      {/* Top Professional HUD Banner */}
      <div className="bg-zinc-900/30 border border-zinc-900/60 rounded-xl p-5 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-ping" />
            <span className="text-[9px] font-mono tracking-widest text-violet-400 font-bold uppercase">Sovereign Layer Operational</span>
          </div>
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">AI CO-PILOT COMMAND DESK</h2>
          <p className="text-[10px] text-zinc-500 font-mono">FLOWT Autonomous Stage III Matrix</p>
        </div>

        <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-violet-400 shrink-0" />
          <div>
            <span className="block text-[8px] text-zinc-500 font-mono uppercase">Assigned Core Intelligence</span>
            <span className="text-xs font-light text-zinc-200">Gemini 3.5 Flash Model</span>
          </div>
        </div>

        <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center gap-3">
          <Database className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <span className="block text-[8px] text-zinc-500 font-mono uppercase">Indexed Context Nodes</span>
            <span className="text-xs font-light text-zinc-200">{invoices.length + bankTransactions.length} Total Parameters</span>
          </div>
        </div>

        <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center gap-3">
          <Activity className="w-5 h-5 text-pink-400 shrink-0" />
          <div>
            <span className="block text-[8px] text-zinc-500 font-mono uppercase">Calculated Risk Index</span>
            <span className={`text-xs font-mono font-bold ${overdueInvoicesCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {overdueInvoicesCount > 0 ? 'MODERATE OVERDUE' : 'NOMINAL SAFE'}
            </span>
          </div>
        </div>
      </div>

      {/* Internal Sub-Workspace Workspace Tabs Switcher */}
      <div className="flex flex-wrap gap-1 border-b border-zinc-900 pb-2">
        <button
          onClick={() => setActiveSubTab('chat')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-300 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'chat'
              ? 'bg-zinc-100 text-zinc-950 scale-102 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
          }`}
        >
          <Bot className="w-3.5 h-3.5" /> Dialogue Terminal
        </button>

        <button
          onClick={() => setActiveSubTab('drafts')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-300 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'drafts'
              ? 'bg-zinc-100 text-zinc-950 scale-102 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
          }`}
        >
          <Mail className="w-3.5 h-3.5" /> AI Outreach Drafts
        </button>

        <button
          onClick={() => setActiveSubTab('vectors')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-300 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'vectors'
              ? 'bg-zinc-100 text-zinc-950 scale-102 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
          }`}
        >
          <Code className="w-3.5 h-3.5" /> Vector Payload Monitor
        </button>

        <button
          onClick={() => setActiveSubTab('diagnostics')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-300 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'diagnostics'
              ? 'bg-zinc-100 text-zinc-950 scale-102 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Liquidity Risk Metrics
        </button>
      </div>

      {/* Main Interactive Screen Segment */}
      <div className="min-h-[560px] flex flex-col justify-stretch">
        
        {/* VIEW A: DIALOGUE TERMINAL */}
        {activeSubTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-float-in">
            {/* Left rail suggestions */}
            <div className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                  <Settings className="w-4 h-4 text-violet-400" />
                  <div>
                    <h4 className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">Interactive Pipelines</h4>
                    <p className="text-[8.5px] text-zinc-500 font-mono">Instant dataset integration</p>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  Dispatch any high-level semantic command directly. The LLM processes your live cashbook context instantly.
                </p>

                <div className="space-y-2">
                  {samplePrompts.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(p.prompt)}
                      className="w-full text-left p-3 rounded-lg bg-zinc-900/40 border border-zinc-900 hover:border-violet-500/40 hover:bg-zinc-900/80 hover:scale-[1.01] text-zinc-300 hover:text-white transition-all text-xs font-mono flex items-center justify-between group cursor-pointer"
                    >
                      <span className="truncate pr-2">{p.label}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-violet-400 transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed metrics */}
              <div className="p-3.5 bg-violet-950/20 border border-violet-905 rounded-lg space-y-2">
                <span className="text-[8.5px] font-mono font-bold tracking-widest text-violet-400 uppercase block">
                  Synchronized Vector Space
                </span>
                <div className="space-y-1 text-[10px] text-zinc-550 font-mono">
                  <div className="flex justify-between">
                    <span>Active Invoices:</span>
                    <span className="text-zinc-300 font-bold">{invoices.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Incoming Wire Feeds:</span>
                    <span className="text-zinc-300 font-bold">{bankTransactions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overdue Outstanding:</span>
                    <span className="text-rose-400 font-bold">{overdueInvoicesCount} counts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Chat Terminal */}
            <div className="lg:col-span-8 bg-zinc-950 border border-zinc-900 rounded-xl flex flex-col h-[520px] overflow-hidden">
              <div className="p-4 bg-zinc-900/10 border-b border-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                  <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">Active Chat Console</span>
                </div>
                <button
                  onClick={clearChat}
                  className="p-1 px-3 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-rose-400 hover:border-rose-900/30 transition-all text-[9px] uppercase font-bold font-mono tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Clear History
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 max-w-[85%] ${
                      m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border text-[10px] uppercase font-bold font-mono ${
                        m.role === 'user'
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                          : 'bg-violet-950 border-violet-900 text-violet-400'
                      }`}
                    >
                      {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div
                      className={`p-3.5 rounded-lg space-y-2 ${
                        m.role === 'user'
                          ? 'bg-zinc-900 border border-zinc-850 text-zinc-100'
                          : 'bg-zinc-950 border border-zinc-900 text-zinc-300'
                      }`}
                    >
                      {formatMsgText(m.content)}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="w-7 h-7 rounded-sm bg-violet-950 border border-violet-900 flex items-center justify-center text-violet-400 shrink-0">
                      <Bot className="w-4 h-4 animate-bounce" />
                    </div>
                    <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce delay-200" />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(userInput);
                }}
                className="p-4 border-t border-zinc-900 bg-zinc-900/10 flex items-center gap-3"
              >
                <input
                  type="text"
                  required
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type queries (e.g. 'Synthesize overdue balances')"
                  className="flex-1 px-4 py-2.5 text-xs rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !userInput.trim()}
                  className="p-2.5 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 hover:scale-[1.02] active:scale-[0.98] text-white disabled:opacity-40 transition-all font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  Send <Send className="w-3 h-3" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW B: AI OUTREACH DRAFT GENERATOR */}
        {activeSubTab === 'drafts' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-float-in" id="ai-outreach-center">
            {/* Config panel */}
            <div className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                  <Mail className="w-4 h-4 text-violet-400" />
                  <div>
                    <h4 className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">Drafting Desk</h4>
                    <p className="text-[8.5px] text-zinc-550 font-mono font-bold">Automated client alerts</p>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  Select any database invoices to compile customized overdue notification drafts with automated payment coordinates.
                </p>

                {/* Overdue/Outstanding Invoices select */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono text-zinc-500 uppercase">Target Invoice Record</label>
                  <select
                    value={selectedInvoiceId}
                    onChange={(e) => setSelectedInvoiceId(e.target.value)}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white uppercase font-mono focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    {invoices.length === 0 ? (
                      <option value="">No Active Invoices Available</option>
                    ) : (
                      invoices.map((inv) => (
                        <option key={inv.id} value={inv.id} className="bg-zinc-950 text-zinc-200">
                          {inv.id} — {inv.clientName} (${inv.amount}) [{inv.status}]
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Tone Selectors */}
                <div className="space-y-2">
                  <span className="block text-[9px] font-mono text-zinc-500 uppercase">Assertiveness Level Tone</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setOutreachTone('cordial')}
                      className={`py-2 text-[10px] uppercase font-mono rounded tracking-tight cursor-pointer font-bold border transition-all ${
                        outreachTone === 'cordial'
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/80'
                          : 'bg-zinc-900/60 text-zinc-500 border-zinc-900 hover:text-zinc-300 hover:border-zinc-800'
                      }`}
                    >
                      Cordial
                    </button>
                    <button
                      onClick={() => setOutreachTone('assertive')}
                      className={`py-2 text-[10px] uppercase font-mono rounded tracking-tight cursor-pointer font-bold border transition-all ${
                        outreachTone === 'assertive'
                          ? 'bg-amber-950/40 text-amber-400 border-amber-800/80'
                          : 'bg-zinc-900/60 text-zinc-500 border-zinc-900 hover:text-zinc-300 hover:border-zinc-800'
                      }`}
                    >
                      Assertive
                    </button>
                    <button
                      onClick={() => setOutreachTone('urgent')}
                      className={`py-2 text-[10px] uppercase font-mono rounded tracking-tight cursor-pointer font-bold border transition-all ${
                        outreachTone === 'urgent'
                          ? 'bg-rose-950/40 text-rose-400 border-rose-800/80'
                          : 'bg-zinc-900/60 text-zinc-500 border-zinc-900 hover:text-zinc-300 hover:border-zinc-800'
                      }`}
                    >
                      Urgent
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleGenerateDraft}
                  disabled={draftLoading || invoices.length === 0}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-500 active:scale-[0.98] hover:scale-[1.01] transition-all text-xs font-mono tracking-widest uppercase text-white font-bold rounded-sm mt-2 disabled:opacity-45 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {draftLoading ? (
                    <>Synthesizing...</>
                  ) : (
                    <>
                      Generate Outreach <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Status Alert Badge */}
              <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-lg flex items-center gap-2.5 text-zinc-550 font-mono text-[9px]">
                <ShieldCheck className="w-4 h-4 text-zinc-500" />
                <span>Encrypted delivery pipeline available via standard SMTP configuration parameters.</span>
              </div>
            </div>

            {/* Output Panel Mockup */}
            <div className="lg:col-span-8 bg-zinc-950 border border-zinc-900 rounded-xl flex flex-col h-[520px] overflow-hidden relative">
              <div className="p-4 bg-zinc-900/10 border-b border-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-violet-400" />
                  <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">Sovereign Mail Outbox Sandbox</span>
                </div>

                {generatedDraft && (
                  <button
                    onClick={handleCopyDraft}
                    className={`px-3 py-1.5 rounded text-[9px] uppercase font-mono font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                      copiedStatus 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {copiedStatus ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied Asset!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Draft
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Display area */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-zinc-950 font-mono select-text">
                {draftLoading ? (
                  <div className="h-full flex flex-col justify-center items-center gap-3">
                    <span className="w-5 h-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                    <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Consulting Credit Parameters...</span>
                  </div>
                ) : generatedDraft ? (
                  <div className="bg-zinc-950/20 border border-zinc-900 rounded-lg p-5 text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap max-w-2xl mx-auto border-dashed">
                    {generatedDraft}
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-center max-w-sm mx-auto space-y-3">
                    <Mail className="w-8 h-8 text-zinc-700 stroke-[1.5]" />
                    <h5 className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold">No Generated Communication Asset</h5>
                    <p className="text-[10px] text-zinc-500 font-sans font-light leading-relaxed">
                      Select an invoice record and tone on the left pane, then compile to render professional overdue notice drafts instantly.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW C: VECTOR MONITOR DEVELOPER SCREEN */}
        {activeSubTab === 'vectors' && (
          <div className="space-y-5 animate-float-in" id="ai-vector-monitor">
            <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-violet-400" />
                <h4 className="text-xs uppercase font-mono text-white font-bold tracking-widest">Active Ledger Embedding Context System</h4>
              </div>
              <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-3xl">
                The FLOWT sovereign co-pilot compiles real-time corporate parameters into formatted schemas before injecting them into the core Gemini 3.5 Large Language Model sandbox session to prevent training drift and security lapses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* System instructions payload */}
              <div className="border border-zinc-900 bg-zinc-950 rounded-xl p-5 space-y-3 font-mono">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">01 // System Security Instructions</span>
                  <span className="px-2 py-0.5 bg-violet-950/50 text-violet-300 border border-violet-900 text-[8px] rounded uppercase font-black uppercase">Hardlocked</span>
                </div>
                <div className="text-[11px] text-zinc-400 leading-relaxed space-y-2 bg-zinc-900/30 p-4 border border-zinc-900 rounded select-text max-h-[280px] overflow-y-auto">
                  <p className="text-zinc-500">// Static instructions injected on every multi-turn prompt session</p>
                  <p>You are an elite, corporate SME cashflow assistant representing FLOWT Platform.</p>
                  <p>Your primary goal is to analyze real-time bank wire settlements and unpaid customer files to flag risk ratings and write alerts.</p>
                  <p>Always output neat, highly professional, precise corporate formats. Limit self-referencing descriptions. Retain extreme security protocols.</p>
                </div>
              </div>

              {/* Data registry payload */}
              <div className="border border-zinc-900 bg-zinc-950 rounded-xl p-5 space-y-3 font-mono">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">02 // Real-time Inward Ledger JSON</span>
                  <span className="text-[8px] text-zinc-500 uppercase">Synchronized Dynamic Feed</span>
                </div>
                <div className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-900/30 p-4 border border-zinc-900 rounded select-text max-h-[280px] overflow-y-auto">
                  <p className="text-zinc-500">// Generated Context Vectors Schema ({invoices.length} invoices, {bankTransactions.length} transactions)</p>
                  <pre className="text-[10px] text-zinc-300 font-mono leading-normal">
{JSON.stringify({
  summary: {
    outstandingBalance: totalOutstanding,
    overdueItems: overdueInvoicesCount,
    currencySpread: "EUR, USD, GBP",
    activeSecurityProtocols: "TLS-AES-256-GCM"
  },
  sampleInvoices: invoices.slice(0, 3).map(i => ({
    id: i.id,
    client: i.clientName,
    val: i.amount,
    status: i.status
  })),
  wiresFeedCount: bankTransactions.length
}, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW D: LIQUIDITY RISK DIAGNOSTICS */}
        {activeSubTab === 'diagnostics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-float-in" id="ai-liquidity-diagnostics">
            
            {/* Risk Parameters audit */}
            <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-5">
              <div className="border-b border-zinc-900 pb-3">
                <h4 className="text-xs uppercase font-mono text-white font-bold tracking-widest">Semantic Cashflow Risk Audit</h4>
                <p className="text-[10px] text-zinc-500 font-mono">FLOWT sovereign model assessments</p>
              </div>

              <div className="space-y-3">
                {invoices.length === 0 ? (
                  <p className="text-xs text-zinc-500 font-light">No ledger records detected to establish risk index profiles.</p>
                ) : (
                  invoices.map((inv) => {
                    const isHighRisk = inv.status === 'Overdue' && inv.amount > 1000;
                    const isMedRisk = inv.status === 'Overdue' && inv.amount <= 1000;
                    
                    let riskText = "NOMINAL RISK";
                    let riskColor = "text-emerald-400 bg-emerald-950/40 border-emerald-900";
                    let riskDesc = "Payments are completely healthy or within regular grace period metrics.";
                    
                    if (isHighRisk) {
                      riskText = "HIGH LIQUIDITY PENALTY";
                      riskColor = "text-rose-400 bg-rose-950/40 border-rose-900";
                      riskDesc = "Overdue high balance invoice threatens continuous capital sweeps. Active collection triggered.";
                    } else if (isMedRisk) {
                      riskText = "MODERATE DELAY";
                      riskColor = "text-amber-400 bg-amber-950/40 border-amber-900";
                      riskDesc = "Outstanding balance overdue. Needs cordial automated notification.";
                    }

                    return (
                      <div key={inv.id} className="p-4 bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-all rounded-lg flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{inv.id} / {inv.clientName}</span>
                          <p className="text-xs text-zinc-300 font-light">Amount: <span className="font-semibold text-white">${inv.amount.toLocaleString()}</span></p>
                          <p className="text-[10px] text-zinc-400 leading-normal max-w-md font-sans font-light">{riskDesc}</p>
                        </div>
                        <div className={`px-2.5 py-1 text-[9px] font-mono border rounded uppercase font-bold shrink-0 ${riskColor}`}>
                          {riskText}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Diagnostic Insights scorecard */}
            <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                  <Activity className="w-4 h-4 text-violet-400" />
                  <div>
                    <h4 className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">Preventative Sweep Actions</h4>
                    <p className="text-[8.5px] text-zinc-550 font-mono">Immediate platform remedies</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs font-light">
                  <div className="p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-lg space-y-1.5">
                    <h5 className="font-mono text-[10px] uppercase font-bold text-zinc-300 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-violet-400" /> Remittance matching sweeps
                    </h5>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                      Verify matches between unallocated wire transfers and unpaid records before releasing reminder alerts.
                    </p>
                  </div>

                  <div className="p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-lg space-y-1.5">
                    <h5 className="font-mono text-[10px] uppercase font-bold text-zinc-300 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-violet-400" /> Define Custom Grace Filters
                    </h5>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                      Adjust your account reminders parameters to wait for wire clearances during banking holidays.
                    </p>
                  </div>

                  <div className="p-3.5 bg-violet-950/10 border border-violet-900/20 rounded-lg space-y-1">
                    <span className="text-[8px] font-mono text-violet-400 uppercase font-black tracking-widest">Sovereign Recommendation</span>
                    <p className="text-[10px] text-zinc-400 font-mono select-none leading-relaxed">
                      "Execute automatic sweep of municipal cords within the credit margin limits to isolate corporate deficits."
                    </p>
                  </div>
                </div>
              </div>

              {/* Secure sandbox protocol credit */}
              <div className="p-3 bg-zinc-950 border border-zinc-900 rounded flex justify-center items-center gap-2 text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none">
                <ShieldCheck className="w-4 h-4 text-zinc-400" /> Verified Cryptographic Layer
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
