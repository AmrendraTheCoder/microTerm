import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const NFT_CONTRACT_ABI = parseAbi([
  'function mintReceipt(address to, string memory contentType, string memory itemId, uint256 pricePaid, string memory tokenURI) public returns (uint256)',
  'function getUserReceipts(address user) public view returns (uint256[])',
  'function getReceipt(uint256 tokenId) public view returns (tuple(string contentType, string itemId, uint256 pricePaid, uint256 timestamp, address purchaser))',
]);

const USE_TESTNET = process.env.NEXT_PUBLIC_NETWORK === 'testnet';
const CHAIN = USE_TESTNET ? baseSepolia : base;
const RPC_URL = USE_TESTNET
  ? process.env.NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_URL || 'https://sepolia.base.org'
  : process.env.NEXT_PUBLIC_ALCHEMY_BASE_URL;

export interface MintReceiptParams {
  userWallet: string;
  contentType: 'deal' | 'alert' | 'news';
  itemId: string;
  pricePaid: number; // in USDC (e.g., 0.50)
}

export interface NFTReceipt {
  tokenId: number;
  contentType: string;
  itemId: string;
  pricePaid: number;
  timestamp: number;
  purchaser: string;
}

/**
 * Mint an NFT receipt for a content unlock
 * This is called after successful payment verification
 */
export async function mintReceiptNFT(params: MintReceiptParams): Promise<string> {
  try {
    const contractAddress = process.env.NEXT_PUBLIC_NFT_RECEIPT_CONTRACT as `0x${string}`;
    if (!contractAddress) {
      throw new Error('NFT_RECEIPT_CONTRACT not configured');
    }

    const treasuryKey = process.env.TREASURY_PRIVATE_KEY as `0x${string}`;
    if (!treasuryKey) {
      throw new Error('TREASURY_PRIVATE_KEY not configured');
    }

    // Setup wallet client
    const account = privateKeyToAccount(treasuryKey);
    const walletClient = createWalletClient({
      account,
      chain: CHAIN,
      transport: http(RPC_URL),
    });

    // Generate token URI (metadata URL)
    const tokenURI = generateTokenURI(params);

    // Convert price to 6 decimals (USDC format)
    const pricePaidWei = BigInt(Math.floor(params.pricePaid * 1_000_000));

    console.log('[NFT Service] Minting receipt:', {
      to: params.userWallet,
      contentType: params.contentType,
      itemId: params.itemId,
      pricePaid: pricePaidWei.toString(),
      tokenURI,
    });

    // Mint the NFT
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: NFT_CONTRACT_ABI,
      functionName: 'mintReceipt',
      args: [
        params.userWallet as `0x${string}`,
        params.contentType,
        params.itemId,
        pricePaidWei,
        tokenURI,
      ],
    });

    console.log('[NFT Service] Receipt minted, tx hash:', hash);
    return hash;
  } catch (error) {
    console.error('[NFT Service] Minting error:', error);
    throw error;
  }
}

/**
 * Get all NFT receipts for a user
 */
export async function getUserReceipts(userWallet: string): Promise<number[]> {
  try {
    const contractAddress = process.env.NEXT_PUBLIC_NFT_RECEIPT_CONTRACT as `0x${string}`;
    if (!contractAddress) {
      return [];
    }

    const publicClient = createPublicClient({
      chain: CHAIN,
      transport: http(RPC_URL),
    });

    const tokenIds = await publicClient.readContract({
      address: contractAddress,
      abi: NFT_CONTRACT_ABI,
      functionName: 'getUserReceipts',
      args: [userWallet as `0x${string}`],
    });

    return tokenIds.map((id) => Number(id));
  } catch (error) {
    console.error('[NFT Service] Error fetching receipts:', error);
    return [];
  }
}

/**
 * Get receipt details by token ID
 */
export async function getReceiptDetails(tokenId: number): Promise<NFTReceipt | null> {
  try {
    const contractAddress = process.env.NEXT_PUBLIC_NFT_RECEIPT_CONTRACT as `0x${string}`;
    if (!contractAddress) {
      return null;
    }

    const publicClient = createPublicClient({
      chain: CHAIN,
      transport: http(RPC_URL),
    });

    const receipt = await publicClient.readContract({
      address: contractAddress,
      abi: NFT_CONTRACT_ABI,
      functionName: 'getReceipt',
      args: [BigInt(tokenId)],
    });

    return {
      tokenId,
      contentType: receipt.contentType,
      itemId: receipt.itemId,
      pricePaid: Number(receipt.pricePaid) / 1_000_000, // Convert from 6 decimals
      timestamp: Number(receipt.timestamp),
      purchaser: receipt.purchaser,
    };
  } catch (error) {
    console.error('[NFT Service] Error fetching receipt details:', error);
    return null;
  }
}

/**
 * Generate metadata URI for the NFT
 * In production, this would point to IPFS or a metadata API
 */
function generateTokenURI(params: MintReceiptParams): string {
  // For now, use a simple data URI with JSON metadata
  // In production, upload to IPFS and return the IPFS URL
  
  const metadata = {
    name: `MicroTerm Receipt #${params.itemId}`,
    description: `Proof of purchase for ${params.contentType} unlock on MicroTerm`,
    image: `https://microterm.io/api/nft-image/${params.contentType}/${params.itemId}`,
    attributes: [
      {
        trait_type: 'Content Type',
        value: params.contentType,
      },
      {
        trait_type: 'Item ID',
        value: params.itemId,
      },
      {
        trait_type: 'Price Paid',
        value: params.pricePaid,
        display_type: 'number',
      },
      {
        trait_type: 'Network',
        value: USE_TESTNET ? 'Base Sepolia' : 'Base',
      },
    ],
    external_url: `https://microterm.io/${params.contentType}/${params.itemId}`,
  };

  // For demo purposes, use data URI
  // In production, upload to IPFS:
  // const ipfsHash = await uploadToIPFS(metadata);
  // return `ipfs://${ipfsHash}`;
  
  const base64 = Buffer.from(JSON.stringify(metadata)).toString('base64');
  return `data:application/json;base64,${base64}`;
}

/**
 * Save NFT receipt to database
 */
export async function saveReceiptToDatabase(params: {
  tokenId: number;
  userWallet: string;
  itemType: string;
  itemId: string;
  pricePaid: number;
  txHash: string;
}): Promise<void> {
  try {
    // This would normally call the backend API to save to database
    // For now, we'll just log it
    console.log('[NFT Service] Saving receipt to database:', params);
    
    // In production:
    // await fetch('/api/nft/save', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(params),
    // });
  } catch (error) {
    console.error('[NFT Service] Error saving to database:', error);
  }
}

/**
 * Check if user has already received NFT for this item
 */
export async function hasReceiptForItem(
  userWallet: string,
  itemType: string,
  itemId: string
): Promise<boolean> {
  try {
    const tokenIds = await getUserReceipts(userWallet);
    
    for (const tokenId of tokenIds) {
      const receipt = await getReceiptDetails(tokenId);
      if (receipt && receipt.contentType === itemType && receipt.itemId === itemId) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('[NFT Service] Error checking receipt:', error);
    return false;
  }
}

