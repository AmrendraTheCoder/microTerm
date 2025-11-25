'use client';

import { useEffect, useRef } from 'react';
import { Terminal, X, Activity, BrainCircuit, DollarSign, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgent } from '@/lib/agent-context';

interface AgentMonitorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AgentMonitor({ isOpen, onClose }: AgentMonitorProps) {
  const { balance, actions, directives, isExecuting } = useAgent();
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [actions]);

  if (!isOpen) return null;

  const activeDirectives = directives.filter(d => d.isActive);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <div className="w-full max-w-4xl bg-[#0A0A0F] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-5 h-5 text-blue-400 animate-pulse" />
              <h2 className="font-bold text-white text-lg tracking-tight">
                Agent Neural Core <span className="text-xs font-mono text-slate-500 ml-2 font-normal">v2.0.1</span>
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-sm font-mono font-medium text-blue-100">${balance.toFixed(2)}</span>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Left Panel - System Status */}
            <div className="w-72 border-r border-white/5 bg-black/20 p-6 overflow-y-auto hidden md:block">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" /> System Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Core Engine</span>
                      <span className="text-green-400 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        ONLINE
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Network</span>
                      <span className="text-blue-400 font-medium">BASE SEPOLIA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Memory</span>
                      <div className="w-24 h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                        <div className="h-full w-[35%] bg-violet-500 rounded-full" />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm pt-2">
                      <span className="text-slate-400">Status</span>
                      <span className={`font-medium px-2 py-0.5 rounded text-xs ${isExecuting ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : "bg-green-500/10 text-green-400 border border-green-500/20"}`}>
                        {isExecuting ? 'PROCESSING' : 'IDLE'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" /> Directives ({activeDirectives.length})
                  </h3>
                  <div className="space-y-3">
                    {activeDirectives.length === 0 ? (
                      <div className="text-xs text-slate-600 italic p-3 border border-white/5 rounded bg-white/5">
                        No active directives
                      </div>
                    ) : (
                      activeDirectives.map((dir) => (
                        <div key={dir.id} className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg text-xs transition-all hover:bg-blue-500/10">
                          <div className="text-blue-200 mb-2 font-medium line-clamp-2" title={dir.rule}>
                            {dir.rule}
                          </div>
                          <div className="flex justify-between text-slate-500 border-t border-blue-500/10 pt-2 mt-1">
                            <span>Max: ${dir.maxCostPerAction}</span>
                            <span className="text-green-400 flex items-center gap-1">
                              <span className="w-1 h-1 bg-green-400 rounded-full" />
                              ACTIVE
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Execution Logs */}
            <div className="flex-1 bg-[#050508] p-6 overflow-y-auto font-mono text-sm relative">
              
              {actions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Terminal className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="font-medium">Awaiting instructions...</p>
                  <p className="text-xs mt-2 opacity-60">Type a command to start (⌘K)</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {actions.map((action) => (
                    <div key={action.id} className="flex gap-4 hover:bg-white/5 p-2 rounded-lg transition-colors border border-transparent hover:border-white/5 group">
                      <span className="text-slate-600 text-xs whitespace-nowrap pt-1 font-sans">
                        {action.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={
                            action.success ? "text-green-400" : "text-red-400"
                          }>
                            {action.success ? "✔" : "✖"}
                          </span>
                          <span className="text-blue-400 font-bold uppercase text-[10px] tracking-wider bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                            {action.type}
                          </span>
                          {action.cost > 0 && (
                            <span className="text-yellow-400 text-xs flex items-center gap-0.5 ml-auto bg-yellow-500/5 px-1.5 py-0.5 rounded">
                              <DollarSign className="w-3 h-3" />
                              {action.cost.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 pl-6 group-hover:text-white transition-colors">{action.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/5 bg-[#030305] p-3 px-6 text-[10px] text-slate-600 flex justify-between font-mono uppercase tracking-wider">
            <span>MicroTerm Agent OS v2.0</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Connected to Neural Network
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
