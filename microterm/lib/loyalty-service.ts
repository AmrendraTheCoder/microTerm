import { createPublicClient, createWalletClient, http, parseAbi, parseUnits } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const MICRO_TOKEN_ABI = parseAbi([
  'function distributeReward(address to, uint256 amount, string memory reason) public',
  'function balanceOf(address account) public view returns (uint256)',
  'function qualifiesForBenefits(address user) public view returns (bool)',
  'function canUseFreeUnlock(address user) public view returns (bool)',
  'function useFreeUnlock(address user) public',
  'function getUserStats(address user) public view returns (uint256 balance, uint256 earned, uint256 spent, bool hasBenefits, bool canFreeUnlock, uint256 nextFreeUnlock)',
]);

const USE_TESTNET = process.env.NEXT_PUBLIC_NETWORK === 'testnet';
const CHAIN = USE_TESTNET ? baseSepolia : base;
const RPC_URL = USE_TESTNET
  ? process.env.NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_URL || 'https://sepolia.base.org'
  : process.env.NEXT_PUBLIC_ALCHEMY_BASE_URL;

const REWARD_PER_UNLOCK = 10; // 10 $MICRO tokens per unlock

export interface UserStats {
  balance: number;
  earned: number;
  spent: number;
  hasBenefits: boolean;
  canFreeUnlock: boolean;
  nextFreeUnlock: number;
}

/**
 * Distribute $MICRO tokens as reward for unlocking content
 */
export async function distributeReward(params: {
  userWallet: string;
  amount?: number; // Default: 10 $MICRO
  reason: string;
}): Promise<string> {
  try {
    const contractAddress = process.env.NEXT_PUBLIC_MICRO_TOKEN_CONTRACT as `0x${string}`;
    if (!contractAddress) {
      throw new Error('MICRO_TOKEN_CONTRACT not configured');
    }

    const treasuryKey = process.env.TREASURY_PRIVATE_KEY as `0x${string}`;
    if (!treasuryKey) {
      throw new Error('TREASURY_PRIVATE_KEY not configured');
    }

    const amount = params.amount || REWARD_PER_UNLOCK;

    // Setup wallet client
    const account = privateKeyToAccount(treasuryKey);
    const walletClient = createWalletClient({
      account,
      chain: CHAIN,
      transport: http(RPC_URL),
    });

    // Convert amount to 18 decimals (ERC-20 standard)
    const amountWei = parseUnits(amount.toString(), 18);

    console.log('[Loyalty Service] Distributing reward:', {
      to: params.userWallet,
      amount: amount,
      reason: params.reason,
    });

    // Distribute the reward
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: MICRO_TOKEN_ABI,
      functionName: 'distributeReward',
      args: [params.userWallet as `0x${string}`, amountWei, params.reason],
    });

    console.log('[Loyalty Service] Reward distributed, tx hash:', hash);
    return hash;
  } catch (error) {
    console.error('[Loyalty Service] Distribution error:', error);
    throw error;
  }
}

/**
 * Get user's $MICRO token balance
 */
export async function getBalance(userWallet: string): Promise<number> {
  try {
    const contractAddress = process.env.NEXT_PUBLIC_MICRO_TOKEN_CONTRACT as `0x${string}`;
    if (!contractAddress) {
      return 0;
    }

    const publicClient = createPublicClient({
      chain: CHAIN,
      transport: http(RPC_URL),
    });

    const balance = await publicClient.readContract({
      address: contractAddress,
      abi: MICRO_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [userWallet as `0x${string}`],
    });

    // Convert from 18 decimals to regular number
    return Number(balance) / 1e18;
  } catch (error) {
    console.error('[Loyalty Service] Error fetching balance:', error);
    return 0;
  }
}

/**
 * Check if user qualifies for token-gated benefits (100+ $MICRO)
 */
export async function qualifiesForBenefits(userWallet: string): Promise<boolean> {
  try {
    const contractAddress = process.env.NEXT_PUBLIC_MICRO_TOKEN_CONTRACT as `0x${string}`;
    if (!contractAddress) {
      return false;
    }

    const publicClient = createPublicClient({
      chain: CHAIN,
      transport: http(RPC_URL),
    });

    const qualifies = await publicClient.readContract({
      address: contractAddress,
      abi: MICRO_TOKEN_ABI,
      functionName: 'qualifiesForBenefits',
      args: [userWallet as `0x${string}`],
    });

    return qualifies;
  } catch (error) {
    console.error('[Loyalty Service] Error checking benefits:', error);
    return false;
  }
}

/**
 * Check if user can use a free unlock today
 */
