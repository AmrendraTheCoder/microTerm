'use client';

import { useAccount } from 'wagmi';
import { Image, ExternalLink, Award, Calendar, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NFTReceipt {
  tokenId: number;
  itemType: string;
  itemId: number;
  pricePaid: number;
  timestamp: number;
  txHash: string;
}

export function NFTGallery() {
  const { address, isConnected } = useAccount();
  const [receipts, setReceipts] = useState<NFTReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      // Mock data for demo - in production, fetch from contract or API
      setTimeout(() => {
        setReceipts([
          {
            tokenId: 1,
            itemType: 'deal',
            itemId: 42,
            pricePaid: 0.50,
            timestamp: Date.now() - 86400000,
            txHash: '0x1234...5678',
          },
          {
            tokenId: 2,
            itemType: 'alert',
            itemId: 128,
            pricePaid: 0.25,
            timestamp: Date.now() - 172800000,
            txHash: '0xabcd...efgh',
          },
        ]);
        setIsLoading(false);
      }, 1000);
    }
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <div className="web3-card p-8 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">NFT Receipt Gallery</h3>
        <p className="text-sm text-slate-400 mb-4">
          Connect your wallet to view your unlock receipts
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="web3-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-violet-400" />
          Your NFT Receipts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4 animate-pulse">
              <div className="h-32 bg-white/10 rounded mb-3" />
              <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="web3-card p-8 text-center">
        <div className="w-16 h-16 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-violet-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Receipts Yet</h3>
        <p className="text-sm text-slate-400">
          Unlock premium content to earn NFT receipts
        </p>
      </div>
    );
  }

  return (
    <div className="web3-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-violet-400" />
          Your NFT Receipts
        </h3>
        <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-full">
          {receipts.length} Total
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {receipts.map((receipt) => (
          <div
            key={receipt.tokenId}
            className="group relative bg-gradient-to-br from-violet-900/20 to-blue-900/20 border border-violet-500/20 rounded-lg p-4 hover:border-violet-500/40 transition-all duration-300 overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
              {/* Token ID Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-2 py-1 rounded border border-violet-500/20">
                  #{receipt.tokenId}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  receipt.itemType === 'deal' ? 'bg-blue-500/10 text-blue-400' :
                  receipt.itemType === 'alert' ? 'bg-violet-500/10 text-violet-400' :
                  'bg-green-500/10 text-green-400'
                }`}>
                  {receipt.itemType.toUpperCase()}
                </span>
              </div>

              {/* Visual Representation */}
              <div className="bg-black/30 rounded-lg p-6 mb-3 flex items-center justify-center border border-white/5">
                <Image className="w-12 h-12 text-violet-400/50" />
              </div>

              {/* Details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Paid
                  </span>
                  <span className="text-white font-medium">${receipt.pricePaid.toFixed(2)} USDC</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Date
                  </span>
                  <span className="text-slate-300">
                    {new Date(receipt.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* View on Explorer */}
              <a
                href={`https://sepolia.basescan.org/tx/${receipt.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors py-2 bg-blue-500/5 rounded-lg border border-blue-500/10 hover:bg-blue-500/10"
              >
                <ExternalLink className="w-3 h-3" />
                View on BaseScan
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

