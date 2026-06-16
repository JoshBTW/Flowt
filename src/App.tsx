import React, { useState, useEffect } from 'react';
import { Invoice, BankTransaction, ReminderConfig, ReminderHistoryItem } from './types.js';
import DashboardStats from './components/DashboardStats.js';
import InvoiceList from './components/InvoiceList.js';
import InvoiceFormModal from './components/InvoiceFormModal.js';
import BankReconciliation from './components/BankReconciliation.js';
import ReminderSettings from './components/ReminderSettings.js';
import FinancialReports from './components/FinancialReports.js';
import StripeSimulationModal from './components/StripeSimulationModal.js';
import LandingPage, { FlowtLogo } from './components/LandingPage.js';
import LoginPage from './components/LoginPage.js';
import CustomCursor from './components/CustomCursor.js';
import SmeAiCopilot from './components/SmeAiCopilot.js';
import { 
  Plus, Layers, FileText, BarChart3, HelpCircle, ArrowLeft,
  Settings, Loader2, Sparkles, CheckSquare, Bell, CreditCard, Landmark
} from 'lucide-react';

export default function App() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [reminderConfig, setReminderConfig] = useState<ReminderConfig | null>(null);
  const [reminderHistory, setReminderHistory] = useState<ReminderHistoryItem[]>([]);
  
  // High fidelity Stage-Tiers states
  const [viewMode, setViewMode] = useState<'landing' | 'login' | 'console'>('landing');
  const [currentTier, setCurrentTier] = useState<1 | 2 | 3>(3);
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'invoices' | 'reports' | 'reconciliation' | 'reminders' | 'ai-copilot'>('invoices');
  
  // Modals & States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [selectedPaymentInvoice, setSelectedPaymentInvoice] = useState<Invoice | null>(null);
  
  // Loading & logs
  const [loading, setLoading] = useState(true);
  const [sweepResponse, setSweepResponse] = useState<{ count: number; items: ReminderHistoryItem[] } | null>(null);

  // Initial Fetch Routines
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [invRes, txRes, configRes, historyRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/bank-transactions'),
        fetch('/api/settings/reminder'),
        fetch('/api/reminder-history')
      ]);

      if (invRes.ok) setInvoices(await invRes.json());
      if (txRes.ok) setBankTransactions(await txRes.json());
      if (configRes.ok) setReminderConfig(await configRes.json());
      if (historyRes.ok) setReminderHistory(await historyRes.json());
    } catch (err) {
      console.error('Error connecting to backend services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // CRUD Invoices
  const handleCreateOrUpdateInvoice = async (formData: any) => {
    try {
      let url = '/api/invoices';
      let method = 'POST';

      if (invoiceToEdit) {
        url = `/api/invoices/${invoiceToEdit.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setInvoiceToEdit(null);
        fetchAllData();
      } else {
        alert('Could not persist billing records.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice permanently?')) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Automated/Manual Reminders trigger
  const handleSendReminderManually = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}/send-reminder`, { method: 'POST' });
      if (res.ok) {
        alert('Friendly notification generated and dispatched via SSL mail queue!');
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Run bulk automated sweep reminders
  const handleTriggerSweep = async () => {
    try {
      const res = await fetch('/api/reminders/trigger', { method: 'POST' });
      if (res.ok) {
        const payload = await res.json();
        setSweepResponse(payload);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save reminder interval config
  const handleSaveReminderConfig = async (newConfig: ReminderConfig) => {
    try {
      const res = await fetch('/api/settings/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        setReminderConfig(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Bank Reconciliation matching processes
  const handleReconcile = async (transactionId: string, invoiceId: string) => {
    try {
      const res = await fetch('/api/bank-transactions/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, invoiceId })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnreconcile = async (transactionId: string) => {
    try {
      const res = await fetch('/api/bank-transactions/unreconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Bank Wire simulator Ingress
  const handleSimulateWireTx = async (txData: any) => {
    try {
      const res = await fetch('/api/bank-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData)
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Paid Callback redirect handler from Stripe modal
  const handleStripePaymentComplete = (invoiceId: string, paymentId: string) => {
    fetchAllData();
  };

  if (viewMode === 'landing') {
    return (
      <>
        <CustomCursor />
        <LandingPage 
          activeTier={currentTier}
          onSelectTier={(tier) => {
            setCurrentTier(tier);
            setViewMode('console');
          }}
          onEnterConsole={() => {
            setViewMode('console');
          }}
          onGoToLogin={() => {
            setViewMode('login');
          }}
        />
      </>
    );
  }

  if (viewMode === 'login') {
    return (
      <>
        <CustomCursor />
        <LoginPage 
          onBack={() => setViewMode('landing')}
          onLoginSuccess={(tier, customKey) => {
            setCurrentTier(tier);
            setViewMode('console');
          }}
        />
      </>
    );
  }

  if (viewMode === 'console' && activeTab === 'ai-copilot') {
    return (
      <>
        <CustomCursor />
        <div className="min-h-screen bg-black text-zinc-100 flex flex-col selection:bg-blue-900 selection:text-white animate-float-in" id="sovereign-fullscreen-root">
          {/* Pro minimalist header */}
          <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 h-16 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <FlowtLogo className="w-8 h-8" />
              <div className="flex items-center gap-2">
                <h1 className="text-xs font-display tracking-[0.2em] font-black text-white">FLOWT AI ASSISTANT</h1>
                <span className="text-[7.5px] font-mono uppercase bg-zinc-900 text-zinc-400 border border-zinc-805 px-2 py-0.5 rounded-sm tracking-wider font-semibold">
                  SME ACCOUNT COMPANION
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('invoices')}
                className="flex items-center gap-1.5 bg-zinc-900/60 p-2 px-4 rounded border border-zinc-800 hover:border-blue-500/45 text-zinc-300 hover:text-white hover:bg-zinc-950 transition-all text-[9px] uppercase font-bold font-mono tracking-widest cursor-pointer bounce-spring"
              >
                ← Return to ledger Console
              </button>
            </div>
          </header>

          {/* Dynamic Full Screen Content Port */}
          <div className="flex-1 flex flex-col p-4 md:p-6 pb-2 min-h-0 bg-black overflow-y-auto">
            {currentTier < 3 ? (
              <div className="flex-1 flex items-center justify-center py-10">
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl max-w-3xl w-full p-8 md:p-12 space-y-10 relative overflow-hidden" id="ai-marketing-showcase-fullscreen">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
                  <div className="absolute -top-3 left-6 px-2.5 py-0.5 bg-zinc-900 border border-zinc-800 text-[8px] font-mono tracking-widest text-zinc-400 rounded-sm font-black">
                    INTELLIGENT AI ASSISTANT
                  </div>

                  <div className="text-center space-y-4 max-w-xl mx-auto">
                    <div className="inline-flex p-3 bg-blue-950/20 border border-blue-900/40 rounded-xl text-blue-400">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl md:text-3xl font-light tracking-tight text-white uppercase font-sans">
                      Unleash the FLOWT AI Assistant
                    </h2>
                    <p className="text-xs text-zinc-400 font-light leading-relaxed">
                      Connect your active ledger directly to our secure, server-side Gemini 3.5 model to quickly draft outstanding reminders, analyze credit balances, and answer ledger questions.
                    </p>
                  </div>

                  {/* Feature Matrix Bento */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="p-5 border border-zinc-900/85 bg-zinc-950/70 rounded-xl space-y-2 hover:border-blue-500/20 transition-all duration-300">
                      <h4 className="text-[10px] uppercase font-mono tracking-wider text-blue-400 font-bold">Ledger Integration</h4>
                      <p className="text-xs text-zinc-400 font-light leading-relaxed">
                        Reads active invoice indices, client profiles, and historical banking payments securely.
                      </p>
                    </div>

                    <div className="p-5 border border-zinc-900/85 bg-zinc-950/70 rounded-xl space-y-2 hover:border-blue-500/20 transition-all duration-300">
                      <h4 className="text-[10px] uppercase font-mono tracking-wider text-blue-400 font-bold">Smart Outreach Drafts</h4>
                      <p className="text-xs text-zinc-400 font-light leading-relaxed">
                        Generate professional outstanding overdue notices, specific Grace Period options, and client email drafts.
                      </p>
                    </div>

                    <div className="p-5 border border-zinc-900/85 bg-zinc-950/70 rounded-xl space-y-2 hover:border-blue-500/20 transition-all duration-300">
                      <h4 className="text-[10px] uppercase font-mono tracking-wider text-blue-400 font-bold">Invoicing Insights</h4>
                      <p className="text-xs text-zinc-400 font-light leading-relaxed">
                        Identify account liabilities, group outstanding balances, and forecast cashflow trends.
                      </p>
                    </div>
                  </div>

                  {/* Upgrade Action bar */}
                  <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left space-y-1">
                      <div className="text-xs text-white font-mono uppercase tracking-wider font-semibold">Tier III Complete access</div>
                      <p className="text-[10px] text-zinc-500">Unlocks immediate conversational analysis and direct ledger syncing.</p>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentTier(3);
                        fetchAllData();
                      }}
                      className="px-6 py-3 text-xs uppercase tracking-widest rounded-sm bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold hover:scale-[1.03] hover:ring-1 hover:ring-blue-400 active:scale-[0.98] transition-all duration-300 cursor-pointer"
                    >
                      Authorize Tier III ($299/mo)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col min-h-0 animate-float-in">
                <SmeAiCopilot invoices={invoices} bankTransactions={bankTransactions} />
              </div>
            )}
          </div>
          
          <footer className="py-4 text-center text-[8px] text-zinc-700 tracking-widest uppercase font-mono shrink-0 select-none border-t border-zinc-950/50 bg-black">
            FLOWT SECURE AI SYSTEM // DATA PRIVACY COMPLIANT
          </footer>
        </div>
      </>
    );
  }

  return (
    <>
      <CustomCursor />
      <div className="min-h-screen text-zinc-100 flex flex-col selection:bg-indigo-950 selection:text-white animate-float-in" id="flowt-root">
      
      {/* Top Navigation / App Banner Header */}
      <header className="border-b border-zinc-900/50 bg-black/85 backdrop-blur-md sticky top-0 z-40 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Stunning customized brand logo */}
          <FlowtLogo className="w-9 h-9" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-display text-white uppercase tracking-widest">FLOWT</h1>
              <span className="text-[9px] font-mono uppercase tracking-widest bg-zinc-950 text-indigo-400 border border-zinc-900 px-2.5 py-0.5 rounded-full font-bold">
                Tier {currentTier === 3 ? "III" : currentTier === 2 ? "II" : "I"} Console
              </span>
            </div>
          </div>
        </div>

        {/* Global Control Status & Toggle back to landing plan */}
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => setViewMode('landing')}
            className="flex items-center gap-1.5 bg-zinc-950 p-1.5 px-3 rounded-full border border-zinc-900 hover:border-indigo-500/20 text-zinc-400 hover:text-white transition-all text-[10px] uppercase font-bold font-mono tracking-wider bounce-spring bounce-btn cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" /> Landing & Pricing
          </button>
          
          <div className="hidden sm:flex items-center gap-2 bg-zinc-950 p-1.5 px-3 rounded-full border border-zinc-900">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-zinc-400 font-mono text-[10px] uppercase tracking-widest font-bold">Reconciliation Live</span>
          </div>
        </div>
      </header>

      {/* Main Body Grid Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* Statistics & Totals Strip */}
        <DashboardStats invoices={invoices} />

        {/* Navigation Workspace Switch Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900/40 pb-4">
          
          <nav className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-900" id="primary-workspace-navigation">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider rounded-lg bounce-spring bounce-tab ${
                activeTab === 'invoices'
                  ? 'bg-zinc-100 text-zinc-950 font-black shadow-lg scale-102'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Ledger
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider rounded-lg bounce-spring bounce-tab ${
                activeTab === 'reports'
                  ? 'bg-zinc-100 text-zinc-950 font-black shadow-lg scale-102'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Reports
            </button>
            <button
              onClick={() => {
                setActiveTab('reconciliation');
                setSweepResponse(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider rounded-lg bounce-spring bounce-tab ${
                activeTab === 'reconciliation'
                  ? 'bg-zinc-100 text-zinc-950 font-black shadow-lg scale-102'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" /> Reconciliation
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider rounded-lg bounce-spring bounce-tab ${
                activeTab === 'reminders'
                  ? 'bg-zinc-100 text-zinc-950 font-black shadow-lg scale-102'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Bell className="w-3.5 h-3.5" /> Reminders
            </button>
            <button
              onClick={() => setActiveTab('ai-copilot')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider rounded-lg bounce-spring bounce-tab transition-all duration-300 relative ${
                activeTab === 'ai-copilot'
                  ? 'bg-blue-600 text-white font-black shadow-lg scale-[1.02]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 hover:ring-1 hover:ring-blue-500/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold">AI Assistant</span>
              <span className="text-[8px] font-mono uppercase bg-blue-950 text-blue-300 border border-blue-900 px-1.5 py-0.5 rounded-sm tracking-wide font-black">
                Tier III
              </span>
            </button>
          </nav>

          {/* New Invoice Drafting controller */}
          <button
            onClick={() => {
              setInvoiceToEdit(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full bg-blue-600 hover:bg-blue-500 text-white bounce-spring bounce-btn shadow-lg shadow-blue-900/30 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-white" /> Draft Invoice
          </button>
        </div>

        {/* Dynamic Panel Renderer */}
        {loading ? (
          <div className="py-24 flex flex-col justify-center items-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Fetching Live Ledger Feed...</p>
          </div>
        ) : (
          <div className="space-y-4 animate-float-in">
            {/* Panel 1: Invoice Ledgers */}
            {activeTab === 'invoices' && (
              <InvoiceList
                invoices={invoices}
                onEdit={(invoice) => {
                  setInvoiceToEdit(invoice);
                  setIsFormOpen(true);
                }}
                onDelete={handleDeleteInvoice}
                onSendReminder={handleSendReminderManually}
                onSimulatePayment={(invoice) => setSelectedPaymentInvoice(invoice)}
              />
            )}

            {/* Panel 2: Financial Reports */}
            {activeTab === 'reports' && (
              <FinancialReports invoices={invoices} />
            )}

            {/* Panel 3: Bank Reconciliation Module with Tier Guard */}
            {activeTab === 'reconciliation' && (
              currentTier < 2 ? (
                <div className="py-16 text-center bg-zinc-950 border border-zinc-900 rounded-2xl max-w-xl mx-auto space-y-4 p-8">
                  <Landmark className="w-12 h-12 text-indigo-400 mx-auto animate-pulse" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">Stage II Access Restricted</h3>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-mono">
                    Bank feeds, automatic reference matching, and deposit sync are part of the Stage 2 architecture and require the **Pro-Reconciler** plan.
                  </p>
                  <button
                    onClick={() => {
                      setCurrentTier(2);
                      fetchAllData();
                    }}
                    className="px-6 py-3 text-[10px] uppercase tracking-widest rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold bounce-spring bounce-btn cursor-pointer"
                  >
                    Upgrade to Tier II ($149)
                  </button>
                </div>
              ) : (
                <BankReconciliation
                  transactions={bankTransactions}
                  invoices={invoices}
                  onReconcile={handleReconcile}
                  onUnreconcile={handleUnreconcile}
                  onSimulateIncomingTx={handleSimulateWireTx}
                  loading={loading}
                />
              )
            )}

            {/* Panel 4: Outbound Automation Settings with Tier Guard */}
            {activeTab === 'reminders' && (
              currentTier < 2 ? (
                <div className="py-16 text-center bg-zinc-950 border border-zinc-900 rounded-2xl max-w-xl mx-auto space-y-4 p-8 font-mono">
                  <Bell className="w-12 h-12 text-indigo-400 mx-auto animate-bounce" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">Stage II Access Restricted</h3>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Automated client reminders settings and mass CRON Sweeps require the **Pro-Reconciler** or high-end plan.
                  </p>
                  <button
                    onClick={() => {
                      setCurrentTier(2);
                      fetchAllData();
                    }}
                    className="px-6 py-3 text-[10px] uppercase tracking-widest rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold bounce-spring bounce-btn cursor-pointer"
                  >
                    Upgrade to Tier II ($149)
                  </button>
                </div>
              ) : (
                reminderConfig && (
                  <ReminderSettings
                    config={reminderConfig}
                    history={reminderHistory}
                    onSaveConfig={handleSaveReminderConfig}
                    onTriggerAutoSweep={handleTriggerSweep}
                    sweepResponse={sweepResponse}
                  />
                )
              )
            )}

            {/* Panel 5: AI Copilot Room with Tier Guard */}
            {activeTab === 'ai-copilot' && (
              currentTier < 3 ? (
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl max-w-3xl mx-auto p-8 md:p-12 space-y-10 relative overflow-hidden" id="ai-marketing-showcase">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
                  <div className="absolute -top-3 left-6 px-2.5 py-0.5 bg-zinc-900 border border-zinc-800 text-[8px] font-mono tracking-widest text-zinc-400 rounded-sm">
                    AI ASSISTANT SETUP
                  </div>

                  <div className="text-center space-y-4 max-w-xl mx-auto">
                    <div className="inline-flex p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl text-blue-400">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-light tracking-tight text-white uppercase font-sans">
                      Unleash the FLOWT AI Assistant
                    </h2>
                    <p className="text-xs text-zinc-400 font-light leading-relaxed">
                      Connect your active ledger directly to our secure, server-side Gemini 3.5 model to draft outstanding reminders, analyze credit balances, and answer ledger questions.
                    </p>
                  </div>

                  {/* Feature Matrix Bento */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="p-5 border border-zinc-900/80 bg-zinc-950/60 rounded-xl space-y-2 hover:border-blue-500/20 transition-all duration-300">
                      <h4 className="text-[10px] uppercase font-mono tracking-wider text-blue-400 font-bold">Ledger Integration</h4>
                      <p className="text-xs text-zinc-400 font-light leading-relaxed">
                        Reads active invoice indices, client profiles, and historical banking payments securely.
                      </p>
                    </div>

                    <div className="p-5 border border-zinc-900/80 bg-zinc-950/60 rounded-xl space-y-2 hover:border-blue-500/20 transition-all duration-300">
                      <h4 className="text-[10px] uppercase font-mono tracking-wider text-blue-400 font-bold">Smart Outreach Drafts</h4>
                      <p className="text-xs text-zinc-400 font-light leading-relaxed">
                        Generate professional outstanding overdue notices, specific Grace Period options, and client email drafts.
                      </p>
                    </div>                     <div className="p-5 border border-zinc-900/80 bg-zinc-950/60 rounded-xl space-y-2 hover:border-blue-500/20 transition-all duration-300">
                      <h4 className="text-[10px] uppercase font-mono tracking-wider text-blue-400 font-bold">Invoicing Insights</h4>
                      <p className="text-xs text-zinc-400 font-light leading-relaxed">
                        Identify account liabilities, group outstanding balances, and forecast cashflow trends.
                      </p>
                    </div>
                  </div>

                  {/* Upgrade Action bar */}
                  <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left space-y-1">
                      <div className="text-xs text-white font-mono uppercase tracking-wider font-semibold">Tier III Complete access</div>
                      <p className="text-[10px] text-zinc-500">Unlocks immediate conversational analysis and direct ledger syncing.</p>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentTier(3);
                        fetchAllData();
                      }}
                      className="px-6 py-3 text-xs uppercase tracking-widest rounded-sm bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold hover:scale-[1.03] hover:ring-1 hover:ring-blue-400 active:scale-[0.98] transition-all duration-300 cursor-pointer"
                    >
                      Authorize Tier III ($299/mo)
                    </button>
                  </div>
                </div>
              ) : (
                <SmeAiCopilot invoices={invoices} bankTransactions={bankTransactions} />
              )
            )}
          </div>
        )}
      </main>

      {/* Footer Branding Credit */}
      <footer className="py-12 text-center text-[10px] text-zinc-650 tracking-widest uppercase font-mono mt-12 opacity-80">
        FLOWT — {new Date().getFullYear()}
      </footer>

      {/* Modal A: Invoice Form Modal */}
      <InvoiceFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setInvoiceToEdit(null);
        }}
        onSubmit={handleCreateOrUpdateInvoice}
        invoiceToEdit={invoiceToEdit}
      />

      {/* Modal B: Stripe Simulation Checkout */}
      <StripeSimulationModal
        invoice={selectedPaymentInvoice}
        onClose={() => setSelectedPaymentInvoice(null)}
        onSuccess={handleStripePaymentComplete}
      />
    </div>
    </>
  );
}
