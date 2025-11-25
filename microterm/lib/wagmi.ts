import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';

// Determine if we're using testnet or mainnet
const isTestnet = process.env.NEXT_PUBLIC_NETWORK === 'testnet';

// Select the appropriate chain
const activeChain = isTestnet ? baseSepolia : base;
const activeChainName = isTestnet ? 'Base Sepolia (Testnet)' : 'Base Mainnet';

console.log(`🌐 MicroTerm configured for: ${activeChainName}`);

export const config = createConfig({
  chains: [activeChain],
  connectors: [
    coinbaseWallet({
      appName: 'MicroTerm',
      preference: 'smartWalletOnly',
    }),
  ],
  ssr: true,
  transports: {
    [activeChain.id]: http(),
  },
});

// Export chain info for use in components
export const ACTIVE_CHAIN = activeChain;
export const IS_TESTNET = isTestnet;
export const CHAIN_NAME = activeChainName;
export const EXPLORER_URL = isTestnet 
  ? 'https://sepolia.basescan.org' 
  : 'https://basescan.org';

// USDC addresses
export const USDC_ADDRESS = isTestnet
  ? '0x036CbD53842c5426634e7929541eC2318f3dCF7e' // Base Sepolia USDC (testnet)
  : '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base Mainnet USDC

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

