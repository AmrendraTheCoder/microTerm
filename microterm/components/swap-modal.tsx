'use client';

import { useState } from 'react';
import { X, TrendingUp, AlertCircle } from 'lucide-react';
import { Swap, SwapAmountInput, SwapToggleButton, SwapButton, SwapMessage } from '@coinbase/onchainkit/swap';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenAddress?: string;
  tokenSymbol?: string;
  suggestedAmount?: number;
}

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base mainnet
// For testnet: 0x036CbD53842c5426634e7929541eC2318f3dCF7e

export function SwapModal({
  isOpen,
  onClose,
  tokenAddress,
  tokenSymbol = 'ETH',
  suggestedAmount = 0.01,
}: SwapModalProps) {
  const { address, isConnected } = useAccount();
  const [isSwapping, setIsSwapping] = useState(false);

  if (!isOpen) return null;

  const handleSwapSuccess = (txHash: string) => {
    toast.success(`Swap successful! Transaction: ${txHash.slice(0, 10)}...`);
    setIsSwapping(false);
    // Log to agent actions
    console.log('[Swap] Success:', txHash);
  };

  const handleSwapError = (error: Error) => {
    toast.error(`Swap failed: ${error.message}`);
    setIsSwapping(false);
    console.error('[Swap] Error:', error);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-terminal-cyan/30 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-terminal-cyan/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-terminal-cyan" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-terminal-cyan">Copy Trade</h2>
              <p className="text-xs text-gray-500">
                Replicate whale transaction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-terminal-fg transition-colors"
            disabled={isSwapping}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Whale Transaction Info */}
        {tokenSymbol && (
          <div className="mb-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Whale bought:</span>
              <span className="text-sm font-mono text-terminal-yellow">
                {tokenSymbol}
              </span>
            </div>
            {tokenAddress && (
              <div className="text-xs text-gray-500 font-mono break-all">
                {tokenAddress}
              </div>
            )}
          </div>
        )}

        {/* Warning */}
        <div className="mb-6 p-3 bg-terminal-yellow/10 border border-terminal-yellow/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-terminal-yellow mt-0.5 flex-shrink-0" />
          <div className="text-xs text-terminal-yellow">
            <strong>Risk Warning:</strong> Copy trading carries significant risk. Only invest what you can afford to lose. Past performance does not guarantee future results.
          </div>
        </div>

        {/* Swap Interface */}
        {!isConnected ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">Connect your wallet to start trading</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-terminal-cyan text-black rounded-lg hover:bg-terminal-cyan/90 transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        ) : tokenAddress ? (
          <div className="space-y-4">
            <Swap
              experimental={{
                useAggregator: true,
              }}
            >
              <SwapAmountInput
                label="You pay"
                swappableTokens={[
                  {
                    address: USDC_ADDRESS,
                    chainId: 8453, // Base mainnet
                    decimals: 6,
                    image: 'https://ethereum-optimism.github.io/data/USDC/logo.png',
                    name: 'USDC',
                    symbol: 'USDC',
                  },
                ]}
                token={{
                  address: USDC_ADDRESS,
                  chainId: 8453,
                  decimals: 6,
                  image: 'https://ethereum-optimism.github.io/data/USDC/logo.png',
                  name: 'USDC',
                  symbol: 'USDC',
                }}
                type="from"
              />
              <SwapToggleButton />
              <SwapAmountInput
                label="You receive"
                swappableTokens={[
                  {
                    address: tokenAddress as `0x${string}`,
                    chainId: 8453,
                    decimals: 18,
                    image: '',
                    name: tokenSymbol,
                    symbol: tokenSymbol,
                  },
                ]}
                token={{
                  address: tokenAddress as `0x${string}`,
                  chainId: 8453,
                  decimals: 18,
                  image: '',
                  name: tokenSymbol,
                  symbol: tokenSymbol,
                }}
                type="to"
              />
              <SwapButton
                onSuccess={handleSwapSuccess}
                onError={handleSwapError}
              />
              <SwapMessage />
            </Swap>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">
              Token address not available for this alert
            </p>
            <p className="text-xs text-gray-500">
              Only tradeable tokens on Base can be copied
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Network: Base</span>
            <span>Powered by OnchainKit</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick swap button component for cards
export function QuickSwapButton({
  tokenAddress,
  tokenSymbol,
  onClick,
}: {
  tokenAddress?: string;
  tokenSymbol?: string;
  onClick: () => void;
}) {
  if (!tokenAddress) return null;

  return (
    <button
      onClick={onClick}
      className="w-full bg-terminal-cyan text-black py-2 px-4 rounded-lg hover:bg-terminal-cyan/90 transition-colors flex items-center justify-center gap-2 font-medium"
    >
      <TrendingUp className="w-4 h-4" />
      Copy Trade {tokenSymbol}
    </button>
  );
}

