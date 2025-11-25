'use client';

import { useState } from 'react';
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from '@coinbase/onchainkit/transaction';
import type { LifecycleStatus } from '@coinbase/onchainkit/transaction';
import { encodeFunctionData, parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import { USDC_ADDRESS, EXPLORER_URL } from '@/lib/wagmi';

const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cost: number;
  itemId: string;
  itemType: string;
  onSuccess: (txHash: string) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  cost,
  itemId,
  itemType,
  onSuccess,
}: PaymentModalProps) {
  const { address } = useAccount();
  const [txHash, setTxHash] = useState<string>('');

  if (!isOpen) return null;

  const treasuryWallet = process.env.NEXT_PUBLIC_TREASURY_WALLET || '0x0000000000000000000000000000000000000000';
  
  const calls = [
    {
      to: USDC_ADDRESS as `0x${string}`,
      data: encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [treasuryWallet as `0x${string}`, parseUnits(cost.toString(), 6)],
      }),
    },
  ];

  const handleOnStatus = (status: LifecycleStatus) => {
    console.log('Transaction status:', status);
    
    if (status.statusName === 'success' && status.statusData?.transactionReceipts?.[0]?.transactionHash) {
      const hash = status.statusData.transactionReceipts[0].transactionHash;
      setTxHash(hash);
      onSuccess(hash);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-terminal-cyan">Unlock Content</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-terminal-fg"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800 rounded p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Item Type:</span>
              <span className="text-terminal-fg font-mono">{itemType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Cost:</span>
              <span className="text-terminal-yellow font-bold">${cost.toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Network:</span>
              <span className="text-terminal-cyan">Base</span>
            </div>
          </div>

          {!address ? (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm mb-2">Please connect your wallet to continue</p>
            </div>
          ) : (
            <Transaction
              calls={calls}
              onStatus={handleOnStatus}
            >
              <TransactionButton
                className="w-full bg-terminal-cyan text-black hover:bg-terminal-cyan/90 font-mono py-3 rounded"
                text="Pay with USDC"
              />
              <TransactionStatus>
                <TransactionStatusLabel />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          )}

          {txHash && (
            <div className="text-xs text-gray-400 break-all">
              <span>Transaction: </span>
              <a
                href={`${EXPLORER_URL}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-terminal-cyan hover:underline"
              >
                {txHash}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

