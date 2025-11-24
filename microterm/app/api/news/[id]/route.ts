import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, News } from '@/lib/db';
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
    const newsId = parseInt(params.id);

    const news = db.prepare('SELECT * FROM news WHERE id = ?').get(newsId) as News | undefined;

    if (!news) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      );
    }

    if (userWallet) {
      const unlock = db.prepare(`
        SELECT * FROM user_unlocks 
        WHERE user_wallet = ? AND item_type = 'news' AND item_id = ?
      `).get(userWallet.toLowerCase(), newsId);

      if (unlock) {
        return NextResponse.json(news);
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

      const verified = await verifyTransaction(txHash, 0.10, treasuryWallet);

      if (verified) {
        try {
          db.prepare(`
            INSERT INTO user_unlocks (user_wallet, item_type, item_id, tx_hash, amount_paid)
            VALUES (?, ?, ?, ?, ?)
          `).run(userWallet.toLowerCase(), 'news', newsId, txHash, 0.10);

          return NextResponse.json(news);
        } catch (error) {
          return NextResponse.json(news);
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
        cost: 0.10,
        currency: 'USDC',
        chain: 'Base',
        recipient: process.env.NEXT_PUBLIC_TREASURY_WALLET,
        preview: {
          id: news.id,
          title: news.title,
          source: news.source,
          published_at: news.published_at,
        },
      },
      { status: 402 }
    );
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

