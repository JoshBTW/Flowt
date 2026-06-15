import React, { useState, useEffect } from 'react';
import { ReminderConfig, ReminderHistoryItem } from '../types.js';
import { formatAmount } from '../utils.js';
import { 
  Bell, Save, Play, Clock, Sparkles, Send, 
  Info, Mail, CheckCircle2, FileText, ChevronRight
} from 'lucide-react';

interface ReminderSettingsProps {
  config: ReminderConfig;
  history: ReminderHistoryItem[];
  onSaveConfig: (newConfig: ReminderConfig) => void;
  onTriggerAutoSweep: () => void;
  sweepResponse: { count: number; items: ReminderHistoryItem[] } | null;
}

export default function ReminderSettings({
  config,
  history,
  onSaveConfig,
  onTriggerAutoSweep,
  sweepResponse
}: ReminderSettingsProps) {
  const [enabled, setEnabled] = useState(true);
  const [daysBeforeDue, setDaysBeforeDue] = useState(3);
  const [daysAfterOverdue, setDaysAfterOverdue] = useState(2);
  const [autoSend, setAutoSend] = useState(true);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (config) {
      setEnabled(config.enabled);
      setDaysBeforeDue(config.daysBeforeDue);
      setDaysAfterOverdue(config.daysAfterOverdue);
      setAutoSend(config.autoSend);
      setEmailTemplate(config.emailTemplate);
    }
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      enabled,
      daysBeforeDue,
      daysAfterOverdue,
      autoSend,
      emailTemplate
    });
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="reminders-settings-section">
      
      {/* Left Column: Template & Schedule Configuration */}
      <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4 border border-zinc-900 bg-zinc-950/40 p-6 rounded-2xl bounce-spring relative">
        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2 flex items-center gap-1.5 border-b border-zinc-900 pb-3">
          <Bell className="w-4 h-4 text-indigo-400" /> Reminder Settings
        </h3>

        {/* Toggle Option */}
        <div className="flex items-center justify-between p-3.5 bg-zinc-950 rounded-xl border border-zinc-900">
          <div>
            <h4 className="text-xs font-bold text-zinc-150 uppercase tracking-wide">Ledger Automation</h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">Toggle automatic alerts.</p>
          </div>
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              enabled ? 'bg-indigo-600' : 'bg-zinc-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Configurations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1">Grace Alerts</label>
            <div className="flex items-center gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 text-xs font-mono">
              <span className="text-zinc-400 text-xs shrink-0">Send</span>
              <input
                type="number"
                min={0}
                required
                disabled={!enabled}
                value={daysBeforeDue}
                onChange={(e) => setDaysBeforeDue(parseInt(e.target.value) || 0)}
                className="w-12 text-center bg-black border border-zinc-900 text-white py-1 rounded-full focus:outline-none focus:border-indigo-500 font-bold"
              />
              <span className="text-zinc-500 text-[11px] shrink-0">days before due</span>
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1">Overdue Alerts</label>
            <div className="flex items-center gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 text-xs font-mono">
              <span className="text-zinc-400 text-xs shrink-0">Send every</span>
              <input
                type="number"
                min={1}
                required
                disabled={!enabled}
                value={daysAfterOverdue}
                onChange={(e) => setDaysAfterOverdue(parseInt(e.target.value) || 1)}
                className="w-12 text-center bg-black border border-zinc-900 text-white py-1 rounded-full focus:outline-none focus:border-indigo-500 font-bold"
              />
              <span className="text-zinc-500 text-[11px] shrink-0">days past due</span>
            </div>
          </div>
        </div>

        {/* Email Templates Textarea */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" /> Email Template
            </label>
            <span className="text-[9px] text-zinc-650 font-mono leading-none">Placeholders Active</span>
          </div>
          <textarea
            rows={7}
            required
            disabled={!enabled}
            value={emailTemplate}
            onChange={(e) => setEmailTemplate(e.target.value)}
            placeholder="Write template..."
            className="w-full p-3 font-mono text-xs rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
          
          {/* Legend/Tokens */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-900 text-zinc-500">{"{{clientName}}"}</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-900 text-zinc-500">{"{{invoiceNumber}}"}</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-900 text-zinc-500">{"{{dueDate}}"}</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-900 text-zinc-500">{"{{amount}}"}</span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <p className="text-[10px] text-zinc-500 font-mono leading-none">Syncs instantly.</p>
          </div>
          <button
            type="submit"
            disabled={!enabled}
            className="inline-flex items-center gap-1.5 px-5 h-9 text-xs font-bold uppercase tracking-wider rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-900 disabled:text-zinc-700 text-white transition-all bounce-spring bounce-btn cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> 
            {isSuccess ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Right Column: Engine Activator, Cron sweep, Historial Dispatch Ledger */}
      <div className="lg:col-span-5 flex flex-col space-y-4">
        
        {/* Sweep Sandbox */}
        <div id="simulated-cron-card" className="border border-zinc-900 bg-zinc-950/40 p-5 rounded-2xl bounce-spring relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Play className="w-4 h-4 text-emerald-400" /> Cron Simulator
          </h3>
          <p className="text-[11px] text-zinc-500 mb-3.5 font-mono">
            Run periodic client checks instantly.
          </p>

          <button
            type="button"
            onClick={onTriggerAutoSweep}
            className="w-full py-2 text-xs font-mono font-bold uppercase rounded-full bg-zinc-950 border border-zinc-900 hover:border-indigo-500/30 text-indigo-400 flex items-center justify-center gap-1.5 bounce-spring bounce-btn cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" /> Run Cron
          </button>

          {/* Trigger Alert Box */}
          {sweepResponse && (
            <div className="mt-3.5 p-3 rounded-xl border text-xs bg-indigo-950/20 border-indigo-500/20 animate-fade-in space-y-1.5">
              <div className="font-bold text-indigo-300 flex items-center justify-between">
                <span>Cron Output</span>
                <span className="text-[10px] bg-indigo-900 px-1.5 text-white rounded-full uppercase tracking-wider">OK</span>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Checks complete. Sent email alerts to {sweepResponse.count} clients.
              </p>
              {sweepResponse.count > 0 && (
                <div className="mt-2 text-[10px] text-zinc-500 divide-y divide-zinc-900/60 bg-black/40 rounded-xl p-2 font-mono">
                  {sweepResponse.items.slice(0, 3).map(it => (
                    <div key={it.id} className="py-1 flex justify-between">
                      <span>{it.invoiceNumber} alert</span>
                      <span className="text-indigo-400">Sent</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Historical Logs summary */}
        <div id="reconciliation-history-log" className="border border-zinc-900 bg-zinc-950/20 p-5 rounded-2xl flex-1 bounce-spring">
          <h4 className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-zinc-500" /> Outbox Log
          </h4>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {history.length === 0 ? (
              <div className="text-center py-6 text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
                Outbox clear.
              </div>
            ) : (
              history.map(item => (
                <div key={item.id} className="p-3 bg-black/40 flex items-center justify-between rounded-xl border border-zinc-900/60 gap-2 font-mono text-xs bounce-spring hover:border-zinc-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-indigo-400 select-all">{item.invoiceNumber}</span>
                      <ChevronRight className="w-2.5 h-2.5 text-zinc-700" />
                      <span className="text-[10px] text-zinc-500 truncate max-w-[120px]">{item.clientEmail}</span>
                    </div>
                    <div className="text-[9px] text-zinc-600">
                      {new Date(item.sentAt).toLocaleString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-black text-zinc-300">
                      {formatAmount(item.amount, item.currency)}
                    </span>
                    <div className="text-[8px] uppercase tracking-wider font-extrabold text-indigo-500 mt-0.5">
                      {item.type.replace('_Notice', '').replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
