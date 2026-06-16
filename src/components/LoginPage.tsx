import React, { useState } from 'react';
import { ArrowLeft, Key, Shield, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { FlowtLogo } from './LandingPage.js';

interface LoginPageProps {
  onBack: () => void;
  onLoginSuccess: (tier: 1 | 2 | 3, customKey: string) => void;
}

export default function LoginPage({ onBack, onLoginSuccess }: LoginPageProps) {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const keyTiers = [
    { key: 'FLOWT-CORE-99', name: 'Tier I Base', tier: 1 as const },
    { key: 'FLOWT-RECON-149', name: 'Tier II Pro', tier: 2 as const },
    { key: 'FLOWT-AI-299', name: 'Tier III AI Copilot', tier: 3 as const },
  ];

  const handleQuickFill = (key: string) => {
    setPasskey(key);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = passkey.trim().toUpperCase();

    if (!trimmed) {
      setError('Please enter your license key.');
      return;
    }

    // Match tier
    let targetTier: 1 | 2 | 3 = 1;
    let tierName = 'Tier I Invoicing Core';
    if (trimmed.includes('299') || trimmed.includes('AI') || trimmed === 'FLOWT-AI-299') {
      targetTier = 3;
      tierName = 'Tier III Copilot Complete';
    } else if (trimmed.includes('149') || trimmed.includes('RECON') || trimmed === 'FLOWT-RECON-149') {
      targetTier = 2;
      tierName = 'Tier II Pro Reconciliation';
    }

    setSuccessMsg(`Access Granted: logged in with ${tierName}`);
    setError('');

    setTimeout(() => {
      onLoginSuccess(targetTier, trimmed);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between font-sans relative" id="flowt-login-page">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.01),transparent_50%)] pointer-events-none" />

      {/* Header */}
      <header className="px-6 md:px-12 h-20 flex items-center justify-between border-b border-zinc-900/40 bg-zinc-950/70 backdrop-blur-md">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-xs font-light text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 duration-200 stroke-[1.5]" />
          Back to overview
        </button>
        <div className="flex items-center gap-2 mr-4">
          <FlowtLogo className="w-7 h-7" />
          <span className="text-xs tracking-wider font-light uppercase text-zinc-400">FLOWT</span>
        </div>
      </header>

      {/* Form Area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 bg-zinc-950 border border-zinc-900 p-8 rounded-lg relative">
          <div className="absolute -top-3 right-5 px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-sm text-[8px] font-mono tracking-widest text-zinc-400">
            SECURE PORTAL
          </div>

          <div className="space-y-2 text-center">
            <div className="inline-flex p-3 bg-zinc-900 border border-zinc-800 rounded-sm">
              <Key className="w-5 h-5 text-zinc-300 stroke-[1.5]" />
            </div>
            <h1 className="text-xl font-light tracking-widest text-white uppercase">License Authentication</h1>
            <p className="text-xs text-zinc-400 font-light max-w-xs mx-auto">
              Please enter your license key to access your secure invoice and bank reconciliation workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="signature-passkey" className="block text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                Product License Key
              </label>
              <input
                id="signature-passkey"
                type="text"
                placeholder="e.g. FLOWT-AI-299"
                value={passkey}
                onChange={(e) => {
                  setPasskey(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-sm text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 tracking-wider font-mono uppercase text-center transition-all focus:ring-1 focus:ring-zinc-800"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400 text-center font-mono">
                {error}
              </p>
            )}

            {successMsg && (
              <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-mono">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 text-xs font-light tracking-widest uppercase rounded-sm bg-zinc-100 hover:bg-white text-zinc-950 border border-transparent hover:border-zinc-900 transition-all cursor-pointer flex items-center justify-center gap-2 font-medium"
            >
              Authorize Console <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          </form>

          {/* Quick Keys Preview matrix */}
          <div className="pt-4 border-t border-zinc-900 space-y-3">
            <span className="block text-[9px] font-mono tracking-wider text-zinc-500 uppercase text-center">
              Available Signature Key Presets
            </span>
            <div className="grid grid-cols-1 gap-2">
              {keyTiers.map((t) => (
                <button
                  key={t.key}
                  onClick={() => handleQuickFill(t.key)}
                  className={`p-2.5 rounded-sm bg-zinc-900/30 border text-left transition-all font-mono flex items-center justify-between text-xs cursor-pointer group ${
                    passkey.toUpperCase() === t.key 
                      ? 'border-zinc-400 text-white bg-zinc-900/70' 
                      : 'border-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-light text-zinc-500 tracking-tight">{t.name}</span>
                    <span className="font-semibold tracking-wider text-zinc-200 mt-0.5">{t.key}</span>
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 border border-zinc-850 px-2 py-0.5 rounded-sm group-hover:border-zinc-700 group-hover:text-zinc-300">
                    Use Key
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-[9px] text-zinc-600 font-mono uppercase tracking-widest border-t border-zinc-900/40 bg-zinc-950">
        <Shield className="w-3.5 h-3.5 inline mr-1 text-zinc-500 stroke-[1.5]" /> SSL CRYPTOGRAPHIC PORTAL — SAFE HARBOR DECLARED
      </footer>
    </div>
  );
}
