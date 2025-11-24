import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, WhaleAlert } from '@/lib/db';
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
    const alertId = parseInt(params.id);

    const alert = db.prepare('SELECT * FROM whale_alerts WHERE id = ?').get(alertId) as WhaleAlert | undefined;

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    if (userWallet) {
      const unlock = db.prepare(`
        SELECT * FROM user_unlocks 
        WHERE user_wallet = ? AND item_type = 'alert' AND item_id = ?
      `).get(userWallet.toLowerCase(), alertId);

      if (unlock) {
        return NextResponse.json(alert);
      }
    }

    if (txHash && userWallet) {
      const treasuryWallet = process.env.NEXT_PUBLIC_TREASURY_WALLET;
      if (!treasuryWallet) {
        return NextResponse.json(
          { error: 'Treasury wallet not configured' },
          { status: 500 }
        );
      }

      const verified = await verifyTransaction(txHash, 0.25, treasuryWallet);

      if (verified) {
        try {
          db.prepare(`
            INSERT INTO user_unlocks (user_wallet, item_type, item_id, tx_hash, amount_paid)
            VALUES (?, ?, ?, ?, ?)
          `).run(userWallet.toLowerCase(), 'alert', alertId, txHash, 0.25);

          return NextResponse.json(alert);
        } catch (error) {
          return NextResponse.json(alert);
        }
      } else {
        return NextResponse.json(
          { error: 'Transaction verification failed' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Payment Required',
        cost: 0.25,
        currency: 'USDC',
        chain: 'Base',
        recipient: process.env.NEXT_PUBLIC_TREASURY_WALLET,
        preview: {
          id: alert.id,
          tx_hash: alert.tx_hash,
          sender_label: alert.sender_label,
          receiver_label: alert.receiver_label,
          token_symbol: alert.token_symbol,
          timestamp: alert.timestamp,
        },
      },
      { status: 402 }
    );
  } catch (error) {
    console.error('Error fetching alert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

