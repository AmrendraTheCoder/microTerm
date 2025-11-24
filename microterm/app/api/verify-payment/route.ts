import { NextRequest, NextResponse } from 'next/server';
import { verifyTransaction } from '@/lib/verify-transaction';
import { getDatabase } from '@/lib/db';

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

    // Verify the transaction
    const verified = await verifyTransaction(txHash, cost, treasuryWallet);

    if (!verified) {
      return NextResponse.json(
        { error: 'Transaction verification failed', verified: false },
        { status: 400 }
      );
    }

    // Record the unlock
    const db = getDatabase();
    try {
      db.prepare(`
        INSERT INTO user_unlocks (user_wallet, item_type, item_id, tx_hash, amount_paid)
        VALUES (?, ?, ?, ?, ?)
      `).run(userWallet.toLowerCase(), itemType, itemId, txHash, cost);
    } catch (error) {
      // Might be duplicate, that's ok
      console.log('Unlock already recorded');
    }

    return NextResponse.json({
      verified: true,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

