'use client';

import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import {
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import { useAccount } from 'wagmi';
import { Wallet as WalletIcon, ChevronDown } from 'lucide-react';

export function WalletConnect() {
  const { address, isConnected } = useAccount();

  return (
    <Wallet>
      <ConnectWallet className="!bg-gradient-to-r !from-blue-600 !to-violet-600 !text-white !font-semibold !px-4 !py-2 !rounded-full !shadow-lg !shadow-blue-500/20 hover:!shadow-blue-500/40 hover:!scale-105 !transition-all !duration-200 !border-0 !text-sm flex items-center gap-2">
        {isConnected ? (
          <>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="font-mono text-xs">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </>
        ) : (
          <>
            <WalletIcon className="w-4 h-4" />
            <span>Connect Wallet</span>
          </>
        )}
      </ConnectWallet>
      <WalletDropdown className="!bg-[#0A0A0F] !border !border-white/10 !rounded-xl !shadow-2xl !p-2">
        <WalletDropdownDisconnect className="!text-red-400 hover:!bg-red-500/10 !rounded-lg !transition-colors" />
      </WalletDropdown>
    </Wallet>
  );
}
