import { NextResponse } from 'next/server';
import { getDatabase, MarketData } from '@/lib/db';

export async function GET() {
  try {
    const db = getDatabase();
    
    const marketData = db.prepare(`
      SELECT * FROM market_data 
      ORDER BY symbol
    `).all() as MarketData[];

    return NextResponse.json(marketData);
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}

