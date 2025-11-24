import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Deal } from '@/lib/db';
import { verifyTransaction } from '@/lib/verify-transaction';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(request.url);
    const userWallet = searchParams.get('wallet');
    const txHash = searchParams.get('tx_hash');
    const dealId = parseInt(params.id);

    // Get the deal
    const deal = db.prepare('SELECT * FROM private_deals WHERE id = ?').get(dealId) as Deal | undefined;

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Check if user has already unlocked this deal
    if (userWallet) {
      const unlock = db.prepare(`
        SELECT * FROM user_unlocks 
        WHERE user_wallet = ? AND item_type = 'deal' AND item_id = ?
      `).get(userWallet.toLowerCase(), dealId);

      if (unlock) {
        // Already unlocked, return full data
        return NextResponse.json(deal);
      }
    }

    // If transaction hash provided, verify payment
    if (txHash && userWallet) {
      const treasuryWallet = process.env.NEXT_PUBLIC_TREASURY_WALLET;
      if (!treasuryWallet) {
        return NextResponse.json(
          { error: 'Treasury wallet not configured' },
          { status: 500 }
        );
      }

      const verified = await verifyTransaction(txHash, 0.50, treasuryWallet);

      if (verified) {
        // Record unlock
        try {
          db.prepare(`
            INSERT INTO user_unlocks (user_wallet, item_type, item_id, tx_hash, amount_paid)
            VALUES (?, ?, ?, ?, ?)
          `).run(userWallet.toLowerCase(), 'deal', dealId, txHash, 0.50);

          // Return full data
          return NextResponse.json(deal);
        } catch (error) {
          // Might be duplicate, that's ok
          return NextResponse.json(deal);
        }
      } else {
        return NextResponse.json(
          { error: 'Transaction verification failed' },
          { status: 400 }
        );
      }
    }

    // Not unlocked and no valid payment - return 402
    return NextResponse.json(
      {
        error: 'Payment Required',
        cost: 0.50,
        currency: 'USDC',
        chain: 'Base',
        recipient: process.env.NEXT_PUBLIC_TREASURY_WALLET,
        preview: {
          id: deal.id,
          company_name: deal.company_name,
          sector: deal.sector,
          filed_at: deal.filed_at,
        },
      },
      { status: 402 }
    );
  } catch (error) {
    console.error('Error fetching deal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

