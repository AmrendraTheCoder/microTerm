"use client";

import { useState, useEffect } from "react";
import { BlurredCard } from "@/components/blurred-card";
import { TickerTape } from "@/components/ticker-tape";
import { WalletConnect } from "@/components/wallet-connect";
import { CommandBar, CommandButton } from "@/components/command-bar";
import { AgentMonitor } from "@/components/agent-monitor";
import { SwapModal, QuickSwapButton } from "@/components/swap-modal";
import { SummaryButton } from "@/components/summary-button";
import { TokenGateBanner } from "@/components/token-gate-banner";
import { NFTGallery } from "@/components/nft-gallery";
import { ShareButton } from "@/components/share-button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Activity, Zap, TrendingUp, Newspaper, Home as HomeIcon, Briefcase, Layers, BarChart3, Scale } from "lucide-react";
import { useDeals, useAlerts, useNews, WhaleAlert } from "@/lib/hooks/use-data";

type NewsCategory = "all" | "deals" | "defi" | "markets" | "regulation";

// Generate deterministic gradient based on title and sentiment
function getNewsImageGradient(title: string, sentiment?: string) {
  const hash = title.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 60) % 360;
  
  // Adjust colors based on sentiment
  let saturation = 70;
  let lightness = 45;
  
  if (sentiment === 'Bullish') {
    return `linear-gradient(135deg, hsl(140, ${saturation}%, ${lightness}%), hsl(170, ${saturation}%, ${lightness - 10}%))`;
  } else if (sentiment === 'Bearish') {
    return `linear-gradient(135deg, hsl(0, ${saturation}%, ${lightness}%), hsl(20, ${saturation}%, ${lightness - 10}%))`;
  }
  
  return `linear-gradient(135deg, hsl(${hue1}, ${saturation}%, ${lightness}%), hsl(${hue2}, ${saturation}%, ${lightness - 10}%))`;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [agentMonitorOpen, setAgentMonitorOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NewsCategory>("all");

  // Swap Modal State
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedSwapToken, setSelectedSwapToken] = useState<{
    address: string;
    symbol: string;
  } | null>(null);

  // Data Hooks
  const { data: deals, isLoading: dealsLoading } = useDeals(5);
  const { data: alerts, isLoading: alertsLoading } = useAlerts(5);
  const { data: news, isLoading: newsLoading } = useNews(8);

  const newsItems = news || [];
  const topStory = newsItems[0];
  const remainingNews = newsItems.slice(1);

  const categories = [
    { id: "all" as NewsCategory, label: "Home", icon: HomeIcon },
    { id: "deals" as NewsCategory, label: "Deal Flow", icon: Briefcase },
    { id: "defi" as NewsCategory, label: "DeFi", icon: Layers },
    { id: "markets" as NewsCategory, label: "Markets", icon: BarChart3 },
    { id: "regulation" as NewsCategory, label: "Regulation", icon: Scale },
  ];

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle Cmd+K shortcut - Fixed window error
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandBarOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCopyTrade = (alert: WhaleAlert) => {
    if (alert.token_address && alert.is_tradeable) {
      setSelectedSwapToken({
        address: alert.token_address,
        symbol: alert.token_symbol,
      });
      setSwapModalOpen(true);
    }
  };

  return (
    <main className="min-h-screen flex flex-col pb-20 selection:bg-blue-500/20">
      {/* Premium Glass Header - Enhanced */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#030305]/90 backdrop-blur-2xl border-b border-white/5 transition-all duration-300">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-violet-600/5 to-purple-600/5 pointer-events-none" />

        <div className="relative flex items-center justify-between max-w-7xl mx-auto w-full h-16 md:h-18 px-4 md:px-6">
          {/* Left: Logo & Branding */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Animated Logo */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                <span className="font-bold text-white text-sm md:text-base">
                  µ
                </span>
              </div>
            </div>

            {/* Brand Name */}
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-violet-200 tracking-tight">
                MicroTerm
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">
                <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                BETA
              </span>
            </div>
          </div>

          {/* Right: Actions & Wallet */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Command Bar Trigger - Desktop */}
            {/* <CommandButton 
              onClick={() => setCommandBarOpen(true)}
              className="hidden lg:flex"
            /> */}

            {/* Agent Status - Desktop */}
            <button
              onClick={() => setAgentMonitorOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border border-green-500/20 hover:border-green-500/40 text-xs font-medium text-green-400 transition-all duration-200 hover:scale-105 active:scale-95 group"
            >
              <div className="relative">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-green-500 animate-ping opacity-75" />
              </div>
              <span className="group-hover:text-green-300 transition-colors">
                Agent Active
              </span>
            </button>

            {/* Divider */}
            <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />

            {/* Wallet Connect */}
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-18" />

      {/* Category Navigation - Google News Style */}
      <nav className="sticky top-16 md:top-18 z-30 bg-[#030305]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeCategory === category.id
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <span className="text-base">{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Ticker Tape - Modern Style */}
      <div className="border-b border-white/5 bg-[#05050A]/50">
        <TickerTape />
      </div>

      {/* Main Content Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-8">
        
        {/* Your Briefing Section - Always visible */}
        {activeCategory === 'all' && (
          <section className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Your briefing</h2>
                <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                  Curated market stories, private deals, and on-chain flows in one view
                </p>
              </div>
              <span className="text-sm text-slate-400 whitespace-nowrap mt-1">
                {mounted ? new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                }) : 'Loading...'}
              </span>
            </div>

            {newsLoading || !topStory ? (
              <div className="web3-card p-6 grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">
                <div className="md:col-span-2">
                  <Skeleton className="h-56 md:h-64 w-full bg-white/5 rounded-xl" />
                </div>
                <div className="md:col-span-3 space-y-4">
                  <Skeleton className="h-5 w-32 bg-white/5 rounded-full" />
                  <Skeleton className="h-8 w-3/4 bg-white/5" />
                  <Skeleton className="h-5 w-full bg-white/5" />
                  <Skeleton className="h-5 w-5/6 bg-white/5" />
                  <div className="pt-4 border-t border-white/5">
                    <Skeleton className="h-8 w-24 bg-white/5 rounded-full" />
                  </div>
                </div>
              </div>
            ) : (
              <a
                href={topStory.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="web3-card overflow-hidden grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 p-6">
                  <div 
                    className="relative md:col-span-2 h-56 md:h-64 rounded-xl overflow-hidden flex items-center justify-center"
                    style={{ background: getNewsImageGradient(topStory.title, topStory.sentiment) }}
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                    <div className="relative z-10 text-white/90 text-center p-6">
                      <Newspaper className="w-14 h-14 mx-auto mb-3 opacity-60" />
                      <p className="text-sm font-medium opacity-75">{topStory.source}</p>
                    </div>
                  </div>
                  <div className="md:col-span-3 flex flex-col justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5 text-xs">
                        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
                          Top story
                        </span>
                        <span className="text-slate-500">
                          {topStory.source} •{' '}
                          {new Date(topStory.published_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-blue-100 leading-tight tracking-tight">
                        {topStory.title}
                      </h3>
                      <p className="text-base md:text-lg text-slate-300 leading-relaxed">
                        {topStory.summary}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-4 border-t border-white/5">
                      <span
                        className={`px-3 py-1.5 rounded-full font-medium ${
                          topStory.sentiment === 'Bullish'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : topStory.sentiment === 'Bearish'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}
                      >
                        {topStory.sentiment}
                      </span>
                      <span className="text-slate-400 group-hover:text-slate-300 transition-colors flex items-center gap-1">
                        Read on source ↗
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            )}
          </section>
        )}

        {/* For you section - Horizontal scroll */}
        {activeCategory === 'all' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">For you</h2>
                <span className="text-lg text-slate-500">›</span>
              </div>
              <p className="text-sm text-slate-400 hidden md:block">Recommended based on your interests</p>
            </div>

            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
              {newsLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="web3-card min-w-[320px] p-5 space-y-3">
                    <Skeleton className="h-5 w-32 bg-white/5" />
                    <Skeleton className="h-6 w-full bg-white/5" />
                    <Skeleton className="h-4 w-3/4 bg-white/5" />
                  </div>
                ))
              ) : (
                remainingNews.slice(0, 4).map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group web3-card min-w-[320px] p-5 space-y-3 hover:border-blue-500/30 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium">{item.source}</span>
                      <span>•</span>
                      <span>{new Date(item.published_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-base font-semibold text-white group-hover:text-blue-100 leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          item.sentiment === 'Bullish'
                            ? 'bg-green-500/10 text-green-400'
                            : item.sentiment === 'Bearish'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-slate-500/10 text-slate-400'
                        }`}
                      >
                        {item.sentiment}
                      </span>
                      <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
                        Read more →
                      </span>
                    </div>
                  </a>
                ))
              )}
            </div>
          </section>
        )}

        {/* Category-specific content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Left Column (Feeds) - Span 7 */}
        <div className="lg:col-span-7 space-y-10">
          <TokenGateBanner />

          {/* SEC Filings - Show for 'all' and 'deals' */}
          {(activeCategory === 'all' || activeCategory === 'deals') && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="p-1.5 rounded bg-blue-500/10 text-blue-400">
                  <FileText className="w-4 h-4" />
                </span>
                Private Deal Flow
              </h2>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Live Feed
              </span>
            </div>

            <div className="space-y-4">
              {dealsLoading
                ? Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="web3-card p-6 space-y-3">
                        <Skeleton className="h-6 w-2/3 bg-white/5" />
                        <Skeleton className="h-4 w-1/3 bg-white/5" />
                        <Skeleton className="h-20 w-full bg-white/5" />
                      </div>
                    ))
                : deals?.map((deal) => (
                    <BlurredCard
                      key={deal.id}
                      id={deal.id.toString()}
                      title={deal.company_name}
                      description={`${deal.sector} • Filed ${new Date(
                        deal.filed_at
                      ).toLocaleDateString()}`}
                      type="deal"
                      cost={0.5}
                      preview={
                        <div className="grid grid-cols-3 gap-4 py-2 opacity-50">
                          <div className="space-y-1">
                            <div className="text-xs text-slate-500">Amount</div>
                            <div className="h-4 w-16 bg-slate-700/50 rounded animate-pulse" />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-slate-500">
                              Valuation
                            </div>
                            <div className="h-4 w-16 bg-slate-700/50 rounded animate-pulse" />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-slate-500">
                              Investors
                            </div>
                            <div className="h-4 w-16 bg-slate-700/50 rounded animate-pulse" />
                          </div>
                        </div>
                      }
                      fullContent={
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4 p-3 bg-white/5 rounded-lg border border-white/5">
                            <div>
                              <div className="text-xs text-slate-400 mb-1">
                                Raised
                              </div>
                              <div className="text-lg font-bold text-white">
                                ${(deal.amount_raised / 1000000).toFixed(1)}M
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-400 mb-1">
                                Sector
                              </div>
                              <div className="text-sm font-medium text-blue-300">
                                {deal.sector}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-400 mb-1">
                                Source
                              </div>
                              <a
                                href={deal.filing_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 hover:text-blue-300 underline"
                              >
                                SEC.gov ↗
                              </a>
                            </div>
                          </div>
                          <div className="pt-1">
                            <SummaryButton
                              type="deal"
                              itemId={deal.id.toString()}
                              data={deal}
                            />
                          </div>
                        </div>
                      }
                    />
                  ))}
            </div>
          </section>
          )}

          {/* Whale Alerts - Show for 'all' and 'defi' */}
          {(activeCategory === 'all' || activeCategory === 'defi') && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="p-1.5 rounded bg-violet-500/10 text-violet-400">
                  <Activity className="w-4 h-4" />
                </span>
                Whale Activity
              </h2>
            </div>
            <div className="space-y-4">
              {alertsLoading
                ? Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="web3-card p-6 space-y-3">
                        <Skeleton className="h-6 w-2/3 bg-white/5" />
                        <Skeleton className="h-4 w-1/3 bg-white/5" />
                      </div>
                    ))
                : alerts?.map((alert) => (
                    <BlurredCard
                      key={alert.id}
                      id={alert.id.toString()}
                      title={`${alert.token_symbol} Movement`}
                      description={`${alert.sender_label} → ${alert.receiver_label}`}
                      type="alert"
                      cost={0.25}
                      preview={
                        <div className="flex items-center justify-between py-2 opacity-50">
                          <div className="space-y-1">
                            <div className="text-xs text-slate-500">Value</div>
                            <div className="h-5 w-24 bg-slate-700/50 rounded animate-pulse" />
                          </div>
                          <div className="h-8 w-24 bg-slate-700/30 rounded animate-pulse" />
                        </div>
                      }
                      fullContent={
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                            <div>
                              <div className="text-xs text-slate-400 mb-1">
                                Transaction Value
                              </div>
                              <div className="text-lg font-bold text-white tracking-tight">
                                {alert.amount.toLocaleString()}{" "}
                                <span className="text-violet-400">
                                  {alert.token_symbol}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-500 font-mono">
                                {alert.tx_hash.slice(0, 8)}...
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {alert.is_tradeable && alert.token_address && (
                              <QuickSwapButton
                                tokenAddress={alert.token_address}
                                tokenSymbol={alert.token_symbol}
                                onClick={() => handleCopyTrade(alert)}
                              />
                            )}
                            <div
                              className={alert.is_tradeable ? "" : "col-span-2"}
                            >
                              <SummaryButton
                                type="alert"
                                itemId={alert.id.toString()}
                                data={alert}
                              />
                            </div>
                          </div>
                        </div>
                      }
                    />
                  ))}
            </div>
          </section>
          )}
        </div>

        {/* Right Column (News & Agent) - Span 5 */}
        <div className="lg:col-span-5 space-y-8">
          {/* Agent Card - Always show */}
          {activeCategory === 'all' && (
          <div className="web3-card p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all duration-500" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 animate-pulse">
                  <Zap className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Autonomous Agent</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-xs text-slate-400">
                      Monitoring Markets
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Your agent is scanning SEC filings and whale movements in
                real-time. Give it a command to automate your research.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCommandBarOpen(true)}
                  className="btn-glass text-sm font-medium text-white"
                >
                  Command (⌘K)
                </button>
                <button
                  onClick={() => setAgentMonitorOpen(true)}
                  className="btn-glass text-sm font-medium text-blue-300 bg-blue-500/10 border-blue-500/20"
                >
                  View Logs
                </button>
              </div>
            </div>
          </div>
          )}

          {/* News Feed - Show for 'all', 'markets', 'regulation' */}
          {(activeCategory === 'all' || activeCategory === 'markets' || activeCategory === 'regulation') && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="p-1.5 rounded bg-green-500/10 text-green-400">
                  <Newspaper className="w-4 h-4" />
                </span>
                Market Intelligence
              </h2>
            </div>

            <div className="space-y-4">
              {newsLoading
                ? Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="web3-card p-6 space-y-3">
                        <Skeleton className="h-4 w-full bg-white/5" />
                        <Skeleton className="h-4 w-2/3 bg-white/5" />
                      </div>
                    ))
                : news?.map((item) => (
                    <BlurredCard
                      key={item.id}
                      id={item.id.toString()}
                      title={item.title}
                      description={`${item.source} • ${new Date(
                        item.published_at
                      ).toLocaleTimeString()}`}
                      type="news"
                      cost={0.1}
                      preview={
                        <div className="space-y-2 opacity-50">
                          <div className="h-3 w-full bg-slate-700/30 rounded" />
                          <div className="h-3 w-3/4 bg-slate-700/30 rounded" />
                          <div className="flex gap-2 mt-2">
                            <div className="h-4 w-16 bg-slate-700/30 rounded-full" />
                            <div className="h-4 w-16 bg-slate-700/30 rounded-full" />
                          </div>
                        </div>
                      }
                      fullContent={
                        <div className="space-y-4">
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {item.summary}
                          </p>
                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                item.sentiment === "Bullish"
                                  ? "bg-green-500/10 text-green-400"
                                  : item.sentiment === "Bearish"
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-slate-500/10 text-slate-400"
                              }`}
                            >
                              {item.sentiment}
                            </span>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-slate-500 hover:text-white transition-colors"
                            >
                              Source ↗
                            </a>
                          </div>
                          <div className="pt-1">
                            <SummaryButton
                              type="news"
                              itemId={item.id.toString()}
                              data={item}
                            />
                          </div>
                        </div>
                      }
                    />
                  ))}
            </div>
          </section>
          )}

          {/* NFT Gallery - Always show */}
          {activeCategory === 'all' && (
          <section>
            <NFTGallery />
          </section>
          )}
        </div>
      </div>
      </div>

      {/* UI Components */}
      <CommandBar
        isOpen={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
      />
      <CommandButton onClick={() => setCommandBarOpen(true)} />
      <AgentMonitor
        isOpen={agentMonitorOpen}
        onClose={() => setAgentMonitorOpen(false)}
      />

      <SwapModal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        tokenAddress={selectedSwapToken?.address}
        tokenSymbol={selectedSwapToken?.symbol}
      />
    </main>
  );
}
