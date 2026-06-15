import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem, Currency } from '../types.js';
import { X, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { formatAmount } from '../utils.js';

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoiceData: any) => void;
  invoiceToEdit?: Invoice | null;
}

export default function InvoiceFormModal({
  isOpen,
  onClose,
  onSubmit,
  invoiceToEdit
}: InvoiceFormModalProps) {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [issueDate, setIssueDate] = useState('2026-06-15');
  const [dueDate, setDueDate] = useState('2026-06-30');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [status, setStatus] = useState<any>('Outstanding');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Consulting & Implementation Services', quantity: 1, price: 1500 }
  ]);

  useEffect(() => {
    if (invoiceToEdit) {
      setClientName(invoiceToEdit.clientName);
      setClientEmail(invoiceToEdit.clientEmail);
      setIssueDate(invoiceToEdit.issueDate);
      setDueDate(invoiceToEdit.dueDate);
      setCurrency(invoiceToEdit.currency);
      setStatus(invoiceToEdit.status);
      setItems(invoiceToEdit.items.length > 0 ? invoiceToEdit.items : [{ id: '1', description: '', quantity: 1, price: 0 }]);
    } else {
      setClientName('');
      setClientEmail('');
      setIssueDate('2026-06-15');
      setDueDate('2026-06-30');
      setCurrency('USD');
      setStatus('Outstanding');
      setItems([{ id: '1', description: 'Consulting & Implementation Services', quantity: 1, price: 1500 }]);
    }
  }, [invoiceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: String(Date.now()), description: '', quantity: 1, price: 0 }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          [field]: field === 'quantity' ? Math.max(1, parseInt(value) || 0) : field === 'price' ? Math.max(0, parseFloat(value) || 0) : value
        };
      }
      return item;
    }));
  };

  const handlePriceBlur = (id: string, val: string) => {
    const cleaned = Math.max(0, parseFloat(val) || 0);
    handleItemChange(id, 'price', cleaned);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim() || items.some(i => !i.description.trim())) {
      alert('Please fill out all client details and item descriptions.');
      return;
    }

    onSubmit({
      clientName,
      clientEmail,
      issueDate,
      dueDate,
      currency,
      status,
      items
    });
    onClose();
  };

  const currenciesList: Currency[] = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'SGD'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div id="invoice-modal-container" className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-2xl shadow-2xl overflow-hidden my-8 bounce-spring">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-900 bg-zinc-900/10">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              {invoiceToEdit ? `Edit ${invoiceToEdit.invoiceNumber}` : 'Draft Invoice'}
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Particulars of client and invoice ledger.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 px-2.5 rounded-full bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white transition-all text-[10px] flex items-center gap-1.5 uppercase font-bold font-mono bounce-spring bounce-btn"
          >
            <X className="w-3.5 h-3.5" /> Close
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto z-10">
          
          {/* Section 1: Client Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1">Client Name</label>
              <input
                type="text"
                required
                placeholder="Inc Corp, LLC"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-4 py-2 text-xs rounded-full bg-zinc-950 border border-zinc-900 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1 font-mono">Email</label>
              <input
                type="email"
                required
                placeholder="billing@client.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-4 py-2 text-xs rounded-full bg-zinc-950 border border-zinc-900 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Section 2: Dates, Currency & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full px-3 py-2 text-xs rounded-full bg-zinc-950 border border-zinc-900 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors font-bold text-indigo-400"
              >
                {currenciesList.map(cur => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1 font-mono">Issue</label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-full bg-zinc-950 border border-zinc-900 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1 font-mono">Due</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-full bg-zinc-950 border border-zinc-900 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
              />
            </div>
            {invoiceToEdit && (
              <div>
                <label className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1 font-mono">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-full bg-zinc-950 border border-zinc-900 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Draft">Draft</option>
                  <option value="Outstanding">Outstanding</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            )}
          </div>

          {/* Section 3: Itemized Ledger Lines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Deliverables</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 px-3 py-1 text-[10px] uppercase tracking-wider rounded-full bg-zinc-900 border border-zinc-900 text-indigo-400 hover:text-indigo-300 transition-all font-extrabold bounce-spring bounce-btn cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> + Add Item
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {items.map((item, index) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      placeholder="Item details..."
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-full bg-zinc-950 border border-zinc-900 text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="w-16">
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="Qty"
                      title="Quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded-full bg-zinc-950 border border-zinc-900 text-zinc-200 text-center focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      required
                      min={0}
                      step="any"
                      placeholder="Rate"
                      title="Rate per Unit"
                      value={item.price === 0 ? '' : item.price}
                      onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                      onBlur={(e) => handlePriceBlur(item.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-full bg-zinc-950 border border-zinc-900 text-zinc-200 text-right focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={items.length === 1}
                    className="p-1.5 text-zinc-650 hover:text-rose-450 disabled:opacity-30 disabled:hover:text-zinc-650 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Summary / total preview */}
          <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Stripe Enabled
            </div>
            <div className="text-right">
              <span className="text-[9px] text-zinc-550 uppercase font-mono block font-bold tracking-widest">Total</span>
              <span className="text-lg font-black text-white font-mono">
                {formatAmount(calculateTotal(), currency)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="border-t border-zinc-900 pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-all font-mono"
            >
              Cancel
            </button>
            <button
               type="submit"
              className="px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-full bg-indigo-600 text-white hover:bg-indigo-500 shadow-md bounce-spring bounce-btn cursor-pointer"
            >
              {invoiceToEdit ? 'Save Custom' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
