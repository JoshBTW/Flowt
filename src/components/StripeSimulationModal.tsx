import React, { useState } from 'react';
import { Invoice } from '../types.js';
import { formatAmount } from '../utils.js';
import { X, CreditCard, Lock, ShieldCheck, HeartCrack, Loader2, Sparkles } from 'lucide-react';

interface StripeSimulationModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onSuccess: (invoiceId: string, paymentId: string) => void;
}

export default function StripeSimulationModal({
  invoice,
  onClose,
  onSuccess
}: StripeSimulationModalProps) {
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/29');
  const [cvc, setCvc] = useState('424');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!invoice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate payment loading state
    setTimeout(async () => {
      try {
        const res = await fetch('/api/payment-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceId: invoice.id,
            paymentId: `ch_mock_${Math.random().toString(36).substring(2, 9)}`
          })
        });

        if (res.ok) {
          setSuccess(true);
          setTimeout(() => {
            onSuccess(invoice.id, `ch_mock_${Math.random().toString(36).substring(2, 9)}`);
            onClose();
          }, 1500);
        } else {
          alert('Failed to update invoice payment status on server.');
        }
      } catch (err) {
        console.error(err);
        alert('Simulator routing error.');
      } finally {
        setSubmitting(false);
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div id="stripe-checkout-viewport" className="relative w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-2xl shadow-2xl overflow-hidden font-sans bounce-spring">
        
        {/* Top Strip */}
        <div className="flex justify-between items-center bg-[#09090b] border-b border-zinc-900 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-950 border border-indigo-900 rounded-full">
              Stripe
            </span>
            <span className="text-xs font-bold text-zinc-400 font-mono">Secure Gate</span>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white transition-all bounce-spring bounce-btn cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {!success ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Invoice summary info */}
            <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-1">
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Invoiced Amount</span>
              <div className="flex justify-between items-center">
                <span className="text-white font-mono font-bold text-sm">{invoice.invoiceNumber}</span>
                <span className="text-indigo-400 font-black text-lg font-mono">
                  {formatAmount(invoice.amount, invoice.currency)}
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 flex justify-between font-mono">
                <span>Client: {invoice.clientName}</span>
                <span>Billing: {invoice.currency}</span>
              </div>
            </div>

            {/* Payment fields credit card details */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Card Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                  </span>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-zinc-950 border border-zinc-900 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Expiry</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-full bg-zinc-950 border border-zinc-900 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Cvc</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-full bg-zinc-950 border border-zinc-900 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500 font-mono text-center"
                  />
                </div>
              </div>
            </div>

            {/* Security disclaimer and Stripe badges */}
            <div className="flex gap-2.5 items-start p-3 bg-indigo-950/20 border border-indigo-900/50 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed text-zinc-500 font-mono">
                Secure end-to-end SSL encryption.
              </p>
            </div>

            {/* Action submit button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-2.5 rounded-full font-black text-xs uppercase tracking-wider text-white transition-all shadow-md flex items-center justify-center gap-2 bounce-spring bounce-btn cursor-pointer ${
                submitting
                  ? 'bg-zinc-900 text-zinc-650 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/10'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> Paying...
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" /> Pay with Stripe
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="p-8 text-center space-y-4 animate-fade-in font-mono">
            <div className="w-12 h-12 rounded-full bg-indigo-950 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs uppercase font-black text-white tracking-widest">Paid successfully</h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed max-w-sm mx-auto">
                Invoiced status set to Paid. Reconciled instantly.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