export async function canUseFreeUnlock(userWallet: string): Promise<boolean> {
  try {
    const contractAddress = process.env.NEXT_PUBLIC_MICRO_TOKEN_CONTRACT as `0x${string}`;
    if (!contractAddress) {
      return false;
    }

    const publicClient = createPublicClient({
      chain: CHAIN,
      transport: http(RPC_URL),
    });

    const canUse = await publicClient.readContract({
      address: contractAddress,
      abi: MICRO_TOKEN_ABI,
      functionName: 'canUseFreeUnlock',
      args: [userWallet as `0x${string}`],
    });

    return canUse;
  } catch (error) {
    console.error('[Loyalty Service] Error checking free unlock:', error);
    return false;
  }
}

/**
 * Record that user has used their free unlock
 */
export async function useFreeUnlock(userWallet: string): Promise<string> {
  try {
    const contractAddress = process.env.NEXT_PUBLIC_MICRO_TOKEN_CONTRACT as `0x${string}`;
    if (!contractAddress) {
      throw new Error('MICRO_TOKEN_CONTRACT not configured');
    }

    const treasuryKey = process.env.TREASURY_PRIVATE_KEY as `0x${string}`;
    if (!treasuryKey) {
      throw new Error('TREASURY_PRIVATE_KEY not configured');
    }

    const account = privateKeyToAccount(treasuryKey);
    const walletClient = createWalletClient({
      account,
      chain: CHAIN,
      transport: http(RPC_URL),
    });

    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: MICRO_TOKEN_ABI,
      functionName: 'useFreeUnlock',
      args: [userWallet as `0x${string}`],
    });

    console.log('[Loyalty Service] Free unlock used, tx hash:', hash);
    return hash;
  } catch (error) {
    console.error('[Loyalty Service] Error using free unlock:', error);
    throw error;
  }
}

/**
 * Get comprehensive user statistics
 */
export async function getUserStats(userWallet: string): Promise<UserStats | null> {
  try {
    const contractAddress = process.env.NEXT_PUBLIC_MICRO_TOKEN_CONTRACT as `0x${string}`;
    if (!contractAddress) {
      return null;
    }

    const publicClient = createPublicClient({
      chain: CHAIN,
      transport: http(RPC_URL),
    });

    const stats = await publicClient.readContract({
      address: contractAddress,
      abi: MICRO_TOKEN_ABI,
      functionName: 'getUserStats',
      args: [userWallet as `0x${string}`],
    });

    return {
      balance: Number(stats.balance) / 1e18,
      earned: Number(stats.earned) / 1e18,
      spent: Number(stats.spent) / 1e18,
      hasBenefits: stats.hasBenefits,
      canFreeUnlock: stats.canFreeUnlock,
      nextFreeUnlock: Number(stats.nextFreeUnlock),
    };
  } catch (error) {
    console.error('[Loyalty Service] Error fetching stats:', error);
    return null;
  }
}

/**
 * Save loyalty transaction to database
 */
export async function saveLoyaltyTransaction(params: {
  userWallet: string;
  amount: number;
  type: 'earned' | 'spent';
  reason: string;
  txHash: string;
}): Promise<void> {
  try {
    console.log('[Loyalty Service] Saving transaction to database:', params);
    
    // In production, call backend API:
    // await fetch('/api/loyalty/save', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(params),
    // });
  } catch (error) {
    console.error('[Loyalty Service] Error saving transaction:', error);
  }
}

/**
 * Calculate rewards for multiple unlocks (batch processing)
 */
export function calculateBatchRewards(unlockCount: number): number {
  // Base reward: 10 $MICRO per unlock
  let totalReward = unlockCount * REWARD_PER_UNLOCK;
  
  // Bonus multipliers
  if (unlockCount >= 10) {
    totalReward *= 1.1; // 10% bonus for 10+ unlocks
  }
  if (unlockCount >= 50) {
    totalReward *= 1.2; // Additional 20% bonus for 50+ unlocks
  }
  
  return Math.floor(totalReward);
}

/**
 * Get token holder tier based on balance
 */
export function getTier(balance: number): {
  name: string;
  benefits: string[];
  nextTier?: { name: string; required: number };
} {
  if (balance >= 1000) {
    return {
      name: 'Diamond',
      benefits: [
        '3 free unlocks per day',
        'Priority support',
        'Early access to new features',
        'Exclusive insights',
      ],
    };
  } else if (balance >= 500) {
    return {
      name: 'Gold',
      benefits: ['2 free unlocks per day', 'Priority support', 'Early access'],
      nextTier: { name: 'Diamond', required: 1000 },
    };
  } else if (balance >= 100) {
    return {
      name: 'Silver',
      benefits: ['1 free unlock per day', 'Community access'],
      nextTier: { name: 'Gold', required: 500 },
    };
  } else {
    return {
      name: 'Bronze',
      benefits: ['Earn rewards on unlocks'],
      nextTier: { name: 'Silver', required: 100 },
    };
  }
}

