'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketData {
  symbol: string;
  price: number;
  change_24h: number;
}

export function TickerTape() {
  const [marketData, setMarketData] = useState<MarketData[]>([
    { symbol: 'BTC', price: 64234, change_24h: 2.5 },
    { symbol: 'ETH', price: 3456, change_24h: -1.2 },
    { symbol: 'SOL', price: 145, change_24h: 5.8 },
    { symbol: 'NVDA', price: 892, change_24h: 1.4 },
    { symbol: 'COIN', price: 234, change_24h: -0.8 },
  ]);

  useEffect(() => {
    // Fetch market data from API
    const fetchMarketData = async () => {
      try {
        const response = await fetch('/api/market');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setMarketData(data);
          }
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };

    fetchMarketData();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Create duplicated array for seamless scrolling, with unique keys
  const duplicatedData = [...marketData, ...marketData];

  return (
    <div className="bg-zinc-900 border-b border-zinc-800 py-3 px-4 overflow-hidden">
      <div className="flex items-center gap-8 animate-scroll">
        {duplicatedData.map((data, index) => (
          <div key={`${data.symbol}-${index}`} className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-terminal-cyan font-bold">${data.symbol}:</span>
            <span className="text-terminal-fg">${data.price.toLocaleString()}</span>
            <span
              className={`flex items-center gap-1 text-sm ${
                data.change_24h >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {data.change_24h >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(data.change_24h).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
