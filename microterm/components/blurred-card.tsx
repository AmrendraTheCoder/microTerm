'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Lock, Unlock, CheckCircle, Sparkles } from 'lucide-react';
import { PaymentModal } from './payment-modal';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { useLoyalty } from '@/lib/hooks/use-loyalty';

export interface BlurredCardProps {
  id: string;
  title: string;
  description: string;
  preview: React.ReactNode;
  fullContent: React.ReactNode;
  cost: number;
  type: 'deal' | 'alert' | 'news';
  actionButton?: React.ReactNode;
}

export function BlurredCard({
  id,
  title,
  description,
  preview,
  fullContent,
  cost,
  type,
  actionButton,
}: BlurredCardProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { address } = useAccount();
  const { hasFreeUnlock } = useLoyalty();

  const handleUnlockClick = () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (hasFreeUnlock) {
      handleFreeUnlock();
    } else {
      setShowPaymentModal(true);
    }
  };

  const handleFreeUnlock = async () => {
    const toastId = toast.loading('Processing free unlock...');
    
    // Simulate API call for free unlock record
    try {
      // In a real app, call an endpoint to decrement free unlock count
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsUnlocked(true);
      toast.dismiss(toastId);
      toast.success('Unlocked for FREE!', {
        description: 'Member perk used. Enjoy your insight.',
        icon: <Sparkles className="w-4 h-4 text-violet-400" />,
      });
    } catch (error) {
      setIsUnlocked(true); // Fallback
      toast.dismiss(toastId);
    }
  };

  const handlePaymentSuccess = async (txHash: string) => {
    const toastId = toast.loading('Verifying payment & minting NFT...');
    
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash,
          userWallet: address,
          itemType: type,
          itemId: id,
          cost,
        }),
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        setIsUnlocked(true);
        setShowPaymentModal(false);
        toast.dismiss(toastId);
        toast.success('Content unlocked!', {
          description: 'NFT Receipt minted & 10 $MICRO earned',
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        });
      } else {
        toast.dismiss(toastId);
        toast.error('Verification failed', {
          description: data.error || 'Please contact support',
        });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      // Allow unlock in demo mode even if verification fails
      setIsUnlocked(true);
      setShowPaymentModal(false);
      toast.dismiss(toastId);
      toast.warning('Unlocked (Offline Mode)', {
        description: 'Could not verify on-chain, but unlocking for demo.',
      });
    }
  };

  return (
    <>
      <Card className={`relative overflow-hidden web3-card border-none ${isUnlocked ? 'bg-white/10' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isUnlocked ? (
                <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500">
                  <Unlock className="w-4 h-4" />
                </div>
              ) : (
                <div className="p-1.5 rounded-lg bg-white/5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
              )}
              <CardTitle className="text-base font-semibold text-slate-200">
                {title}
              </CardTitle>
            </div>
            {!isUnlocked && (
              <span className="text-xs font-medium bg-white/5 text-slate-300 border border-white/10 px-2.5 py-1 rounded-full">
                ${cost.toFixed(2)} USDC
              </span>
            )}
          </div>
          <CardDescription className="text-slate-500 text-xs pl-10">
            {description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pl-10">
          <div className="relative">
            {isUnlocked ? (
              <div className="animate-in fade-in duration-500">
                <div className="space-y-4">
                  {fullContent}
                  {actionButton && (
                    <div className="pt-4 border-t border-white/5">
                      {actionButton}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="blur-md select-none pointer-events-none opacity-40 grayscale transition-all duration-500">
                  {preview}
                </div>
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  {hasFreeUnlock ? (
                    <Button
                      onClick={handleUnlockClick}
                      size="sm"
                      className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-xl shadow-violet-500/20 hover:scale-105 transition-all duration-200"
                    >
                      <Sparkles className="w-3 h-3 mr-2" />
                      Unlock for FREE
                    </Button>
                  ) : (
                    <Button
                      onClick={handleUnlockClick}
                      size="sm"
                      className="btn-primary font-semibold text-sm shadow-xl shadow-blue-500/20 hover:scale-105 transition-all duration-200"
                    >
                      <Lock className="w-3 h-3 mr-2" />
                      Unlock for ${cost.toFixed(2)}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        cost={cost}
        itemId={id}
        itemType={type}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}
