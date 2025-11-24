import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, WhaleAlert } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    
    const alerts = db.prepare(`
      SELECT * FROM whale_alerts 
      ORDER BY timestamp DESC 
      LIMIT ?
    `).all(limit) as WhaleAlert[];

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

