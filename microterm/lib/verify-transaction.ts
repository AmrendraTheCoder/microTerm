import { createPublicClient, http, parseUnits } from 'viem';
import { base, baseSepolia } from 'viem/chains';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const USDC_SEPOLIA_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // Base Sepolia USDC

export async function verifyTransaction(
  txHash: string,
  expectedAmount: number,
  recipientAddress: string,
  useTestnet: boolean = false
): Promise<boolean> {
  try {
    const chain = useTestnet ? baseSepolia : base;
    const usdcAddress = useTestnet ? USDC_SEPOLIA_ADDRESS : USDC_ADDRESS;
    
    const client = createPublicClient({
      chain,
      transport: http(process.env.NEXT_PUBLIC_ALCHEMY_BASE_URL),
    });

    // Get transaction receipt
    const receipt = await client.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    // Check if transaction succeeded
    if (receipt.status !== 'success') {
      console.error('Transaction failed');
      return false;
    }

    // Parse logs to find Transfer event
    const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    
    for (const log of receipt.logs) {
      // Check if this is a USDC transfer
      if (log.address.toLowerCase() !== usdcAddress.toLowerCase()) {
        continue;
      }

      // Check if this is a Transfer event
      if (log.topics[0] !== transferTopic) {
        continue;
      }

      // Decode transfer details
      const to = '0x' + log.topics[2]?.slice(26); // Remove padding
      const amountHex = log.data;
      const amount = BigInt(amountHex);
      
      // Convert expected amount to USDC units (6 decimals)
      const expectedAmountBigInt = parseUnits(expectedAmount.toString(), 6);

      // Verify recipient and amount
      if (
        to?.toLowerCase() === recipientAddress.toLowerCase() &&
        amount >= expectedAmountBigInt
      ) {
        return true;
      }
    }

    console.error('No matching transfer found in transaction');
    return false;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
}

