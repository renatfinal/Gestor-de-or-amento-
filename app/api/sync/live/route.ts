import { NextRequest } from 'next/server';
import { addSyncListener, getSyncVersion } from '@/lib/syncNotifier';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUserId = searchParams.get('userId') || searchParams.get('email') || '';
  const userId = rawUserId.trim().toLowerCase();

  if (!userId) {
    return new Response('userId é obrigatório', { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Envia evento inicial de confirmação de conexão SSE
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            type: 'connected',
            userId,
            version: getSyncVersion(userId),
            timestamp: Date.now(),
          })}\n\n`
        )
      );

      const removeListener = addSyncListener(userId, (msg) => {
        try {
          controller.enqueue(encoder.encode(`data: ${msg}\n\n`));
        } catch (e) {
          // Stream fechada pelo cliente
        }
      });

      // Keepalive ping a cada 15 segundos para evitar timeout de proxies
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch (e) {
          clearInterval(pingInterval);
        }
      }, 15000);

      req.signal.addEventListener('abort', () => {
        clearInterval(pingInterval);
        removeListener();
        try {
          controller.close();
        } catch (e) {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform, no-store',
      Connection: 'keep-alive',
    },
  });
}
