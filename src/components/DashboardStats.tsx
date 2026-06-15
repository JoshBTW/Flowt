import React, { useState } from 'react';
import { Invoice, Currency } from '../types.js';
import { calculateStats, formatAmount, convertToUSD, CURRENCY_SYMBOLS, EXCHANGE_RATES } from '../utils.js';
import { TrendingUp, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface DashboardStatsProps {
  invoices: Invoice[];
}

export default function DashboardStats({ invoices }: DashboardStatsProps) {
  const stats = calculateStats(invoices);
  const [prefCurrency, setPrefCurrency] = useState<Currency>('USD');

  // Convert individual metrics to chosen unified currency
  const getUnifiedTotal = (metric: 'invoiced' | 'paid' | 'outstanding' | 'overdue') => {
    let totalInUSD = 0;
    
    invoices.forEach(inv => {
      const match = 
        (metric === 'invoiced') ||
        (metric === 'paid' && inv.status === 'Paid') ||
        (metric === 'outstanding' && inv.status === 'Outstanding') ||
        (metric === 'overdue' && inv.status === 'Overdue');

      if (match) {
        totalInUSD += convertToUSD(inv.amount, inv.currency);
      }
    });

    // Convert from USD to preferred currency
    const rateToPref = EXCHANGE_RATES[prefCurrency];
    return totalInUSD / rateToPref;
  };

  const activeCurrencies: Currency[] = ['USD', 'EUR', 'GBP', 'SGD', 'JPY'];

  return (
    <div id="dashboard-stats-section" className="space-y-6">
      {/* Aggregation Control Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-zinc-900 bg-zinc-950 rounded-2xl bounce-spring">
        <div>
          <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400">Ledger Aggregation</h2>
          <p className="text-[11px] text-zinc-500 mt-1">Multi-currency valuation estimated on mid-market exchange rates.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-mono uppercase">Base:</span>
          <div className="inline-flex rounded-full p-1 bg-black border border-zinc-900" id="unified-currency-toggle">
            {(['USD', 'EUR', 'GBP', 'SGD'] as Currency[]).map((cur) => (
              <button
                key={cur}
                type="button"
                onClick={() => setPrefCurrency(cur)}
                className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full bounce-spring bounce-tab ${
                  prefCurrency === cur
                    ? 'bg-zinc-100 text-zinc-950 shadow-md'
                    : 'text-zinc-550 hover:text-zinc-250'
                }`}
              >
                {cur}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoiced */}
        <div className="relative overflow-hidden border border-zinc-900 bg-zinc-950/40 p-5 rounded-2xl bounce-spring bounce-hover">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Invoiced</span>
            <div className="p-2 border border-zinc-900 bg-zinc-900 text-purple-400 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight text-white font-display">
              {formatAmount(getUnifiedTotal('invoiced'), prefCurrency)}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1">Total billing ledger</p>
          </div>
        </div>

        {/* Total Paid */}
        <div className="relative overflow-hidden border border-zinc-900 bg-zinc-950/40 p-5 rounded-2xl bounce-spring bounce-hover">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Paid</span>
            <div className="p-2 border border-zinc-900 bg-zinc-900 text-emerald-400 rounded-xl">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight text-emerald-400 font-display">
              {formatAmount(getUnifiedTotal('paid'), prefCurrency)}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1">
              {((getUnifiedTotal('paid') / (getUnifiedTotal('invoiced') || 1)) * 100).toFixed(1)}% recovery
            </p>
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="relative overflow-hidden border border-zinc-900 bg-zinc-950/40 p-5 rounded-2xl bounce-spring bounce-hover">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Outstanding</span>
            <div className="p-2 border border-zinc-900 bg-zinc-900 text-amber-400 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight text-amber-400 font-display">
              {formatAmount(getUnifiedTotal('outstanding'), prefCurrency)}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1">Unreconciled balances</p>
          </div>
        </div>

        {/* Total Overdue */}
        <div className="relative overflow-hidden border border-zinc-900 bg-zinc-950/40 p-5 rounded-2xl bounce-spring bounce-hover">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-600/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Overdue</span>
            <div className="p-2 border border-zinc-900 bg-zinc-900 text-rose-400 rounded-xl">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight text-rose-400 font-display">
              {formatAmount(getUnifiedTotal('overdue'), prefCurrency)}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1">Direct alert target</p>
          </div>
        </div>
      </div>

      {/* Multi-Currency Specific Ledgers */}
      <div id="currency-breakdown-cards" className="border border-zinc-900/60 p-4 rounded-2xl bg-zinc-950/40">
        <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Currency Breakdown</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {activeCurrencies.map(cur => {
            const paid = stats.totalPaid[cur] || 0;
            const outstanding = stats.totalOutstanding[cur] || 0;
            const overdue = stats.totalOverdue[cur] || 0;
            const total = paid + outstanding + overdue;

            if (total === 0) return null;

            return (
              <div key={cur} className="p-3 border border-zinc-900 bg-black/50 rounded-xl flex flex-col justify-between bounce-spring hover:border-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5 mb-2">
                  <span className="text-xs font-bold text-zinc-300">{cur}</span>
                  <span className="text-[9px] text-zinc-500 font-mono">x{EXCHANGE_RATES[cur]}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-500 font-mono">Paid:</span>
                    <span className="text-zinc-300 font-semibold">{formatAmount(paid, cur)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-500 font-mono">Pending:</span>
                    <span className="text-zinc-300 font-semibold">{formatAmount(outstanding, cur)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-500 font-mono">Overdue:</span>
                    <span className="text-rose-400 font-semibold">{formatAmount(overdue, cur)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
