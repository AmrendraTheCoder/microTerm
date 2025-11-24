import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Deal } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    
    const deals = db.prepare(`
      SELECT * FROM private_deals 
      ORDER BY filed_at DESC 
      LIMIT ?
    `).all(limit) as Deal[];

    return NextResponse.json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

