declare global {
  var _syncEmitters: Map<string, Set<(msg: string) => void>> | undefined;
  var _syncVersions: Map<string, number> | undefined;
}

if (!global._syncEmitters) {
  global._syncEmitters = new Map();
}
if (!global._syncVersions) {
  global._syncVersions = new Map();
}

/**
 * Notifica todos os dispositivos conectados em tempo real que houve
 * alteração em orçamentos, financeiro, clientes ou agenda nesta conta.
 */
export function notifySync(userId: string) {
  const cleanId = (userId || '').trim().toLowerCase();
  const ver = Date.now();
  global._syncVersions?.set(cleanId, ver);

  const listeners = global._syncEmitters?.get(cleanId);
  if (listeners && listeners.size > 0) {
    const payload = JSON.stringify({
      type: 'sync',
      userId: cleanId,
      version: ver,
      timestamp: new Date().toISOString(),
    });
    listeners.forEach((cb) => {
      try {
        cb(payload);
      } catch (err) {
        // Ignora conexões fechadas
      }
    });
  }
}

export function getSyncVersion(userId: string): number {
  const cleanId = (userId || '').trim().toLowerCase();
  return global._syncVersions?.get(cleanId) || 0;
}

export function addSyncListener(
  userId: string,
  callback: (msg: string) => void
): () => void {
  const cleanId = (userId || '').trim().toLowerCase();
  if (!global._syncEmitters!.has(cleanId)) {
    global._syncEmitters!.set(cleanId, new Set());
  }
  const set = global._syncEmitters!.get(cleanId)!;
  set.add(callback);

  return () => {
    set.delete(callback);
    if (set.size === 0) {
      global._syncEmitters?.delete(cleanId);
    }
  };
}
