import React, { useState } from 'react';
import { Invoice, Currency } from '../types.js';
import { formatAmount } from '../utils.js';
import { 
  Search, Filter, Send, Trash2, Edit2, CreditCard, 
  ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Clock, Play
} from 'lucide-react';

interface InvoiceListProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onSendReminder: (id: string) => void;
  onSimulatePayment: (invoice: Invoice) => void;
}

export default function InvoiceList({ 
  invoices, 
  onEdit, 
  onDelete, 
  onSendReminder,
  onSimulatePayment 
}: InvoiceListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Outstanding' | 'Paid' | 'Overdue'>('All');
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  // Filtered List
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = statusFilter === 'All' || inv.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  const toggleExpand = (id: string) => {
    setExpandedInvoiceId(expandedInvoiceId === id ? null : id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/25">
            <CheckCircle className="w-3.5 h-3.5" />
            Paid
          </span>
        );
      case 'Outstanding':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-950/40 text-amber-400 border border-amber-500/25">
            <Clock className="w-3.5 h-3.5" />
            Outstanding
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-950/40 text-rose-400 border border-rose-500/25">
            <AlertTriangle className="w-3.5 h-3.5" />
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
            Draft
          </span>
        );
    }
  };

  return (
    <div id="invoice-manager-card" className="border border-zinc-900 bg-zinc-950/40 rounded-2xl overflow-hidden bounce-spring">
      
      {/* Search and Filters Strip */}
      <div className="p-5 border-b border-zinc-900/50 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search ledger..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-zinc-950 border border-zinc-900 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Tab Filters */}
        <div id="status-filter-tabs" className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-zinc-950 rounded-full border border-zinc-900">
          {(['All', 'Draft', 'Outstanding', 'Paid', 'Overdue'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1 text-[10px] tracking-wider uppercase font-bold rounded-full whitespace-nowrap bounce-spring bounce-tab ${
                statusFilter === tab
                  ? 'bg-zinc-100 text-zinc-950 shadow-md scale-102'
                  : 'text-zinc-500 hover:text-zinc-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid/Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-900 bg-black/45 text-zinc-500 text-[10px] font-mono uppercase tracking-widest">
              <th className="px-6 py-4">Invoice</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4">Due</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-right">Alerts</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/60">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-xs text-zinc-500 uppercase tracking-widest font-mono">
                  Empty feed.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => {
                const isExpanded = expandedInvoiceId === inv.id;
                return (
                  <React.Fragment key={inv.id}>
                    <tr className="hover:bg-zinc-900/15 transition-colors duration-150 cursor-pointer" onClick={() => toggleExpand(inv.id)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-400 select-all">{inv.invoiceNumber}</span>
                          {inv.reconciled && (
                            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-900/40" title="Reconciled via Bank Feed">
                              Matched
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-zinc-200">{inv.clientName}</div>
                        <div className="text-xs text-zinc-500 font-mono">{inv.clientEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatusBadge(inv.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-400 font-mono">
                        {inv.dueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-black text-zinc-100 font-display text-sm">
                        {formatAmount(inv.amount, inv.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        {inv.remindersSent > 0 ? (
                          <div className="flex flex-col items-end">
                            <span className="text-purple-400 font-bold">{inv.remindersSent} Sent</span>
                            <span className="text-[9px] text-zinc-500 font-mono">Last: {inv.lastReminderDate}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-650 font-mono">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end items-center gap-2">
                          {/* Stripe Payment Trigger */}
                          {inv.status !== 'Paid' && (
                            <button
                              type="button"
                              onClick={() => onSimulatePayment(inv)}
                              title="Process Stripe Payment"
                              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-indigo-600 text-white hover:bg-indigo-500 bounce-spring bounce-btn flex items-center gap-1 shadow"
                            >
                              <CreditCard className="w-3 h-3" />
                              Pay
                            </button>
                          )}

                          {/* Send Reminder manually */}
                          {inv.status !== 'Paid' && inv.status !== 'Draft' && (
                            <button
                              type="button"
                              onClick={() => onSendReminder(inv.id)}
                              title="Send Reminder"
                              className="p-1 px-2 text-[10px] font-bold uppercase text-zinc-400 hover:text-purple-400 border border-zinc-900 bg-zinc-950 rounded-full bounce-spring bounce-btn"
                            >
                              <Send className="w-3 h-3" />
                            </button>
                          )}

                          {/* Edit / Draft controller */}
                          <button
                            type="button"
                            onClick={() => onEdit(inv)}
                            title="Edit"
                            className="p-1 px-2 text-[10px] font-bold uppercase text-zinc-400 hover:text-amber-400 border border-zinc-900 bg-zinc-950 rounded-full bounce-spring bounce-btn"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => onDelete(inv.id)}
                            title="Delete"
                            className="p-1 px-2 text-[10px] font-bold uppercase text-rose-500/80 hover:text-rose-400 border border-zinc-900 bg-zinc-950 rounded-full bounce-spring bounce-btn"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          {/* Expand dropdown info */}
                          <button
                            type="button"
                            onClick={() => toggleExpand(inv.id)}
                            className="p-1 text-zinc-500 hover:text-zinc-200 transition-all bounce-spring bounce-tab"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Collapsible Expansion Panel */}
                    {isExpanded && (
                      <tr className="bg-zinc-950/20" id={`expanded-drawer-${inv.id}`}>
                        <td colSpan={7} className="px-6 py-4">
                          <div className="border border-zinc-900 bg-black/30 rounded-2xl p-4 text-xs font-mono">
                            <div className="flex flex-col sm:flex-row sm:justify-between border-b border-zinc-900/60 pb-3 mb-3 gap-2">
                              <div>
                                <h5 className="text-zinc-400 font-black mb-1 uppercase tracking-widest text-[9px]">Details</h5>
                                <p className="text-zinc-550">Created: <span className="text-zinc-400">{inv.issueDate}</span></p>
                                <p className="text-zinc-550">Client Ref: <span className="text-zinc-400">{inv.clientEmail}</span></p>
                              </div>
                              <div className="text-right sm:text-right">
                                <h5 className="text-zinc-400 font-black mb-1 uppercase tracking-widest text-[9px]">Metadata</h5>
                                <p className="text-zinc-550">
                                  Stripe ID:{' '}
                                  <span className="text-indigo-400 select-all">
                                    {inv.stripeSessionId || 'Uninitialized'}
                                  </span>
                                </p>
                                <p className="text-zinc-550">
                                  Charge ID:{' '}
                                  <span className="text-indigo-400 select-all">
                                    {inv.stripePaymentId || '(Unpaid)'}
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* Item Breakdowns */}
                            <div>
                              <h6 className="font-semibold text-zinc-500 mb-2 uppercase tracking-widest text-[9px]">Items</h6>
                              <div className="space-y-1 max-w-2xl">
                                {inv.items.map((item) => (
                                  <div key={item.id} className="flex justify-between items-center text-[10px] p-2 bg-zinc-950/50 rounded-xl border border-zinc-900">
                                    <div className="flex gap-4">
                                      <span className="text-indigo-400 font-bold">×{item.quantity}</span>
                                      <span className="text-zinc-350">{item.description}</span>
                                    </div>
                                    <div className="flex gap-6">
                                      <span className="text-zinc-650">Rate: {formatAmount(item.price, inv.currency)}</span>
                                      <span className="text-zinc-200 font-bold">{formatAmount(item.quantity * item.price, inv.currency)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
