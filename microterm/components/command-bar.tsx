'use client';

import { useState, useEffect, useCallback } from 'react';
import { Command } from 'cmdk';
import { Terminal, Zap, TrendingUp, FileText, Waves, Newspaper, X, Search } from 'lucide-react';
import { useAgent } from '@/lib/agent-context';
import { toast } from 'sonner';

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandBar({ isOpen, onClose }: CommandBarProps) {
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { executeCommand, isExecuting } = useAgent();

  // Load command history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('microterm_command_history');
    if (saved) {
      setCommandHistory(JSON.parse(saved));
    }
  }, []);

  // Save command history
  const saveHistory = useCallback((command: string) => {
    const newHistory = [command, ...commandHistory.slice(0, 49)]; // Keep last 50
    setCommandHistory(newHistory);
    localStorage.setItem('microterm_command_history', JSON.stringify(newHistory));
  }, [commandHistory]);

  // Handle command execution
  const handleExecute = async (command: string) => {
    if (!command.trim()) return;

    saveHistory(command);
    setInput('');
    setHistoryIndex(-1);

    try {
      const result = await executeCommand(command);
      
      if (result.success) {
        toast.success(result.message || 'Command executed successfully');
        onClose();
      } else {
        toast.error(result.message || 'Command failed');
      }
    } catch (error) {
      toast.error('Failed to execute command');
      console.error('Command execution error:', error);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open/close
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }

      // Arrow up/down for history
      if (isOpen && commandHistory.length > 0) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (historyIndex === 0) {
            setHistoryIndex(-1);
            setInput('');
          } else if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setInput(commandHistory[newIndex]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, commandHistory, historyIndex]);

  if (!isOpen) return null;

  const suggestions = [
    {
      icon: <FileText className="w-4 h-4" />,
      command: 'unlock all AI deals over $50M',
      description: 'Auto-unlock AI sector deals above $50M',
    },
    {
      icon: <Waves className="w-4 h-4" />,
      command: 'copy last whale trade',
      description: 'Copy the most recent whale transaction',
    },
    {
      icon: <Newspaper className="w-4 h-4" />,
      command: 'summarize latest deal',
      description: 'Get AI summary of newest SEC filing',
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      command: 'auto-unlock whale alerts from Binance',
      description: 'Automatically unlock Binance whale movements',
    },
    {
      icon: <Zap className="w-4 h-4" />,
      command: 'show agent status',
      description: 'Display agent balance and active rules',
    },
  ];

  const filteredSuggestions = input.trim()
    ? suggestions.filter((s) =>
        s.command.toLowerCase().includes(input.toLowerCase())
      )
    : suggestions;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Command
        className="w-full max-w-2xl mx-4 bg-[#0A0A0F] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in zoom-in-95 duration-200"
        shouldFilter={false}
      >
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
          <Search className="w-5 h-5 text-slate-400" />
          <Command.Input
            value={input}
            onValueChange={setInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim()) {
                e.preventDefault();
                handleExecute(input);
              }
            }}
            placeholder="Ask your agent to do something..."
            className="flex-1 bg-transparent text-lg text-white placeholder:text-slate-500 outline-none font-medium"
            autoFocus
            disabled={isExecuting}
          />
          <div className="flex items-center gap-2">
             <button
              onClick={onClose}
              className="p-1 rounded hover:bg-white/10 text-slate-400 transition-colors"
            >
              <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] font-sans">ESC</kbd>
            </button>
          </div>
        </div>

        <Command.List className="max-h-[400px] overflow-y-auto p-2">
          {filteredSuggestions.length === 0 && input.trim() && (
            <div className="px-4 py-12 text-center text-slate-500">
              <Zap className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm">
                Press <span className="text-white font-medium">Enter</span> to execute command
              </p>
            </div>
          )}

          {filteredSuggestions.length > 0 && (
            <div className="px-2 py-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
              Suggestions
            </div>
          )}

          {filteredSuggestions.map((suggestion, index) => (
            <Command.Item
              key={index}
              value={suggestion.command}
              onSelect={() => {
                setInput(suggestion.command);
              }}
              className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-white/5 data-[selected=true]:bg-white/5 transition-colors group"
            >
              <div className="p-2 rounded-md bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                {suggestion.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                  {suggestion.command}
                </div>
                <div className="text-xs text-slate-500">
                  {suggestion.description}
                </div>
              </div>
            </Command.Item>
          ))}

          {commandHistory.length > 0 && !input.trim() && (
            <>
              <div className="px-2 py-1.5 mt-2 text-xs font-medium text-slate-500 uppercase tracking-wider border-t border-white/5 pt-3">
                Recent
              </div>
              {commandHistory.slice(0, 3).map((cmd, index) => (
                <Command.Item
                  key={`history-${index}`}
                  value={cmd}
                  onSelect={() => setInput(cmd)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/5 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <div className="p-1.5 text-slate-500">
                    <Terminal className="w-3.5 h-3.5" />
                  </div>
                  {cmd}
                </Command.Item>
              ))}
            </>
          )}
        </Command.List>

        {isExecuting && (
          <div className="px-4 py-2 border-t border-white/5 bg-blue-500/5 flex items-center justify-center gap-2 text-xs text-blue-400">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Agent is processing your request...
          </div>
        )}
      </Command>
    </div>
  );
}

// Floating command button
export function CommandButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-600/30 hover:scale-105 transition-all duration-200 flex items-center justify-center group z-40"
      title="Open Command Bar (⌘K)"
    >
      <Terminal className="w-5 h-5" />
    </button>
  );
}
