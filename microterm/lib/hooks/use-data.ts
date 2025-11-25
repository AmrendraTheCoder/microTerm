import { useQuery, UseQueryResult } from '@tanstack/react-query';

export interface Deal {
  id: number;
  company_name: string;
  amount_raised: number;
  filing_url: string;
  sector: string;
  filed_at: string;
  is_premium: boolean;
}

export interface WhaleAlert {
  id: number;
  tx_hash: string;
  sender_address: string;
  sender_label: string;
  receiver_address: string;
  receiver_label: string;
  token_symbol: string;
  token_address?: string;
  amount: number;
  dex_pool?: string;
  is_tradeable: boolean;
  timestamp: string;
  is_premium: boolean;
}

export interface News {
  id: number;
  title: string;
  summary: string;
  sentiment: string;
  source: string;
  url: string;
  published_at: string;
  is_premium: boolean;
}

export interface MarketData {
  id: number;
  symbol: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  updated_at: string;
}

/**
 * Fetch SEC deals from API
 */
export function useDeals(limit = 10): UseQueryResult<Deal[], Error> {
  return useQuery({
    queryKey: ['deals', limit],
    queryFn: async () => {
      const res = await fetch(`/api/deals?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch deals');
      return res.json();
    },
    refetchInterval: 60000, // Refetch every 60 seconds
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}

/**
 * Fetch whale alerts from API
 */
export function useAlerts(limit = 10): UseQueryResult<WhaleAlert[], Error> {
  return useQuery({
    queryKey: ['alerts', limit],
    queryFn: async () => {
      const res = await fetch(`/api/alerts?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch alerts');
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds (more frequent for whale alerts)
    staleTime: 15000,
  });
}

/**
 * Fetch news from API
 */
export function useNews(limit = 10): UseQueryResult<News[], Error> {
  return useQuery({
    queryKey: ['news', limit],
    queryFn: async () => {
      const res = await fetch(`/api/news?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch news');
      return res.json();
    },
    refetchInterval: 60000, // Refetch every 60 seconds
    staleTime: 30000,
  });
}

/**
 * Fetch market data from API
 */
export function useMarketData(): UseQueryResult<MarketData[], Error> {
  return useQuery({
    queryKey: ['market'],
    queryFn: async () => {
      const res = await fetch('/api/market');
      if (!res.ok) throw new Error('Failed to fetch market data');
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000,
  });
}

/**
 * Fetch single deal by ID
 */
export function useDeal(id: string): UseQueryResult<Deal, Error> {
  return useQuery({
    queryKey: ['deal', id],
    queryFn: async () => {
      const res = await fetch(`/api/deals/${id}`);
      if (!res.ok) throw new Error('Failed to fetch deal');
      return res.json();
    },
    enabled: !!id,
  });
}

/**
 * Fetch single alert by ID
 */
export function useAlert(id: string): UseQueryResult<WhaleAlert, Error> {
  return useQuery({
    queryKey: ['alert', id],
    queryFn: async () => {
      const res = await fetch(`/api/alerts/${id}`);
      if (!res.ok) throw new Error('Failed to fetch alert');
      return res.json();
    },
    enabled: !!id,
  });
}

/**
 * Fetch single news item by ID
 */
export function useNewsItem(id: string): UseQueryResult<News, Error> {
  return useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      const res = await fetch(`/api/news/${id}`);
      if (!res.ok) throw new Error('Failed to fetch news');
      return res.json();
    },
    enabled: !!id,
  });
}

/**
 * Fetch AI summary for an item
 */
export function useSummary(type: string, itemId: string, data: any): UseQueryResult<{ summary: string }, Error> {
  return useQuery({
    queryKey: ['summary', type, itemId],
    queryFn: async () => {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, itemId, data }),
      });
      if (!res.ok) throw new Error('Failed to generate summary');
      return res.json();
    },
    enabled: !!type && !!itemId && !!data,
    staleTime: Infinity, // Summaries don't change, cache forever
  });
}

/**
 * Check unlock status for an item
 */
export function useUnlockStatus(
  userWallet: string | undefined,
  itemType: string,
  itemId: string
): UseQueryResult<{ unlocked: boolean }, Error> {
  return useQuery({
    queryKey: ['unlock-status', userWallet, itemType, itemId],
    queryFn: async () => {
      if (!userWallet) return { unlocked: false };
      
      const res = await fetch(
        `/api/unlock-status?wallet=${userWallet}&type=${itemType}&id=${itemId}`
      );
      if (!res.ok) return { unlocked: false };
      return res.json();
    },
    enabled: !!userWallet && !!itemType && !!itemId,
    staleTime: 60000,
  });
}

