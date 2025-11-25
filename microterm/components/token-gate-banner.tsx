'use client';

import { useAccount, useBalance } from 'wagmi';
import { Crown, Shield, Sparkles, LockOpen } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';

const MICRO_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_MICRO_TOKEN_CONTRACT as `0x${string}`;
// If not deployed yet, we can mock or hide

export function TokenGateBanner() {
  const { address, isConnected } = useAccount();
  
  // Mock balance for demo if contract address isn't set
  const [mockBalance, setMockBalance] = useState(0);

  // In a real app, use useBalance
  /*
  const { data: balanceData } = useBalance({
    address,
    token: MICRO_TOKEN_ADDRESS,
  });
  */
  
  // For hackathon demo, we can simulate balance increasing
  useEffect(() => {
    if (isConnected) {
      setMockBalance(150); // Start with enough for Silver tier
    }
  }, [isConnected]);

  if (!isConnected) return null;

  const balance = mockBalance; // balanceData?.value ? Number(formatUnits(balanceData.value, 18)) : 0;

  let tier = 'Bronze';
  let nextTier = 'Silver';
  let progress = (balance / 100) * 100;
  let perks = 'Pay per unlock';

  if (balance >= 1000) {
    tier = 'Diamond';
    nextTier = 'Max';
    progress = 100;
    perks = '3 Free Unlocks / Day';
  } else if (balance >= 500) {
    tier = 'Gold';
    nextTier = 'Diamond';
    progress = ((balance - 500) / 500) * 100;
    perks = '2 Free Unlocks / Day';
  } else if (balance >= 100) {
    tier = 'Silver';
    nextTier = 'Gold';
    progress = ((balance - 100) / 400) * 100;
    perks = '1 Free Unlock / Day';
  }

  return (
    <div className="web3-card p-4 mb-8 bg-gradient-to-r from-blue-900/20 to-violet-900/20 border-blue-500/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 text-white shadow-lg shadow-orange-500/20">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              {tier} Member
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono border border-white/10">
                {balance} $MICRO
              </span>
            </h3>
            <p className="text-xs text-blue-300 flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3" />
              {perks}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400 mb-1">Next Tier: {nextTier}</div>
          <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </div>
      
      {balance >= 100 && (
        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/5 p-2 rounded border border-green-500/10">
          <LockOpen className="w-3 h-3" />
          You have a free unlock available today!
        </div>
      )}
    </div>
  );
}

