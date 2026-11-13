import { NextRequest, NextResponse } from 'next/server';
import { getSyncVersion } from '@/lib/syncNotifier';
import { getWorkspaceSyncTimestamp, getCanonicalWorkspaceUserId } from '@/src/db/queries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUserId = searchParams.get('userId') || searchParams.get('email') || '';
  const canonicalUserId = getCanonicalWorkspaceUserId(rawUserId);

  if (!canonicalUserId) {
    return NextResponse.json(
      { error: 'userId é obrigatório.' },
      { status: 400 }
    );
  }

  // Consulta o timestamp persistido no PostgreSQL (compartilhado entre múltiplos containers Cloud Run)
  const dbVersion = await getWorkspaceSyncTimestamp(canonicalUserId);
  const memVersion = Math.max(
    getSyncVersion(canonicalUserId),
    getSyncVersion(rawUserId.trim().toLowerCase())
  );
  const effectiveVersion = Math.max(dbVersion, memVersion);

  return NextResponse.json(
    {
      success: true,
      userId: canonicalUserId,
      version: effectiveVersion,
      timestamp: Date.now(),
    },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}
