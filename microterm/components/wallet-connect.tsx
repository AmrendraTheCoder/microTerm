'use client';

import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import {
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
  WalletDropdownLink,
} from '@coinbase/onchainkit/wallet';
import { useAccount, useBalance } from 'wagmi';
import { 
  Wallet as WalletIcon, 
  ChevronDown, 
  Power, 
  ExternalLink,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function WalletConnect() {
  const { address, isConnected, isConnecting } = useAccount();
  const [copied, setCopied] = useState(false);

  // Get ETH balance
  const { data: balance } = useBalance({
    address: address,
  });

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatBalance = (value: string | undefined) => {
    if (!value) return '0.00';
    const num = parseFloat(value);
    if (num < 0.0001) return '< 0.0001';
    return num.toFixed(4);
  };

  return (
    <Wallet>
      <ConnectWallet 
        className={`
          group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-full font-medium text-white transition-all duration-300 !bg-transparent !border-0 !p-0 min-w-[140px]
          ${!isConnected && !isConnecting ? 'bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 active:scale-95' : ''}
          ${isConnecting ? 'bg-gradient-to-br from-blue-600/80 via-violet-600/80 to-purple-600/80 cursor-wait' : ''}
          ${isConnected ? 'bg-[#0A0A0F] !border !border-white/10 hover:!border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 !px-4' : ''}
        `}
      >
        {/* Disconnected Content */}
        {!isConnected && !isConnecting && (
          <div className="relative z-10 flex items-center gap-2 w-full h-full px-6 bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 rounded-full">
             <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full" />
             <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
             
             <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm">
               <WalletIcon className="w-4 h-4" />
             </div>
             <span className="text-sm font-semibold tracking-wide">Connect Wallet</span>
             <Sparkles className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        {/* Connecting Content */}
        {isConnecting && (
           <div className="relative z-10 flex items-center gap-2 w-full h-full px-6 bg-gradient-to-br from-blue-600/80 via-violet-600/80 to-purple-600/80 rounded-full">
             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             <span className="text-sm font-semibold">Connecting...</span>
           </div>
        )}

        {/* Connected Content */}
        {isConnected && address && (
          <div className="relative z-10 flex items-center gap-2.5 w-full h-full">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-mono text-slate-400 leading-none mb-0.5">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              {balance && (
                <span className="text-[10px] font-semibold text-blue-400 leading-none">
                  {formatBalance(balance.formatted)} {balance.symbol}
                </span>
              )}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
          </div>
        )}
      </ConnectWallet>

      {/* Enhanced Dropdown Menu */}
      <WalletDropdown className="!bg-[#0A0A0F] !border !border-white/10 !rounded-2xl !shadow-2xl !shadow-black/50 !p-3 !mt-2 !min-w-[280px]">
        {/* Account Info Section */}
        {isConnected && address && (
          <div className="px-3 py-3 mb-2 rounded-xl bg-gradient-to-br from-blue-600/10 to-violet-600/10 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Connected Account</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-semibold text-green-400">Active</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-mono text-white">
                {address.slice(0, 8)}...{address.slice(-6)}
              </span>
              <button
                onClick={copyAddress}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                )}
              </button>
            </div>

            {balance && (
              <div className="mt-2 pt-2 border-t border-white/5">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-white">
                    {formatBalance(balance.formatted)}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {balance.symbol}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View on Explorer */}
        {address && (
          <WalletDropdownLink 
            href={`https://basescan.org/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="!flex !items-center !gap-2 !px-3 !py-2.5 !rounded-lg !text-slate-300 hover:!text-white hover:!bg-white/5 !transition-all !duration-200 !mb-1"
          >
            <ExternalLink className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">View on BaseScan</span>
          </WalletDropdownLink>
        )}

        {/* Disconnect Button */}
        <WalletDropdownDisconnect className="!flex !items-center !gap-2 !px-3 !py-2.5 !rounded-lg !text-red-400 hover:!text-red-300 hover:!bg-red-500/10 !transition-all !duration-200 !border !border-red-500/20 hover:!border-red-500/40">
          <Power className="w-4 h-4" />
          <span className="text-sm font-medium">Disconnect</span>
        </WalletDropdownDisconnect>
      </WalletDropdown>
    </Wallet>
  );
}