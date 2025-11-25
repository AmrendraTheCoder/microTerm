import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';

const MICRO_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_MICRO_TOKEN_CONTRACT as `0x${string}`;

export function useLoyalty() {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState(0);
  
  // Mock balance logic for hackathon demo
  // In production, use useBalance from wagmi
  useEffect(() => {
    if (isConnected) {
      // Simulate a balance for demo users
      setBalance(150); 
    } else {
      setBalance(0);
    }
  }, [isConnected]);

  const tier = balance >= 1000 ? 'Diamond' : balance >= 500 ? 'Gold' : balance >= 100 ? 'Silver' : 'Bronze';
  
  const freeUnlocksPerDay = {
    Diamond: 3,
    Gold: 2,
    Silver: 1,
    Bronze: 0,
  }[tier];

  return {
    balance,
    tier,
    freeUnlocksPerDay,
    hasFreeUnlock: freeUnlocksPerDay > 0, // Simplified logic: just checks if they have allowance, ignoring used count for now
  };
}

