'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Lock, Unlock } from 'lucide-react';
import { PaymentModal } from './payment-modal';

export interface BlurredCardProps {
  id: string;
  title: string;
  description: string;
  preview: React.ReactNode;
  fullContent: React.ReactNode;
  cost: number;
  type: 'deal' | 'alert' | 'news';
}

export function BlurredCard({
  id,
  title,
  description,
  preview,
  fullContent,
  cost,
  type,
}: BlurredCardProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleUnlockClick = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (txHash: string) => {
    console.log('Payment successful:', txHash);
    
    // Verify transaction on backend
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txHash,
          userWallet: 'user-wallet-address', // This should come from wallet context
          itemType: type,
          itemId: id,
          cost,
        }),
      });

      if (response.ok) {
        setIsUnlocked(true);
        setShowPaymentModal(false);
      } else {
        console.error('Payment verification failed');
        alert('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      // Still unlock on client side for demo purposes
      setIsUnlocked(true);
      setShowPaymentModal(false);
    }
  };

  const typeColors = {
    deal: 'text-terminal-yellow',
    alert: 'text-terminal-red',
    news: 'text-terminal-cyan',
  };

  return (
    <>
      <Card className="relative overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {isUnlocked ? (
                <Unlock className="w-4 h-4 text-terminal-cyan" />
              ) : (
                <Lock className="w-4 h-4 text-terminal-yellow" />
              )}
              <span className={typeColors[type]}>{title}</span>
            </CardTitle>
            {!isUnlocked && (
              <span className="text-xs text-terminal-yellow font-mono">
                ${cost.toFixed(2)}
              </span>
            )}
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {isUnlocked ? (
              <div className="space-y-2">{fullContent}</div>
            ) : (
              <>
                <div className="blur-sm select-none pointer-events-none">
                  {preview}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <Button
                    onClick={handleUnlockClick}
                    size="lg"
                    className="shadow-lg"
                  >
                    <Lock className="w-4 h-4" />
                    Unlock for ${cost.toFixed(2)} USDC
                  </Button>
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

