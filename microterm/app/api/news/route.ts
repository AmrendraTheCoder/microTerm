import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, News } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    
    const news = db.prepare(`
      SELECT * FROM news 
      ORDER BY published_at DESC 
      LIMIT ?
    `).all(limit) as News[];

    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

