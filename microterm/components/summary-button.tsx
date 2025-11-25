'use client';

import { useState } from 'react';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useSummary } from '@/lib/hooks/use-data';
import { toast } from 'sonner';

interface SummaryButtonProps {
  type: string;
  itemId: string;
  data: any;
}

export function SummaryButton({ type, itemId, data }: SummaryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // We only fetch when isOpen is true to save API calls
  const { data: summaryData, isLoading, error } = useSummary(
    isOpen ? type : '', 
    isOpen ? itemId : '', 
    isOpen ? data : null
  );

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
          isOpen 
            ? 'bg-zinc-800 text-terminal-cyan border border-terminal-cyan/30' 
            : 'bg-zinc-800/50 text-gray-400 hover:text-terminal-cyan hover:bg-zinc-800'
        }`}
      >
        {isOpen ? (
          <>Close Insight</>
        ) : (
          <>
            <BrainCircuit className="w-4 h-4" />
            Generate AI Insight
          </>
        )}
      </button>

      {isOpen && (
        <div className="mt-3 p-4 bg-zinc-900/80 border border-terminal-cyan/20 rounded-lg font-mono text-sm text-gray-300 animate-in fade-in slide-in-from-top-2">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 py-4 text-terminal-cyan">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing data patterns...</span>
            </div>
          ) : error ? (
            <div className="text-terminal-red py-2">
              Failed to generate summary. Please try again.
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="whitespace-pre-wrap">{summaryData?.summary}</div>
              <div className="mt-4 pt-2 border-t border-zinc-800 flex justify-between text-xs text-gray-500">
                <span>Model: {summaryData?.mode === 'openai' ? 'GPT-4' : 'MicroTerm AI'}</span>
                <span>Generated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

