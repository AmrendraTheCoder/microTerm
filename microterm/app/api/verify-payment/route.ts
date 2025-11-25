import { NextRequest, NextResponse } from 'next/server';
import { verifyTransaction } from '@/lib/verify-transaction';
import { getDatabase } from '@/lib/db';
import { mintReceiptNFT } from '@/lib/nft-service';
import { distributeReward } from '@/lib/loyalty-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { txHash, userWallet, itemType, itemId, cost } = body;

    if (!txHash || !userWallet || !itemType || !itemId || !cost) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const treasuryWallet = process.env.NEXT_PUBLIC_TREASURY_WALLET;
    if (!treasuryWallet) {
      return NextResponse.json(
        { error: 'Treasury wallet not configured' },
        { status: 500 }
      );
    }

    // 1. Verify the transaction on-chain
    const verified = await verifyTransaction(txHash, cost, treasuryWallet);

    if (!verified) {
      return NextResponse.json(
        { error: 'Transaction verification failed', verified: false },
        { status: 400 }
      );
    }

    // 2. Record the unlock in database
    const db = getDatabase();
    try {
      db.prepare(`
        INSERT INTO user_unlocks (user_wallet, item_type, item_id, tx_hash, amount_paid)
        VALUES (?, ?, ?, ?, ?)
      `).run(userWallet.toLowerCase(), itemType, itemId, txHash, cost);
    } catch (error) {
      // Might be duplicate, checks uniqueness constraint
      console.log('Unlock already recorded or duplicate request');
    }

    // 3. Mint NFT Receipt (Async/Fire-and-forget to speed up response)
    // In a production queue, this would be a background job
    let nftTxHash = null;
    let rewardTxHash = null;

    try {
      if (process.env.TREASURY_PRIVATE_KEY) {
        // Mint NFT
        nftTxHash = await mintReceiptNFT({
          userWallet,
          contentType: itemType,
          itemId,
          pricePaid: cost,
        });

        // Distribute Loyalty Reward
        rewardTxHash = await distributeReward({
          userWallet,
          amount: 10, // 10 $MICRO per unlock
          reason: `unlock_${itemType}_${itemId}`,
        });

        // Log to database (optional, services might log too)
        console.log(`[Payment] NFT minted: ${nftTxHash}, Reward sent: ${rewardTxHash}`);
      } else {
        console.warn('[Payment] Skipping NFT/Loyalty: TREASURY_PRIVATE_KEY not set');
      }
    } catch (web3Error) {
      console.error('[Payment] Web3 integration error:', web3Error);
      // Don't fail the request if NFT minting fails, user still paid and verified
    }

    return NextResponse.json({
      verified: true,
      message: 'Payment verified successfully',
      nftTxHash,
      rewardTxHash,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
