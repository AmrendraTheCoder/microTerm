'use client';

import { Share2, Twitter, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
  description?: string;
  url?: string;
}

export function ShareButton({ title, description, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = description ? `${title} - ${description}` : title;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleFarcasterShare = () => {
    const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(farcasterUrl, '_blank', 'width=550,height=420');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-all duration-200 hover:text-white"
      >
        <Share2 className="w-3 h-3" />
        Share
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 bg-[#0A0A0F] border border-white/10 rounded-xl shadow-2xl p-2 min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              onClick={handleTwitterShare}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <Twitter className="w-4 h-4 text-blue-400" />
              Share on Twitter
            </button>
            
            <button
              onClick={handleFarcasterShare}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h16v16H4z" />
              </svg>
              Share on Farcaster
            </button>

            <div className="h-px bg-white/10 my-2" />

            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-slate-300 hover:text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

