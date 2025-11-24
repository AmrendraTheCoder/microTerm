import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
      );

      // Send updates every 10 seconds
      const interval = setInterval(() => {
        try {
          const db = getDatabase();
          
          // Get latest data
          const latestDeal = db.prepare('SELECT * FROM private_deals ORDER BY filed_at DESC LIMIT 1').get();
          const latestAlert = db.prepare('SELECT * FROM whale_alerts ORDER BY timestamp DESC LIMIT 1').get();
          const latestNews = db.prepare('SELECT * FROM news ORDER BY published_at DESC LIMIT 1').get();
          
          const update = {
            type: 'update',
            data: {
              deal: latestDeal,
              alert: latestAlert,
              news: latestNews,
            },
            timestamp: new Date().toISOString(),
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(update)}\n\n`)
          );
        } catch (error) {
          console.error('Error sending SSE update:', error);
        }
      }, 10000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

