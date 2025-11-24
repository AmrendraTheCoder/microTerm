'use client';

import { BlurredCard } from '@/components/blurred-card';
import { TickerTape } from '@/components/ticker-tape';
import { WalletConnect } from '@/components/wallet-connect';
import { mockDeals, mockWhaleAlerts, mockNews } from '@/lib/mock-data';
import { FileText, Waves, Newspaper } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-terminal-cyan">
              MICROTERM
            </h1>
            <span className="text-xs text-gray-500 font-mono">
              v0.1.0-alpha
            </span>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Ticker Tape */}
      <TickerTape />

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Left Panel - Feed */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-terminal-cyan mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              SEC Filings
            </h2>
            <div className="space-y-4">
              {mockDeals.map((deal) => (
                <BlurredCard
                  key={deal.id}
                  id={deal.id}
                  title={deal.company_name}
                  description={`${deal.sector} • Filed ${new Date(deal.filed_at).toLocaleDateString()}`}
                  type="deal"
                  cost={0.50}
                  preview={
                    <div className="space-y-2">
                      <p className="text-sm">Amount Raised: $███████</p>
                      <p className="text-sm">Investors: ████████████</p>
                      <p className="text-sm">Valuation: $██████████</p>
                    </div>
                  }
                  fullContent={
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-gray-400">Amount Raised:</span>{' '}
                        <span className="text-terminal-yellow font-bold">
                          ${(deal.amount_raised / 1000000).toFixed(0)}M
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-400">Investors:</span> Sequoia Capital, a16z, Tiger Global
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-400">Valuation:</span> $4.5B
                      </p>
                      <a
                        href={deal.filing_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-terminal-cyan hover:underline text-sm"
                      >
                        View SEC Filing →
                      </a>
                    </div>
                  }
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-terminal-cyan mb-4 flex items-center gap-2">
              <Waves className="w-5 h-5" />
              Whale Alerts
            </h2>
            <div className="space-y-4">
              {mockWhaleAlerts.map((alert) => (
                <BlurredCard
                  key={alert.id}
                  id={alert.id}
                  title={`${alert.token_symbol} Transfer`}
                  description={`${alert.sender_label} → ${alert.receiver_label}`}
                  type="alert"
                  cost={0.25}
                  preview={
                    <div className="space-y-2">
                      <p className="text-sm">Amount: ████████ {alert.token_symbol}</p>
                      <p className="text-sm">Transaction: {alert.tx_hash}</p>
                    </div>
                  }
                  fullContent={
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-gray-400">Amount:</span>{' '}
                        <span className="text-terminal-yellow font-bold">
                          {alert.amount.toLocaleString()} {alert.token_symbol}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-400">Transaction:</span>{' '}
                        <a
                          href={`https://basescan.org/tx/${alert.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-terminal-cyan hover:underline"
                        >
                          {alert.tx_hash}
                        </a>
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - News & Analysis */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-terminal-cyan mb-4 flex items-center gap-2">
              <Newspaper className="w-5 h-5" />
              Market News
            </h2>
            <div className="space-y-4">
              {mockNews.map((news) => (
                <BlurredCard
                  key={news.id}
                  id={news.id}
                  title={news.title}
                  description={`${news.source} • ${new Date(news.published_at).toLocaleTimeString()}`}
                  type="news"
                  cost={0.10}
                  preview={
                    <div className="space-y-2">
                      <p className="text-sm">Analysis: ████████████████████</p>
                      <p className="text-sm">Impact: ████████</p>
                    </div>
                  }
                  fullContent={
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-gray-400">Summary:</span> {news.summary}
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-400">Sentiment:</span>{' '}
                        <span className={news.sentiment === 'Bullish' ? 'text-green-500' : 'text-red-500'}>
                          {news.sentiment}
                        </span>
                      </p>
                      <p className="text-sm text-gray-400">
                        <span className="font-bold">Impact Analysis:</span> This development is likely to
                        increase institutional adoption and drive positive price action across major
                        cryptocurrencies in the short to medium term.
                      </p>
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

