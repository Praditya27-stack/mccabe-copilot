'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Wrench, Sparkles, AlertTriangle, Play, ArrowUp, X, Loader2, Copy, Download, CheckCircle2, Trash2 } from 'lucide-react';
import { copilotTools } from '@/lib/copilot/tools';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Message {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  toolCalls?: Array<{
    name: string;
    params?: any;
    result?: string;
  }>;
}

const DEFAULT_WELCOME: Message = {
  id: 'welcome',
  sender: 'agent',
  text: 'System online. I am your Industrial Chemical Engineer Co-Pilot. How can I assist you with the Ethanol-Water simulation today?'
};

const STORAGE_KEY = 'mccabe_copilot_chat_history';
const MAX_HISTORY = 50;

export const CopilotDock: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([DEFAULT_WELCOME]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [input, setInput] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. SSR-safe Hydration from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.slice(-MAX_HISTORY));
        }
      }
    } catch (err) {
      console.warn('Failed to hydrate chat history from localStorage:', err);
    }
    setIsHydrated(true);
  }, []);

  // 2. Persist to LocalStorage whenever messages change (capped at 50)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
    } catch (err) {
      console.warn('Failed to save chat history to localStorage:', err);
    }
  }, [messages, isHydrated]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 150)}px`;
    }
  }, [input]);

  const addMessage = (msg: Message) => setMessages((prev) => [...prev, msg]);

  const executeCopilotRequest = async (userText: string, intendedTool?: string) => {
    const id = Date.now().toString();
    addMessage({ id: `${id}-u`, sender: 'user', text: userText });
    setIsLoading(true);

    try {
      const stateSnapshot = copilotTools.get_simulation_state();
      
      const payload = {
        messages: [{ role: 'user', content: userText }],
        state: stateSnapshot,
      };

      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || errData.details || 'Unknown API Error');
      }

      const assistantMessage = await res.json();
      const toolCallsDetails: any[] = [];
      
      // Update offline status
      setIsOfflineMode(!!assistantMessage.isOffline);

      // 1. If remote tool calls returned from Gemini
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        for (const tc of assistantMessage.tool_calls) {
          const funcName = tc.function.name;
          const args = JSON.parse(tc.function.arguments || '{}');
          let executionResult = '';

          try {
            if (funcName === 'set_simulation_parameters') {
              executionResult = copilotTools.set_simulation_parameters(args);
            } else if (funcName === 'run_optimization') {
              executionResult = copilotTools.run_optimization();
            } else if (funcName === 'generate_hazop_report') {
              const hazards = copilotTools.generate_hazop_report();
              executionResult = hazards.join('\n');
            } else {
              executionResult = `Tool ${funcName} not found.`;
            }
          } catch (e: any) {
            executionResult = `Error executing tool: ${e.message}`;
          }

          toolCallsDetails.push({ name: funcName, params: args, result: executionResult });
        }
      } else if (assistantMessage.isOffline && intendedTool) {
        // 2. Standalone Offline Fallback: Execute intended tool locally so Quick Actions still work even if VPS tunnel is dead!
        let executionResult = '';
        const args = intendedTool === 'set_simulation_parameters' ? { zF: 0.40, xD: 0.85, xB: 0.05, q: 1.0, R: 2.2 } : {};

        try {
          if (intendedTool === 'set_simulation_parameters') {
            executionResult = copilotTools.set_simulation_parameters(args);
          } else if (intendedTool === 'run_optimization') {
            executionResult = copilotTools.run_optimization();
          } else if (intendedTool === 'generate_hazop_report') {
            const hazards = copilotTools.generate_hazop_report();
            executionResult = hazards.join('\n');
          }
        } catch (e: any) {
          executionResult = `Error executing fallback tool: ${e.message}`;
        }

        toolCallsDetails.push({ name: intendedTool, params: args, result: executionResult });
      }

      let textContent = assistantMessage.content || '';
      if (!textContent && toolCallsDetails.length > 0) {
        textContent = 'Parameter sistem telah berhasil diubah sesuai hasil perhitungan optimasi saya.';
      }

      addMessage({
        id: `${id}-a`,
        sender: 'agent',
        text: textContent,
        toolCalls: toolCallsDetails.length > 0 ? toolCallsDetails : undefined,
      });

    } catch (err: any) {
      console.warn('Co-Pilot network error, falling back to local mode:', err.message);
      setIsOfflineMode(true);
      
      let localExecutionText = '';
      const toolCallsDetails: any[] = [];
      if (intendedTool) {
        let executionResult = '';
        const args = intendedTool === 'set_simulation_parameters' ? { zF: 0.40, xD: 0.85, xB: 0.05, q: 1.0, R: 2.2 } : {};
        try {
          if (intendedTool === 'set_simulation_parameters') {
            executionResult = copilotTools.set_simulation_parameters(args);
          } else if (intendedTool === 'run_optimization') {
            executionResult = copilotTools.run_optimization();
          } else if (intendedTool === 'generate_hazop_report') {
            const hazards = copilotTools.generate_hazop_report();
            executionResult = hazards.join('\n');
          }
        } catch (e: any) {
          executionResult = `Error executing fallback tool: ${e.message}`;
        }
        toolCallsDetails.push({ name: intendedTool, params: args, result: executionResult });
        localExecutionText = `\n\n*Aksi \`${intendedTool}\` telah berhasil dieksekusi secara heuristik lokal karena tunnel terputus.*`;
      }

      addMessage({
        id: `${id}-a`,
        sender: 'agent',
        text: `⚡ **Koneksi ke 9Router Engine terputus, beralih ke mode offline**\n\nSistem remote saat ini tidak dapat dijangkau (*network timeout / maintenance*). Co-Pilot beralih ke mode **Local Standalone Engine**:\n\n- 📊 **Kalkulasi Fisik & Termodinamika**: Tetap aktif 100% di browser Anda (VLE Perry's Handbook & SVG SCADA berjalan penuh).\n- 🛠️ **Otomasi Proses**: Tombol *Quick Prompts* tetap berfungsi normal untuk otomasi lokal deterministik.${localExecutionText}`,
        toolCalls: toolCallsDetails.length > 0 ? toolCallsDetails : undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (action: 'optimize' | 'hazop' | 'preset') => {
    if (isLoading) return;
    if (action === 'optimize') {
      executeCopilotRequest('Tolong optimasi reflux ratio dan stage count untuk menghemat beban energi reboiler tanpa merusak target distilat.', 'run_optimization');
    } else if (action === 'hazop') {
      executeCopilotRequest('Tolong jalankan tool generate_hazop_report untuk audit safety kolom saat ini. Berikan laporan HAZOP lengkap.', 'generate_hazop_report');
    } else if (action === 'preset') {
      executeCopilotRequest('Gunakan tool set_simulation_parameters untuk mengubah target distilat menjadi 0.85, bottoms 0.05, feed 0.40, dan reflux ratio 2.2.', 'set_simulation_parameters');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput('');
    executeCopilotRequest(text);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadReport = (text: string) => {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mccabe_report_${new Date().toISOString().replace(/[:.]/g, '-')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearChat = () => {
    setMessages([DEFAULT_WELCOME]);
    setShowConfirmClear(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear localStorage chat:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-[650px] bg-neutral-900 border border-indigo-900/50 rounded-xl shadow-2xl overflow-hidden relative z-20">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-indigo-900/50 bg-indigo-950/20">
        <div className="flex items-center space-x-2">
          <Bot className={`w-5 h-5 ${isOfflineMode ? 'text-amber-400' : 'text-indigo-400'}`} />
          <h2 className="text-sm font-semibold text-neutral-100">Live AI Co-Pilot</h2>
          {isOfflineMode ? (
            <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-amber-950/50 border border-amber-800/50 text-amber-400 text-[9px] font-bold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Standby Local</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 text-[9px] font-bold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI Active</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {/* Clear Chat Button / Confirmation */}
          {showConfirmClear ? (
            <div className="flex items-center space-x-1 bg-neutral-900 border border-neutral-700 px-2 py-1 rounded-lg text-xs animate-in fade-in">
              <span className="text-neutral-300 text-[11px]">Hapus chat?</span>
              <button
                onClick={handleClearChat}
                className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-semibold transition"
              >
                Ya
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] transition"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-rose-400 transition"
              title="Clear Chat History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button onClick={onClose} className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col max-w-[90%] ${
                msg.sender === 'user' ? 'ml-auto' : msg.sender === 'system' ? 'mx-auto w-full' : 'mr-auto'
              }`}
            >
              <div
                className={`p-3 text-sm rounded-2xl relative group ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : msg.sender === 'system'
                    ? 'bg-rose-950/50 text-rose-300 border border-rose-900/50 rounded-lg text-center'
                    : 'bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-tl-none'
                }`}
              >
                {/* Export Action Buttons for Agent Messages */}
                {msg.sender === 'agent' && msg.id !== 'welcome' && (
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900/90 rounded-lg p-1 border border-neutral-700">
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.text)}
                      className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white transition"
                      title="Copy Markdown"
                    >
                      {copiedId === msg.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => downloadReport(msg.text)}
                      className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white transition"
                      title="Download .md Report"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Text Content */}
                {msg.sender === 'agent' ? (
                  <div className="markdown-body space-y-2 leading-relaxed [&>p]:mb-2 [&>h1]:font-bold [&>h1]:text-lg [&>h2]:font-bold [&>h2]:text-base [&>h3]:font-semibold [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&_strong]:text-white [&_a]:text-indigo-400 overflow-hidden pr-10">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap pr-2">{msg.text}</span>
                )}
                
                {/* Tool Execution Badges */}
                {msg.toolCalls && msg.toolCalls.map((tc, idx) => (
                  <div key={idx} className="mt-4 bg-neutral-950/50 border border-neutral-700/50 rounded-lg p-2.5 font-mono text-[11px] text-emerald-400 flex flex-col space-y-1.5 shadow-inner">
                    <div className="flex items-center space-x-1.5 border-b border-neutral-800 pb-1.5">
                      <Wrench className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-semibold text-emerald-300 tracking-wide uppercase">Tool Call</span>
                    </div>
                    <span className="font-bold text-indigo-300">{tc.name}()</span>
                    {tc.params && Object.keys(tc.params).length > 0 && (
                      <span className="text-neutral-400 bg-neutral-900/50 p-1.5 rounded-md mt-1 break-all">
                        {JSON.stringify(tc.params)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mr-auto flex flex-col max-w-[85%]">
              <div className="p-3 bg-neutral-800 border border-neutral-700 rounded-2xl rounded-tl-none flex items-center space-x-2 text-neutral-400 shadow-md">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span className="text-xs font-medium">Co-Pilot sedang berpikir...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="p-3 border-t border-neutral-800 bg-neutral-900/50 flex flex-col space-y-2">
        <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider px-1">Quick Prompts</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleAction('optimize')} disabled={isLoading} className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-indigo-950/40 hover:bg-indigo-900/60 disabled:opacity-50 text-indigo-300 text-xs rounded-lg border border-indigo-800/50 transition-colors shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /><span>Optimasi Energi</span>
          </button>
          <button onClick={() => handleAction('hazop')} disabled={isLoading} className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-amber-950/40 hover:bg-amber-900/60 disabled:opacity-50 text-amber-300 text-xs rounded-lg border border-amber-800/50 transition-colors shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5" /><span>Audit HAZOP</span>
          </button>
          <button onClick={() => handleAction('preset')} disabled={isLoading} className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 disabled:opacity-50 text-emerald-300 text-xs rounded-lg border border-emerald-800/50 transition-colors shadow-sm">
            <Play className="w-3.5 h-3.5" /><span>Preset Industri</span>
          </button>
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-neutral-800 bg-neutral-900">
        <div className="relative flex items-end bg-neutral-950 border border-neutral-700 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all shadow-inner">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ketik instruksi ke Co-Pilot... (Shift+Enter u/ baris baru)"
            className="w-full bg-transparent pl-3 pr-10 py-3 text-sm text-neutral-100 focus:outline-none placeholder:text-neutral-600 disabled:opacity-50 resize-none max-h-[150px] overflow-y-auto leading-relaxed"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:bg-neutral-800 text-white disabled:text-neutral-500 rounded-lg transition-colors shadow-md"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
