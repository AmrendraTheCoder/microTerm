export const mockDeals = [
  {
    id: 'deal-1',
    company_name: 'Anthropic',
    amount_raised: 450000000,
    sector: 'AI',
    filing_url: 'https://sec.gov/...',
    filed_at: new Date().toISOString(),
  },
  {
    id: 'deal-2',
    company_name: 'Stripe',
    amount_raised: 65000000000,
    sector: 'Fintech',
    filing_url: 'https://sec.gov/...',
    filed_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'deal-3',
    company_name: 'SpaceX',
    amount_raised: 750000000,
    sector: 'Aerospace',
    filing_url: 'https://sec.gov/...',
    filed_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const mockWhaleAlerts = [
  {
    id: 'whale-1',
    tx_hash: '0x1234...5678',
    sender_label: 'Wintermute Trading',
    receiver_label: 'Binance Hot Wallet',
    token_symbol: 'USDC',
    amount: 5000000,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'whale-2',
    tx_hash: '0xabcd...ef01',
    sender_label: 'Jump Trading',
    receiver_label: 'Uniswap V3: USDC/ETH',
    token_symbol: 'ETH',
    amount: 2500,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'whale-3',
    tx_hash: '0x9876...5432',
    sender_label: 'Coinbase Custody',
    receiver_label: 'Unknown Wallet',
    token_symbol: 'USDC',
    amount: 10000000,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const mockNews = [
  {
    id: 'news-1',
    title: 'SEC Approves Bitcoin ETF Applications',
    summary: 'Major regulatory milestone for cryptocurrency adoption',
    sentiment: 'Bullish',
    source: 'Reuters',
    published_at: new Date().toISOString(),
  },
  {
    id: 'news-2',
    title: 'Ethereum Upgrade Successfully Deployed',
    summary: 'Network efficiency improved by 40% following latest fork',
    sentiment: 'Bullish',
    source: 'CoinDesk',
    published_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'news-3',
    title: 'Federal Reserve Signals Rate Cut',
    summary: 'Potential boost for risk assets including crypto markets',
    sentiment: 'Bullish',
    source: 'Bloomberg',
    published_at: new Date(Date.now() - 5400000).toISOString(),
  },
];

