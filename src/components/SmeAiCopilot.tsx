import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, Bot, User, HelpCircle, AlertCircle, RefreshCw, Trash2, ArrowUpRight, ShieldCheck, Mail
} from 'lucide-react';
import { Invoice, BankTransaction } from '../types.js';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface SmeAiCopilotProps {
  invoices: Invoice[];
  bankTransactions: BankTransaction[];
}

export default function SmeAiCopilot({ invoices, bankTransactions }: SmeAiCopilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: `👋 **Welcome to FLOWT Stage III: SME Corporate AI Co-Pilot**\n\nI am your sovereign context-aware accounting assistant. I have mapped your real-time ledger and banking feeds. Tell me what cashflow operations or drafts you need compiled today!`
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const updatedMessages = [...messages, { role: 'user' as const, content: textToSend }];
    setMessages(updatedMessages);
    setUserInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'model', content: data.response }]);
      } else {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'model', 
            content: `⚠️ **[API Error]** Could not communicate with server co-pilot. Make sure process.env.GEMINI_API_KEY is active in your terminal/environment or consult the workspace.` 
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
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'model',
        content: `🔄 **Copilot ledger reset.** Conversation history cleared successfully. Ask me anything regarding your active transactions!`
      }
    ]);
  };

  const samplePrompts = [
    {
      label: "Analyze Cashflow Liquidity Risk",
      prompt: "Show me a detailed status and cashflow liquidity report including risk rating on overdue invoices."
    },
    {
      label: "Diagnose Acme Global Invoice",
      prompt: "Show me acme global outstanding invoice details and identify matching wire transfers to settle INV-2026-001."
    },
    {
      label: "Draft München Overdue Email",
      prompt: "Draft a cordova professional overdue notice email for München Creative Group based on invoice parameters."
    }
  ];

  // Helper to format text with neat formatting
  const formatMsgText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Check code blocks
      if (line.startsWith('```')) {
        return null; // Skip markdown raw block tags
      }
      
      // Simple bold replacements inside lines
      let formattedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      
      // Convert list bullet
      const isBullet = line.startsWith('- ') || line.startsWith('* ');
      const cleanLine = isBullet ? line.slice(2) : line;

      // Handle simple formatting highlights
      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-zinc-300 leading-relaxed py-0.5">
            {cleanLine.replace(/\*\*/g, '')}
          </li>
        );
      }

      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-xs font-black uppercase text-indigo-400 tracking-wider font-mono mt-3 mb-1">{line.slice(4)}</h4>;
      }

      return (
        <p key={idx} className="text-xs text-zinc-300 leading-relaxed py-0.5 font-sans">
          {line.replace(/\*\*/g, '')}
        </p>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="sme-ai-copilot-container">
      
      {/* Suggestions Sidebar panel */}
      <div className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <div>
              <h4 className="text-[11px] font-mono font-bold tracking-widest text-zinc-400 uppercase">Sovereign Commands</h4>
              <p className="text-[10px] text-zinc-650 font-mono">One-click interactive triggers</p>
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Click any instant dispatch pipeline to supply current database parameters directly to the underlying Gemini LLM context:
          </p>

          <div className="space-y-2">
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(p.prompt)}
                className="w-full text-left p-3 rounded-xl bg-zinc-900/60 border border-zinc-900 hover:border-violet-500/30 text-zinc-300 hover:text-white hover:bg-zinc-900 transition-all text-xs font-mono flex items-center justify-between group bounce-spring"
              >
                <span className="truncate pr-2">{p.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-violet-400 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Accounting Stats Context preview */}
        <div className="p-3.5 bg-violet-950/20 border border-violet-900/30 rounded-xl space-y-2">
          <span className="text-[9px] font-mono whitespace-nowrap overflow-ellipsis font-black tracking-widest text-violet-400 uppercase">
            Active Context Fed
          </span>
          <div className="space-y-1 text-[10px] text-zinc-500 font-mono">
            <div className="flex justify-between">
              <span>Client Ledger Size:</span>
              <span className="text-zinc-300 font-bold">{invoices.length} entries</span>
            </div>
            <div className="flex justify-between">
              <span>Live Inward Wires:</span>
              <span className="text-zinc-300 font-bold">{bankTransactions.length} items</span>
            </div>
            <div className="flex justify-between">
              <span>Cognitive State:</span>
              <span className="text-emerald-400 font-bold">Synchronized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Active Chat Terminal */}
      <div className="lg:col-span-8 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col h-[520px] overflow-hidden">
        
        {/* Terminal Header */}
        <div className="p-4 bg-zinc-900/10 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                Gemini Financial Co-Pilot
                <span className="text-[7.5px] bg-violet-950 text-violet-300 border border-violet-850 px-1.5 py-0.5 rounded-sm tracking-widest font-black animate-pulse">AUTONOMOUS</span>
              </h3>
              <p className="text-[9px] text-zinc-500 font-mono">Continuous feedback layer</p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="p-1.5 px-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-rose-400 transition-all text-[9px] uppercase font-bold font-mono tracking-wider flex items-center gap-1.5 bounce-spring cursor-pointer"
            title="Purge dialogue logs"
          >
            <Trash2 className="w-3 h-3" /> Reset Session
          </button>
        </div>

        {/* Message Log viewport */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-zinc-950/90">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-[85%] ${
                m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              {/* Avatar indicator */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border text-[10px] uppercase font-bold font-mono ${
                  m.role === 'user'
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                    : 'bg-violet-950 border-violet-900 text-violet-400'
                }`}
              >
                {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Speech bubble */}
              <div
                className={`p-3.5 rounded-2xl space-y-1.5 ${
                  m.role === 'user'
                    ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-tr-none'
                    : 'bg-zinc-950 border border-zinc-900 text-zinc-300 rounded-tl-none shadow-sm'
                }`}
              >
                {formatMsgText(m.content)}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-7 h-7 rounded-sm bg-violet-950 border border-violet-900 flex items-center justify-center text-violet-400 shrink-0">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-2xl rounded-tl-none flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce delay-200" />
                <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-mono">Consolidating variables...</span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Form area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(userInput);
          }}
          className="p-4 border-t border-zinc-900 bg-zinc-900/10 flex items-center gap-3"
        >
          <input
            type="text"
            required
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type accounting queries (e.g. 'How much does Acme owe?')"
            className="flex-1 px-4 py-2.5 text-xs rounded-full bg-zinc-950 border border-zinc-900 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-violet-500 transition-colors font-mono"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !userInput.trim()}
            className="p-2.5 px-4 rounded-full bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 transition-all font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 bounce-spring bounce-btn cursor-pointer"
          >
            Send <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
}
