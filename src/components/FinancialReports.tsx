import React, { useState } from 'react';
import { Invoice, Currency } from '../types.js';
import { calculateStats, formatAmount, convertToUSD, CURRENCY_SYMBOLS, EXCHANGE_RATES } from '../utils.js';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  TrendingUp, BarChart2, PieChart, Coins, Globe, Landmark, DollarSign
} from 'lucide-react';

interface FinancialReportsProps {
  invoices: Invoice[];
}

export default function FinancialReports({ invoices }: FinancialReportsProps) {
  const [reportBaseCurrency, setReportBaseCurrency] = useState<Currency>('USD');
  const stats = calculateStats(invoices);

  // Convert month-on-month amounts to report base currency
  const convertedMonthlyRevenue = stats.monthlyRevenue.map(data => {
    const usdAmount = data.amount;
    const baseAmount = usdAmount / EXCHANGE_RATES[reportBaseCurrency];
    return {
      month: data.month,
      Revenue: Math.round(baseAmount)
    };
  });

  // Calculate currency balances in base currency values for comparative breakdown
  const currencyCompositionData = Object.keys(EXCHANGE_RATES).map((cur) => {
    const currency = cur as Currency;
    let paid = 0;
    let outstanding = 0;
    let overdue = 0;

    invoices.forEach(inv => {
      if (inv.currency === currency) {
        if (inv.status === 'Paid') paid += inv.amount;
        else if (inv.status === 'Outstanding') outstanding += inv.amount;
        else if (inv.status === 'Overdue') overdue += inv.amount;
      }
    });

    const totalInUSD = convertToUSD(paid, currency);
    const convertedTotal = totalInUSD / EXCHANGE_RATES[reportBaseCurrency];

    return {
      currency,
      'Paid': Math.round(convertToUSD(paid, currency) / EXCHANGE_RATES[reportBaseCurrency]),
      'Outstanding': Math.round(convertToUSD(outstanding, currency) / EXCHANGE_RATES[reportBaseCurrency]),
      'Overdue': Math.round(convertToUSD(overdue, currency) / EXCHANGE_RATES[reportBaseCurrency]),
      'Raw Combined Value': convertedTotal
    };
  }).filter(d => d['Raw Combined Value'] > 0);

  const customTooltipStyle = {
    backgroundColor: '#09090b',
    border: '1px solid #27272a',
    borderRadius: '8px',
    color: '#ffffff',
    fontFamily: 'monospace',
    fontSize: '11px'
  };

  return (
    <div className="space-y-6" id="sme-financial-reporting-dashboard">
      
      {/* Settings bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-zinc-900 bg-zinc-950/40 rounded-2xl gap-4 bounce-spring">
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-indigo-400" /> Currency Reports
          </h3>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Real-time rates conversion.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Reporting Base:</span>
          <select
            value={reportBaseCurrency}
            onChange={(e) => setReportBaseCurrency(e.target.value as Currency)}
            className="px-3 py-1.5 bg-zinc-950 w-24 border border-zinc-900 rounded-full text-xs font-bold text-indigo-400 focus:outline-none focus:border-indigo-500"
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

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: Revenue (flow) Area chart */}
        <div className="border border-zinc-900 bg-zinc-950/40 p-5 rounded-2xl flex flex-col justify-between bounce-spring">
          <div className="mb-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Revenue Trend
            </h4>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Aggregate paid revenue trend ({reportBaseCurrency}).</p>
          </div>

          <div className="h-[280px] w-full text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={convertedMonthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#52525b" strokeWidth={1} tickLine={false} />
                <YAxis stroke="#52525b" strokeWidth={1} tickLine={false} tickFormatter={(val) => CURRENCY_SYMBOLS[reportBaseCurrency] + val} />
                <Tooltip 
                   contentStyle={customTooltipStyle}
                  formatter={(val) => [formatAmount(val as number, reportBaseCurrency), 'Revenue']}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Comparative currency breakdown stacked column chart */}
        <div className="border border-zinc-900 bg-zinc-950/40 p-5 rounded-2xl flex flex-col justify-between bounce-spring">
          <div className="mb-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-indigo-400" /> Liquidity Balance
            </h4>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Status by currency ({reportBaseCurrency}).</p>
          </div>

          <div className="h-[280px] w-full text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currencyCompositionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="currency" stroke="#52525b" strokeWidth={1} tickLine={false} />
                <YAxis stroke="#52525b" strokeWidth={1} tickLine={false} tickFormatter={(val) => CURRENCY_SYMBOLS[reportBaseCurrency] + val} />
                <Tooltip 
                  contentStyle={customTooltipStyle}
                  formatter={(val, name) => [formatAmount(val as number, reportBaseCurrency), name]}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px', fontFamily: 'monospace' }} />
                <Bar dataKey="Paid" stackId="status" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Outstanding" stackId="status" fill="#eab308" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Overdue" stackId="status" fill="#f43f5e" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SME Foreign Currency Index (FX Indexes) */}
      <div id="exchange-rate-visualizer" className="border border-zinc-900 bg-zinc-950/40 p-5 rounded-2xl relative bounce-spring">
        <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-indigo-400" /> FX Rates
        </h4>
        <p className="text-[11px] text-zinc-500 mb-4 font-mono">
          Daily conversion ratios relative to USD ($1.00 base).
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(EXCHANGE_RATES).map(([cur, rate]) => (
            <div key={cur} className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl flex flex-col justify-between relative overflow-hidden font-mono text-xs bounce-spring hover:border-zinc-805">
              <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-bold">{cur}</span>
              <div className="flex items-baseline mt-1.5 gap-0.5">
                <span className="text-white font-black text-sm">{(1 / rate).toFixed(4)}</span>
                <span className="text-[9px] text-zinc-550">/{reportBaseCurrency}</span>
              </div>
              <span className="text-[8px] text-zinc-600 mt-1 uppercase tracking-widest font-bold">Live</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
