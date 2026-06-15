import React, { useState } from 'react';
import { BankTransaction, Invoice, Currency } from '../types.js';
import { formatAmount } from '../utils.js';
import { 
  Plus, CheckSquare, Sparkles, RefreshCcw, ArrowRight, 
  HelpCircle, Search, AlertCircle, ShieldAlert
} from 'lucide-react';

interface BankReconciliationProps {
  transactions: BankTransaction[];
  invoices: Invoice[];
  onReconcile: (txId: string, invoiceId: string) => void;
  onUnreconcile: (txId: string) => void;
  onSimulateIncomingTx: (txData: any) => void;
  loading: boolean;
}

export default function BankReconciliation({
  transactions,
  invoices,
  onReconcile,
  onUnreconcile,
  onSimulateIncomingTx,
  loading
}: BankReconciliationProps) {
  // Simulator form fields
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [description, setDescription] = useState('');
  const [txSearch, setTxSearch] = useState('');
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  // Auto match helper
  const [suggestedMatches, setSuggestedMatches] = useState<Record<string, Invoice[]>>({});
  const [successAnimation, setSuccessAnimation] = useState<string | null>(null);

  // Handle triggering dynamic suggestions
  const findPerfectMatchesForTx = (tx: BankTransaction): Invoice[] => {
    return invoices.filter(inv => 
      inv.status !== 'Paid' && 
      inv.currency === tx.currency && 
      Math.abs(inv.amount - tx.amount) < 0.01 // Close matching decimals
    );
  };

  // Run bulk automatcher matching algorithm
  const runAutoMatchingAlgorithm = () => {
    const matches: Record<string, Invoice[]> = {};
    let matchedAny = false;

    transactions.forEach(tx => {
      if (tx.status === 'Unreconciled') {
        const matchingInvoices = findPerfectMatchesForTx(tx);
        if (matchingInvoices.length > 0) {
          matches[tx.id] = matchingInvoices;
          matchedAny = true;
        }
      }
    });

    if (!matchedAny) {
      alert('No perfect matches found. Try creating or modifying an invoice to match existing transactions!');
      return;
    }

    setSuggestedMatches(matches);
  };

  // Handle adding simulated bank wire
  const handleSimulateWire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || !description.trim()) {
      alert('Please fill out a valid transaction amount and deposit description.');
      return;
    }

    onSimulateIncomingTx({
      amount: parseFloat(amount),
      currency,
      description: `DIRECT WIRE: ${description.toUpperCase()}`
    });

    setAmount('');
    setDescription('');
  };

  // Reconcile trigger wrapper
  const handleReconcileClick = (txId: string, invId: string) => {
    setSuccessAnimation(txId);
    setTimeout(() => {
      onReconcile(txId, invId);
      setSuccessAnimation(null);
      // Remove from suggestions
      const nextSuggestions = { ...suggestedMatches };
      delete nextSuggestions[txId];
      setSuggestedMatches(nextSuggestions);
    }, 700);
  };

  const selectedTx = transactions.find(t => t.id === selectedTxId);
  const selectedTxMatches = selectedTx ? findPerfectMatchesForTx(selectedTx) : [];

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(txSearch.toLowerCase()) ||
    t.reference.toLowerCase().includes(txSearch.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="bank-reconciliation-view">
      
      {/* Left Column: Bank Transactions Feed LEDGER */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        
        {/* Ledger Control Header */}
        <div className="border border-zinc-900 bg-zinc-950/40 p-5 rounded-2xl bounce-spring">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Transaction Feed
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Live bank feed integration.</p>
            </div>
            <button
              type="button"
              onClick={runAutoMatchingAlgorithm}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full bg-indigo-600 hover:bg-indigo-500 text-white bounce-spring bounce-btn shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" /> Run Matcher
            </button>
          </div>

          {/* Search Ledger */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search deposits..."
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-zinc-950 border border-zinc-900 text-zinc-100 placeholder-zinc-550 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Transactions List */}
        <div id="reconciliation-ledger-list" className="border border-zinc-900 bg-zinc-950/40 rounded-2xl overflow-hidden bounce-spring">
          <div className="p-4 bg-black/45 border-b border-zinc-900 flex justify-between items-center text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
            <span>TX / Date</span>
            <span className="text-right">Balance</span>
          </div>

          <div className="divide-y divide-zinc-900/60 max-h-[480px] overflow-y-auto">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-xs text-zinc-500 uppercase tracking-widest font-mono">
                No transactions logged.
              </div>
            ) : (
              filteredTransactions.map(tx => {
                const perfectMatches = findPerfectMatchesForTx(tx);
                const isSelected = selectedTxId === tx.id;
                const hasSuggestions = suggestedMatches[tx.id] !== undefined;
                const isAnimate = successAnimation === tx.id;

                return (
                  <div
                    key={tx.id}
                    onClick={() => tx.status === 'Unreconciled' && setSelectedTxId(isSelected ? null : tx.id)}
                    className={`p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all duration-300 cursor-pointer ${
                      isAnimate ? 'bg-indigo-950/30 scale-[0.98]' : ''
                    } ${
                      isSelected ? 'bg-zinc-950 border-l-4 border-indigo-500' : 'hover:bg-zinc-900/10'
                    }`}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-zinc-205 uppercase break-all">{tx.description}</span>
                        {tx.status === 'Reconciled' ? (
                          <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-900/30">
                            Matched
                          </span>
                        ) : (
                          <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-500 border border-amber-900/30">
                            Unreconciled
                          </span>
                        )}
                        {tx.status === 'Unreconciled' && perfectMatches.length > 0 && !hasSuggestions && (
                          <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-950 text-purple-400 border border-purple-900/35 animate-pulse">
                            Match Found
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 text-[11px] text-zinc-500 font-mono">
                        <span>Date: {tx.date}</span>
                        <span>Ref: {tx.reference}</span>
                      </div>

                      {/* Display suggested matches after running Bulk Matcher */}
                      {hasSuggestions && tx.status === 'Unreconciled' && (
                        <div className="mt-3 p-3 bg-indigo-950/20 border border-indigo-900/50 rounded-xl text-xs" onClick={(e) => e.stopPropagation()}>
                          <div className="text-zinc-300 flex items-center gap-1 font-bold uppercase tracking-widest text-[9px] mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Best Match:
                          </div>
                          {suggestedMatches[tx.id].map(inv => (
                            <div key={inv.id} className="flex items-center justify-between gap-4 mt-1 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-900">
                              <span className="font-mono text-zinc-300 text-[11px]">{inv.invoiceNumber} — {inv.clientName}</span>
                              <button
                                type="button"
                                onClick={() => handleReconcileClick(tx.id, inv.id)}
                                className="px-3 py-1 text-[9px] uppercase tracking-wider font-extrabold bg-indigo-600 text-white rounded-full hover:bg-indigo-500 bounce-spring bounce-btn"
                              >
                                Match & Pay
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-right flex sm:flex-col items-end gap-2 sm:gap-1 justify-between w-full sm:w-auto">
                      <span className={`text-sm font-black font-mono ${tx.status === 'Reconciled' ? 'text-zinc-650 line-through' : 'text-zinc-100'}`}>
                        {formatAmount(tx.amount, tx.currency)}
                      </span>
                      {tx.status === 'Reconciled' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnreconcile(tx.id);
                          }}
                          className="text-[10px] text-rose-450 hover:text-rose-400 underline font-mono select-none"
                        >
                          Unmatch
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Interaction Workspaces */}
      <div className="lg:col-span-5 flex flex-col space-y-6">
        
        {/* Workspace A: Manual Matching Resolver */}
        <div id="manual-matching-card" className="border border-zinc-900 bg-zinc-950/40 p-5 rounded-2xl bounce-spring shadow-xl">
          <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-indigo-400" /> Auto Match
          </h3>
          <p className="text-[11px] text-zinc-500 mb-4">Match transactions with invoices.</p>

          {!selectedTx ? (
            <div className="p-10 border border-dashed border-zinc-900 rounded-2xl text-center text-xs text-zinc-650 uppercase tracking-wider font-mono">
              Select a deposit.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-900 text-xs space-y-1.5 font-mono">
                <div className="text-zinc-500 uppercase font-black tracking-widest text-[9px]">Active line</div>
                <div className="text-xs font-bold text-zinc-205 h-8 overflow-hidden uppercase">{selectedTx.description}</div>
                <div className="flex justify-between font-mono text-zinc-400 mt-2 border-t border-zinc-900/60 pt-2">
                  <span>Balance:</span>
                  <span className="text-indigo-400 font-extrabold">{formatAmount(selectedTx.amount, selectedTx.currency)}</span>
                </div>
              </div>

              {/* Matching items options */}
              <div className="space-y-2">
                <label className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Matches Found ({selectedTxMatches.length})</label>
                
                {selectedTxMatches.length === 0 ? (
                  <div className="p-4 bg-amber-950/20 border border-amber-900/30 text-amber-500 rounded-2xl text-[11px] space-y-2">
                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                      <AlertCircle className="w-4 h-4" /> No direct matches found.
                    </div>
                    <p className="leading-relaxed text-zinc-400">
                      There are no unpaid invoices matching <span className="font-bold text-white font-mono">{formatAmount(selectedTx.amount, selectedTx.currency)}</span>. Use Stripe checkout or edit invoice totals.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedTxMatches.map(inv => (
                      <div
                        key={inv.id}
                        onClick={() => handleReconcileClick(selectedTx.id, inv.id)}
                        className="p-3 bg-zinc-950/60 border border-zinc-900/80 hover:border-indigo-500/50 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="font-mono text-[11px] font-bold text-indigo-400">{inv.invoiceNumber}</div>
                          <div className="text-xs font-bold text-zinc-200">{inv.clientName}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">Due: {inv.dueDate}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-white font-mono">{formatAmount(inv.amount, inv.currency)}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Workspace B: Wire Ingress Simulation Form */}
        <div id="simulated-ingress-wire-form" className="border border-zinc-900 bg-zinc-950/40 p-5 rounded-2xl bounce-spring relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-600/5 rounded-full blur-xl pointer-events-none" />
          
          <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-indigo-400" /> Bank Wire simulator
          </h3>
          <p className="text-[11px] text-zinc-500 mb-4">Simulate direct wires instantly.</p>

          <form onSubmit={handleSimulateWire} className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-wider mb-1">Amount</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 4890.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-full bg-zinc-950 border border-zinc-900 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-wider mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="w-full px-2 py-1.5 text-xs rounded-full bg-zinc-950 border border-zinc-900 text-indigo-400 font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="SGD">SGD</option>
                  <option value="JPY">JPY</option>
                  <option value="AUD">AUD</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-wider mb-1">Sender Details</label>
              <input
                type="text"
                required
                placeholder="e.g. SEPA wire transfer"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-full bg-zinc-950 border border-zinc-900 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 text-xs font-bold uppercase tracking-wider rounded-full bg-zinc-950 hover:bg-zinc-900 text-indigo-450 border border-zinc-900 hover:border-indigo-500/30 transition-all flex items-center justify-center gap-1 bounce-spring bounce-btn cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Generate Wire
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
