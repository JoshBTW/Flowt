import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, Bot, User, Trash2, ArrowUpRight, ShieldCheck, Mail, 
  FileText, Check, Copy, Settings, Activity, Database, AlertTriangle, 
  ChevronRight, RefreshCw, Code, HelpCircle, Sliders, Wrench,
  Cpu, CheckCircle, Info, Flame, Eye, Terminal, Play, Lock, FileCheck
} from 'lucide-react';
import { Invoice, BankTransaction } from '../types.js';

interface Message {
  role: 'user' | 'model';
  content: string;
  tokensCount?: number;
  timeMs?: number;
}

interface SmeAiCopilotProps {
  invoices: Invoice[];
  bankTransactions: BankTransaction[];
}

export default function SmeAiCopilot({ invoices, bankTransactions }: SmeAiCopilotProps) {
  // Navigation for inner view
  const [activeSubTab, setActiveSubTab] = useState<'playground' | 'drafts' | 'get-code'>('playground');
  
  // Model Parameters & Tuning (Google AI Studio replicas)
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxOutputTokens, setMaxOutputTokens] = useState<number>(2048);
  const [topP, setTopP] = useState<number>(0.95);
  const [topK, setTopK] = useState<number>(40);
  
  // Safety Controls
  const [safetyHarassment, setSafetyHarassment] = useState<string>('BLOCK_MEDIUM_AND_ABOVE');
  const [safetyHateSpeech, setSafetyHateSpeech] = useState<string>('BLOCK_MEDIUM_AND_ABOVE');
  const [safetyDangerous, setSafetyDangerous] = useState<string>('BLOCK_MEDIUM_AND_ABOVE');
  const [safetyExplicit, setSafetyExplicit] = useState<string>('BLOCK_MEDIUM_AND_ABOVE');

  // Custom System Instruction
  const [customSystemInstruction, setCustomSystemInstruction] = useState<string>(
    `You are "FLOWT AI Agent", an expert financial AI adviser and co-pilot for SMEs. 
You have real-time, read-only access to the active SME ledger and transaction feeds.

Goal: Provide mathematically precise, professional financial feedback regarding outstanding balances, reconciliation matches, and general corporate cashflow queries.`
  );
  
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [instructionDraft, setInstructionDraft] = useState(customSystemInstruction);

  // Active Sandbox Dialogue States
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: `👋 **Welcome to the FLOWT AI Assistant Sandbox**\n\nI have successfully mapped your active invoices ledger and bank wire feeds as context. Adjust your system instructions on the left or configure parameters on the right to optimize helper output replies!`,
      tokensCount: 78,
      timeMs: 140
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Outreach configuration states
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [outreachTone, setOutreachTone] = useState<'cordial' | 'assertive' | 'urgent'>('cordial');
  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [draftLoading, setDraftLoading] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState(false);
  
  // Collapsible sections
  const [showLiveContext, setShowLiveContext] = useState(false);
  const [copiedCodeStatus, setCopiedCodeStatus] = useState<string | null>(null);

  // Adjust defaults on load
  useEffect(() => {
    if (invoices.length > 0 && !selectedInvoiceId) {
      const target = invoices.find(inv => inv.status === 'Overdue') || invoices[0];
      setSelectedInvoiceId(target.id);
    }
  }, [invoices, selectedInvoiceId]);

  // Handle Send action
  const handleRunPrompt = async (textToSend: string) => {
    if (!textToSend.trim() || chatLoading) return;

    const updatedMessages = [...messages, { role: 'user' as const, content: textToSend }];
    setMessages(updatedMessages);
    setUserInput('');
    setChatLoading(true);

    const startTime = Date.now();

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          customSystemInstruction,
          temperature,
          maxOutputTokens,
          model: selectedModel
        })
      });

      const latency = Date.now() - startTime;

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [
          ...prev, 
          { 
            role: 'model', 
            content: data.response,
            tokensCount: Math.floor(data.response.length / 4.1) + 40,
            timeMs: latency
          }
        ]);
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

  const handleApplyInstructions = () => {
    setCustomSystemInstruction(instructionDraft);
    setEditingInstructions(false);
    // Add system notification message
    setMessages(prev => [
      ...prev,
      {
        role: 'model',
        content: `🔧 **[System Alert]** System instructions have been adjusted in the current workspace. Subsequent runs will respect these constraints.`,
        tokensCount: 12,
        timeMs: 25
      }
    ]);
  };

  const clearSandbox = () => {
    setMessages([
      {
        role: 'model',
        content: `🔄 **AI Studio Sandbox Resetted.** Previous session history cleared. Use the prompt field below to audit unlinked bank transactions or cashflow summaries.`,
        tokensCount: 22,
        timeMs: 50
      }
    ]);
  };

  // Draft Outreach generation logic
  const handleGenerateOutreach = () => {
    const targetInvoice = invoices.find(inv => inv.id === selectedInvoiceId);
    if (!targetInvoice) return;

    setDraftLoading(true);
    setCopiedStatus(false);

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

Dear Accounts team,

I hope you are doing well.

This is a gentle update that invoice ${targetInvoice.id}, dispatched on ${new Date(targetInvoice.issueDate).toLocaleDateString()}, for ${currencySymbol}${targetInvoice.amount.toLocaleString()} has passed its target payment cycle on ${formattedDate}.

We completely appreciate how fast-paced operations can be, and wanted to re-surface this in case it slipped past. You can clear this invoice securely using our card/ACH gateway link below:
https://flowt.app/pay/${targetInvoice.id}

If you have already processed this bank wire, please feel free to disregard this note. Thank you!

Kind regards,
Billing Operations Dept.
[SME Account Desk]`;
      } else if (outreachTone === 'assertive') {
        draftText = `Subject: ACTION REQUIRED: Overdue Invoices INV ${targetInvoice.id} - Customer Accounts

To: Accounts Payable, ${targetInvoice.clientName}

This is an important update regarding outstanding Invoice ${targetInvoice.id} which had a payment limit of ${formattedDate}.

As of today's bank clearance ledger, we have not noticed a corresponding deposit matching the outstanding principal of ${currencySymbol}${targetInvoice.amount.toLocaleString()}. 

Please finalize appropriate payment authorization details inline with your primary billing schedule. Secure automatic card settlements can be settled instantly here:
https://flowt.app/pay/${targetInvoice.id}

For wire reference updates, please send the swift confirmation file to accounts@flowt-sme.com.

Sincerely,
Credit Management Desk
FLOWT Accounts Desk`;
      } else {
        draftText = `Subject: URGENT CREDIT WARNING: Suspended Account Notice - Invoice ${targetInvoice.id}

To: Director of Finance / Executive Controller, ${targetInvoice.clientName}

We are writing to issue an urgent notification that Invoice ${targetInvoice.id} remains unpaid since ${formattedDate}, despite past friendly updates.

The outstanding ledger balance of ${currencySymbol}${targetInvoice.amount.toLocaleString()} is currently flagged for final risk allocation. If payment or a swift deposit slip is not received within twenty-four (24) hours, your account file will be moved to third-party agency collections.

Avoid negative credit classification reports by clearing this item immediately via our express automatic ACH link:
https://flowt.app/pay/${targetInvoice.id}

We expect your priority attention to resolve this item.

Regards,
Collections & Risk Division
Corporate Billing Desk`;
      }

      setGeneratedDraft(draftText);
      setDraftLoading(false);
    }, 750);
  };

  const handleCopyText = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    if (identifier === 'draft') {
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 2000);
    } else {
      setCopiedCodeStatus(identifier);
      setTimeout(() => setCopiedCodeStatus(null), 2000);
    }
  };

  // Format model response helper to handle headers and markdown details
  const formatMsgText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('```')) return null;
      let formattedLine = line;
      const isBullet = line.startsWith('- ') || line.startsWith('* ');
      const cleanLine = isBullet ? line.slice(2) : line;

      // Handle bold bold replacement
      const processedContent = cleanLine.split('**').map((part, pIdx) => {
        if (pIdx % 2 === 1) {
          return <strong key={pIdx} className="font-bold text-white px-0.5">{part}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-5 list-disc text-xs text-zinc-300 leading-relaxed py-0.5 font-sans">
            {processedContent}
          </li>
        );
      }

      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-xs font-semibold uppercase text-blue-400 tracking-wider font-mono mt-3 mb-1 flex items-center gap-1.5 border-b border-zinc-900 pb-1">
            <Cpu className="w-3.5 h-3.5 text-blue-500" /> {line.slice(4)}
          </h4>
        );
      }

      return (
        <p key={idx} className="text-xs text-zinc-300 leading-relaxed py-1.5 font-sans">
          {processedContent}
        </p>
      );
    });
  };

  // Stats Helpers
  const totalOutstanding = invoices
    .filter(inv => inv.status === 'Outstanding' || inv.status === 'Overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueInvoicesCount = invoices.filter(inv => inv.status === 'Overdue').length;

  // Active Code Snippet Text for "Get Code"
  const getSelectedCodeSnippet = (lang: 'node' | 'python' | 'curl') => {
    if (lang === 'node') {
      return `import { GoogleGenAI } from "@google/genai";

// Initialize client securely on the server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
});

async function runCorporateAudit() {
  const systemInstruction = \`${customSystemInstruction.replace(/`/g, '\\`').replace(/\n/g, '\n  ')}\`;

  const response = await ai.models.generateContent({
    model: "${selectedModel}",
    contents: "Please analyze the ledger outstanding records...",
    config: {
      systemInstruction: systemInstruction,
      temperature: ${temperature},
      maxOutputTokens: ${maxOutputTokens},
      topP: ${topP},
      topK: ${topK}
    }
  });

  console.log(response.text);
}`;
    }

    if (lang === 'python') {
      return `import os
from google import genai
from google.genai import types

# Initialize the Gemini Python client
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

system_instruction = """${customSystemInstruction.replace(/\n/g, '\n')}"""

response = client.models.generate_content(
    model='${selectedModel}',
    contents='Analyze the ledger outstanding records...',
    config=types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=${temperature},
        max_output_tokens=${maxOutputTokens},
        top_p=${topP},
        top_k=${topK},
    )
)

print(response.text)`;
    }

    return `curl "https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=\${GEMINI_API_KEY}" \\
  -H 'Content-Type: application/json' \\
  -d '{
    "contents": [{"parts":[{"text": "Analyze the ledger outstanding records..."}]}],
    "systemInstruction": {
      "parts": [{"text": "${customSystemInstruction.replace(/\n/g, '\\n').replace(/"/g, '\\"')}"}]
    },
    "generationConfig": {
      "temperature": ${temperature},
      "maxOutputTokens": ${maxOutputTokens},
      "topP": ${topP},
      "topK": ${topK}
    }
  }'`;
  };

  const [activeCodeLang, setActiveCodeLang] = useState<'node' | 'python' | 'curl'>('node');

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden p-1 flex flex-col space-y-4" id="sme-ai-copilot-workspace">
      
      {/* Top AI Studio Header */}
      <div className="bg-zinc-900/40 border border-zinc-900/60 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 font-bold uppercase">SME AI Assistant</span>
          </div>
          <h2 className="text-xs font-bold font-sans text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-500" /> AI Assistant Workspace
          </h2>
          <p className="text-[10px] text-zinc-500 font-mono font-light">Custom assistant guidelines & configuration controls</p>
        </div>

        {/* Tab switcher inside the Playground */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-900">
          <button
            onClick={() => setActiveSubTab('playground')}
            className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'playground'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-blue-500" /> Ask Assistant
          </button>

          <button
            onClick={() => setActiveSubTab('drafts')}
            className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'drafts'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-blue-500" /> Draft Customer Email
          </button>
        </div>
      </div>

      {/* Main Sandbox 3-Column Studio Interface */}
      <div className="grid grid-cols-1 xl:cols-12 xl:grid-cols-12 gap-4 items-stretch">
        
        {/* COLUMN 1: LEFT COMPONENT - SYSTEM INSTRUCTIONS AND LEDGER CONTEXT (xl:col-span-3) */}
        <div className="xl:col-span-3 flex flex-col space-y-4 bg-zinc-950 border border-zinc-900 rounded-xl p-4">
          
          {/* Header 1 */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 font-bold">Assistant Guidelines</span>
            </div>
            
            {!editingInstructions ? (
              <button 
                onClick={() => {
                  setInstructionDraft(customSystemInstruction);
                  setEditingInstructions(true);
                }}
                className="text-[9px] font-bold font-mono text-zinc-500 hover:text-blue-500 cursor-pointer"
              >
                EDIT
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditingInstructions(false)}
                  className="text-[9px] font-bold font-mono text-zinc-500 hover:text-rose-400 cursor-pointer"
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleApplyInstructions}
                  className="text-[9px] font-bold font-mono text-emerald-400 hover:text-emerald-300 cursor-pointer"
                >
                  SAVE
                </button>
              </div>
            )}
          </div>

          {/* System Instructions content box */}
          <div className="space-y-2">
            {editingInstructions ? (
              <textarea
                value={instructionDraft}
                onChange={(e) => setInstructionDraft(e.target.value)}
                className="w-full text-[11px] font-mono bg-zinc-900 border border-zinc-800 rounded p-3 h-44 text-zinc-100 placeholder-zinc-700 outline-none focus:border-blue-500"
                placeholder="Instruct the model how to act..."
              />
            ) : (
              <div className="bg-zinc-900/30 border border-zinc-900 p-3.5 rounded text-[11px] font-mono text-zinc-400 leading-relaxed select-text min-h-36 max-h-44 overflow-y-auto whitespace-pre-wrap">
                {customSystemInstruction}
              </div>
            )}
            <p className="text-[9px] text-zinc-650 font-sans leading-relaxed">
              *Tweak these behavioral instructions directly to set the persona and tone of the AI assistant when discussing customer accounts.
            </p>
          </div>

          {/* Collapsible live variables context parameters block */}
          <div className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-900/10">
            <button 
              onClick={() => setShowLiveContext(!showLiveContext)}
              className="w-full p-2.5 px-3 flex justify-between items-center hover:bg-zinc-900/30 transition-all text-[10px] font-mono tracking-wider text-zinc-400 cursor-pointer border-b border-zinc-900"
            >
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-500" /> Linked Invoice & Bank Data
              </span>
              <ChevronRight className={`w-3 h-3 text-zinc-500 transition-transform ${showLiveContext ? 'rotate-90' : ''}`} />
            </button>
            
            {showLiveContext && (
              <div className="p-3 text-[10px] font-mono bg-zinc-950 text-zinc-400 max-h-[220px] overflow-y-auto leading-normal space-y-2 select-text">
                <div className="text-zinc-500">// Automatically synchronized from your live sheets</div>
                <div className="border-t border-zinc-900 pt-2 font-semibold text-zinc-300">Invoice List Context:</div>
                <pre className="text-zinc-400 text-[9px] bg-zinc-900/20 p-2 border border-zinc-900 rounded scrollbar-none whitespace-pre-wrap">
                  {invoices.map(inv => `${inv.invoiceNumber}: ${inv.clientName} (${inv.currency} ${inv.amount}) [${inv.status}]`).join('\n')}
                </pre>
                
                <div className="pt-2 font-semibold text-zinc-300">Bank Statement Context:</div>
                <pre className="text-zinc-400 text-[9px] bg-zinc-900/20 p-2 border border-zinc-900 rounded scrollbar-none whitespace-pre-wrap">
                  {bankTransactions.map(tx => `${tx.date} Ref: ${tx.reference} - ${tx.currency} ${tx.amount} (${tx.status})`).join('\n')}
                </pre>
              </div>
            )}
          </div>

          {/* Quick Sandbox Status metrics */}
          <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-lg space-y-2 font-mono">
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Workspace Connection Status</span>
            <div className="space-y-1.5 text-[10px] text-zinc-400 leading-normal">
              <div className="flex justify-between">
                <span>Active Invoices database:</span>
                <span className="text-zinc-300 font-bold">{invoices.length} invoices</span>
              </div>
              <div className="flex justify-between">
                <span>Bank accounts mapped:</span>
                <span className="text-zinc-300 font-bold">{bankTransactions.length} items</span>
              </div>
              <div className="flex justify-between">
                <span>Payment risk indicator:</span>
                <span className={`font-bold ${overdueInvoicesCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {overdueInvoicesCount > 0 ? 'OVERDUE INVOICES DETECTED' : 'ALL RECONCILED'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* COLUMN 2: MIDDLE COMPONENT - ACTIVE WORKSPACE / TESTBED (xl:col-span-6) */}
        <div className="xl:col-span-6 flex flex-col bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden min-h-[580px]">
          
          {/* TAB A: PLAYGROUND TESTBED */}
          {activeSubTab === 'playground' && (
            <div className="flex flex-col flex-1 h-full">
              {/* Sandbox info header bar */}
              <div className="p-3 bg-zinc-900/20 border-b border-zinc-900 flex justify-between items-center text-[10px] font-mono text-zinc-400">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                  <Terminal className="w-3.5 h-3.5 text-blue-500" /> Active Conversation Workspace
                </span>
                <button
                  onClick={clearSandbox}
                  className="px-2.5 py-1 text-[9px] font-extrabold uppercase bg-zinc-900 hover:text-rose-400 border border-zinc-800 hover:border-rose-950 rounded transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3 text-zinc-500" /> Reset History
                </button>
              </div>

              {/* Chat messages dialogue playground flow (Google AI Studio aesthetic) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[445px] min-h-[385px] bg-zinc-950 scrollbar-none">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg overflow-hidden group ${
                      m.role === 'user' 
                        ? 'border-zinc-800 bg-zinc-900/30 ml-4' 
                        : 'border-zinc-900 bg-zinc-950/20 mr-4'
                    }`}
                  >
                    {/* Header info bar inside each output block */}
                    <div className="p-2.5 border-b border-zinc-900 bg-zinc-900/10 flex justify-between items-center text-[9px] font-mono text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        {m.role === 'user' ? (
                          <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 font-bold rounded uppercase text-[8px]">YOUR QUESTION</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-zinc-900 text-blue-400 font-bold rounded uppercase text-[8px] border border-blue-900/40">AI ASSISTANT RESPONSE</span>
                        )}
                        <span>{new Date().toLocaleTimeString()}</span>
                      </div>
                      
                      {m.role === 'model' && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleCopyText(m.content, 'dialogue-block')}
                            className="px-2.5 py-1 text-[10px] bg-zinc-900 hover:bg-zinc-805 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded transition-colors flex items-center gap-1.5 text-zinc-400 cursor-pointer"
                            title="Copy reply text"
                          >
                            <Copy className="w-3 h-3 text-blue-500" /> Copy Reply
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-zinc-950/45 text-xs text-zinc-300 leading-relaxed font-sans scrollbar-none select-text">
                      {formatMsgText(m.content)}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="border border-zinc-905 bg-zinc-900/10 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                      <span>Drafting response... Reading linked records using AI model {selectedModel}...</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-75" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-150" />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>

              {/* Bottom user continuous prompt input box (Google AI Studio prompt testbed style) */}
              <div className="p-4 border-t border-zinc-900 bg-zinc-900/10">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRunPrompt(userInput);
                  }}
                  className="relative flex items-center"
                >
                  <input
                    type="text"
                    required
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask about your accounts (e.g., 'Which invoices are overdue?' or 'Draft a friendly warning email for INV-2026-002')"
                    className="w-full pl-4 pr-24 py-3 bg-zinc-950 border border-zinc-900 rounded-lg text-xs font-mono text-zinc-100 placeholder-zinc-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all text-[11px]"
                    disabled={chatLoading}
                  />
                  <div className="absolute right-2 flex items-center gap-1.5">
                    <button
                      type="submit"
                      disabled={chatLoading || !userInput.trim()}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-[10px] font-mono font-bold tracking-wider uppercase disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      SEND <Play className="w-3 h-3 text-white fill-white" />
                    </button>
                  </div>
                </form>
                <div className="flex justify-between items-center mt-2.5 px-1">
                  <div className="flex items-center gap-1 text-[9px] text-zinc-600 font-mono">
                    <Info className="w-3 h-3 text-zinc-700" />
                    <span>Responses are guided by the behavioral configurations and creativity level selected.</span>
                  </div>
                  <span className="text-[9px] text-zinc-650 font-mono uppercase">Workspace Secure Connection</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB B: REMITTANCE OUTREACH DRAFT STUDIO */}
          {activeSubTab === 'drafts' && (
            <div className="flex flex-col flex-1 h-full p-4 space-y-4">
              <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold font-sans uppercase text-white tracking-wider flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-blue-500" /> Customer Email Generator
                  </h3>
                  <p className="text-[9px] text-zinc-500 font-mono font-normal">Create professional payment requests and reminders using customer invoice details</p>
                </div>
                
                {generatedDraft && (
                  <button
                    onClick={() => handleCopyText(generatedDraft, 'draft')}
                    className={`px-3 py-1.5 rounded text-[9px] uppercase font-mono font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                      copiedStatus 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {copiedStatus ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied Draft Email!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Email Draft
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Stack Configuration pane inside the page */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                
                {/* Select Target Invoice parameter */}
                <div className="bg-zinc-900/20 border border-zinc-900 rounded-lg p-3.5 space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Select Invoice for Reminder</label>
                    <select
                      value={selectedInvoiceId}
                      onChange={(e) => setSelectedInvoiceId(e.target.value)}
                      className="w-full text-xs font-mono p-2 bg-zinc-950 border border-zinc-800 rounded uppercase text-zinc-300 focus:border-blue-500 outline-none cursor-pointer"
                    >
                      {invoices.length === 0 ? (
                        <option value="">No Invoices loaded in workspace</option>
                      ) : (
                        invoices.map(inv => (
                          <option key={inv.id} value={inv.id} className="bg-zinc-950">
                            {inv.invoiceNumber} - {inv.clientName} (${inv.amount.toLocaleString()}) [{inv.status}]
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Urgency Tone Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Select Email Tone</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setOutreachTone('cordial')}
                        className={`py-1.5 text-[9px] uppercase font-mono font-bold rounded cursor-pointer border transition-all ${
                          outreachTone === 'cordial'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/80'
                            : 'bg-zinc-900/60 text-zinc-500 border-zinc-900 hover:text-zinc-300 hover:border-zinc-850'
                        }`}
                      >
                        Friendly
                      </button>
                      <button
                        onClick={() => setOutreachTone('assertive')}
                        className={`py-1.5 text-[9px] uppercase font-mono font-bold rounded cursor-pointer border transition-all ${
                          outreachTone === 'assertive'
                            ? 'bg-amber-950/40 text-amber-400 border-amber-800/80'
                            : 'bg-zinc-900/60 text-zinc-500 border-zinc-900 hover:text-zinc-300 hover:border-zinc-850'
                        }`}
                      >
                        Firm
                      </button>
                      <button
                        onClick={() => setOutreachTone('urgent')}
                        className={`py-1.5 text-[9px] uppercase font-mono font-bold rounded cursor-pointer border transition-all ${
                          outreachTone === 'urgent'
                            ? 'bg-rose-950/40 text-rose-400 border-rose-800/80'
                            : 'bg-zinc-900/60 text-zinc-500 border-zinc-900 hover:text-zinc-300 hover:border-zinc-850'
                        }`}
                      >
                        Final Notice
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateOutreach}
                    disabled={draftLoading || invoices.length === 0}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-mono font-bold uppercase tracking-wider text-[10px] sm:text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-45 cursor-pointer"
                  >
                    {draftLoading ? 'CONSTRUCTING REMINDER EMAIL...' : 'CREATE DRAFT EMAIL'}
                  </button>
                </div>

                {/* Live Variables Preview details */}
                <div className="p-3 bg-zinc-900/10 border border-zinc-900 rounded-lg flex flex-col justify-between text-[10.5px] font-mono leading-relaxed text-zinc-400 font-light">
                  <div className="space-y-2">
                    <span className="block text-[8.5px] uppercase font-bold text-blue-450 font-sans">Selected Invoice Details</span>
                    {selectedInvoiceId && invoices.find(i => i.id === selectedInvoiceId) ? (
                      (() => {
                        const matched = invoices.find(i => i.id === selectedInvoiceId)!;
                        return (
                          <div className="space-y-1.5">
                            <div>Invoice ID: <strong className="text-zinc-200">{matched.invoiceNumber}</strong></div>
                            <div>Client name: <strong className="text-zinc-200">{matched.clientName}</strong></div>
                            <div>Outstanding: <strong className="text-zinc-200">{matched.currency} {matched.amount.toLocaleString()}</strong></div>
                            <div>Matured Date: <strong className="text-rose-400">{new Date(matched.dueDate).toLocaleDateString()}</strong></div>
                            <div>Status Parameter: <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold ${
                              matched.status === 'Paid' ? 'bg-emerald-950 text-emerald-400' :
                              matched.status === 'Overdue' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400'
                            }`}>{matched.status}</span></div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-zinc-600">No active parameter mapped inside current context.</div>
                    )}
                  </div>
                  <div className="text-[9px] text-zinc-600 font-sans italic pt-2 border-t border-zinc-900 mt-2">
                    "Email dunning rules automatically embed secure Stripe portal URLs with auto-reconciliation telemetry."
                  </div>
                </div>

              </div>

              {/* Output Generation Box */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 min-h-[180px] max-h-[220px] overflow-y-auto select-text font-mono">
                {draftLoading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-2 text-zinc-500 text-[10px] py-12">
                    <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                    <span>Mapping secure placeholders and compiling outreach communication variables...</span>
                  </div>
                ) : generatedDraft ? (
                  <div className="whitespace-pre-wrap text-[11px] leading-relaxed text-zinc-300 font-mono bg-zinc-900/10 p-3 rounded border border-zinc-900/60">
                    {generatedDraft}
                  </div>
                ) : (
                  <div className="text-center py-14 space-y-2 max-w-sm mx-auto">
                    <Mail className="w-7 h-7 text-zinc-700 mx-auto" />
                    <h5 className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">No Active Draft Generated</h5>
                    <p className="text-[10px] text-zinc-550 font-sans leading-relaxed">
                      Select any record and pick an outreach tone Urgency level on the top panel, then compile to trigger AI generation.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB C: API SDK CODE GENERATOR */}
          {activeSubTab === 'get-code' && (
            <div className="flex flex-col flex-1 h-full p-4 space-y-4">
              <div className="border-b border-zinc-900 pb-2">
                <h3 className="text-xs font-bold font-sans uppercase text-white tracking-wider flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-violet-400" /> Developer Get Code SDK
                </h3>
                <p className="text-[9px] text-zinc-500 font-mono">Grab identical SDK code segments mapping tuned parameter sets and instructions for live production integrations.</p>
              </div>

              {/* Inner language tabs */}
              <div className="flex bg-zinc-900/40 border border-zinc-905 p-1 rounded-md self-start gap-1">
                {(['node', 'python', 'curl'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setActiveCodeLang(lang)}
                    className={`px-3 py-1 text-[9.5px] font-mono tracking-wider rounded font-bold uppercase cursor-pointer ${
                      activeCodeLang === lang 
                        ? 'bg-zinc-800 text-white' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {lang === 'node' ? 'NodeJS SDK' : lang === 'python' ? 'Python SDK' : 'Classic cURL'}
                  </button>
                ))}
              </div>

              {/* Code output display box */}
              <div className="relative border border-zinc-900 bg-zinc-900/20 rounded-lg overflow-hidden flex-1 flex flex-col">
                <div className="p-2 border-b border-zinc-900 bg-zinc-950/80 flex justify-between items-center text-[9px] text-zinc-500 font-mono">
                  <span>{activeCodeLang === 'node' ? 'server-side TypeScript client initialization' : activeCodeLang === 'python' ? 'Python official runtime setup' : 'Standard REST API request'}</span>
                  <button
                    onClick={() => handleCopyText(getSelectedCodeSnippet(activeCodeLang), 'code-snippet')}
                    className="p-1 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Copy snippet"
                  >
                    {copiedCodeStatus === 'code-snippet' ? (
                      <span className="text-emerald-400 uppercase text-[8.5px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Copied SDK Code!
                      </span>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-zinc-400" /> Copy Code
                      </>
                    )}
                  </button>
                </div>
                
                <div className="p-3.5 flex-1 overflow-y-auto font-mono text-[10px] leading-relaxed text-zinc-300 max-h-[300px] select-text scrollbar-none whitespace-pre">
                  {getSelectedCodeSnippet(activeCodeLang)}
                </div>
                
                <div className="p-2.5 bg-violet-950/10 border-t border-zinc-900/80 flex items-center gap-2 text-[9px] text-zinc-550 font-sans leading-relaxed">
                  <ShieldCheck className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                  <span>Configured using your custom system instructions and current model parameters tuned in the right panel! Ready for copy-paste deployment.</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* COLUMN 3: RIGHT COMPONENT - MODELS TUNING SLIDERS (xl:col-span-3) */}
        <div className="xl:col-span-3 flex flex-col space-y-5 bg-zinc-950 border border-zinc-900 rounded-xl p-5 overflow-y-auto xl:max-h-[700px] scrollbar-none">
          
          {/* Section header */}
          <div className="border-b border-zinc-900 pb-2.5 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-500" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-bold">Settings & Controls</span>
          </div>

          {/* Model selection dropdown */}
          <div className="space-y-2">
            <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold">Artificial Intelligence Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full text-xs font-mono p-2.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-300 focus:border-blue-500 outline-none cursor-pointer"
            >
              <option value="gemini-3.5-flash" className="bg-zinc-950">Standard AI (Recommended)</option>
              <option value="gemini-3.1-pro-preview" className="bg-zinc-950">Premium AI (Requires Pro License)</option>
              <option value="gemini-3.1-flash-lite" className="bg-zinc-950">Economy AI (Fast & Lightweight)</option>
            </select>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
              *Premium models are best for complex analytical queries. Standard works instantly out of the box.
            </p>
          </div>

          <hr className="border-zinc-900" />

          {/* Tone Creativity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-zinc-400 uppercase font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-blue-500" /> Tone Creativity (Temperature)
              </span>
              <span className="text-white font-bold">{temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.2"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
              <span>Professional</span>
              <span>Balanced</span>
              <span>Casual</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-sans leading-normal">
              *Lower levels make responses more factual. Higher levels produce more creative and friendly emails.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
