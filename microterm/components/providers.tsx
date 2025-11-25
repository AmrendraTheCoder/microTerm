'use client';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base } from 'wagmi/chains';
import { WagmiProvider } from 'wagmi';
import { ReactNode, useState } from 'react';
import { config } from '@/lib/wagmi';
import { AgentProvider } from '@/lib/agent-context';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
        >
          <AgentProvider>
            {children}
            <Toaster 
              position="top-right" 
              theme="dark"
              toastOptions={{
                style: {
                  background: '#18181b',
                  border: '1px solid #27272a',
                  color: '#e4e4e7',
                },
              }}
            />
          </AgentProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

