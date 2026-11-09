import { NextRequest, NextResponse } from 'next/server';
import { getSyncVersion } from '@/lib/syncNotifier';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUserId =
    searchParams.get('userId') || searchParams.get('email') || 'default_user';
  const userId = rawUserId.trim().toLowerCase();

  return NextResponse.json(
    {
      success: true,
      userId,
      version: getSyncVersion(userId),
      timestamp: Date.now(),
    },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}
