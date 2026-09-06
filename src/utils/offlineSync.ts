import { Transaction, Category, AppSettings, FamilyMember } from '../types';

const QUEUE_KEY = 'spoken_ledger_offline_queue_v2';
const PENDING_SYNC_KEY = 'spoken_ledger_pending_sync_count';

export interface OfflineQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  transaction?: Transaction;
  transactionId?: string;
  queuedAt: string;
}

export function isOnline(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

export function getOfflineQueue(): OfflineQueueItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to parse offline sync queue:', e);
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineQueueItem[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    localStorage.setItem(PENDING_SYNC_KEY, String(queue.length));
    window.dispatchEvent(new CustomEvent('spoken_ledger_queue_updated', { detail: { count: queue.length } }));
  } catch (e) {
    console.warn('Failed to save offline queue:', e);
  }
}

export function enqueueOfflineTransaction(
  action: 'create' | 'update' | 'delete',
  transaction?: Transaction,
  transactionId?: string
): void {
  const queue = getOfflineQueue();
  queue.push({
    id: 'queue_' + Math.random().toString(36).substring(2, 9),
    action,
    transaction,
    transactionId: transactionId || transaction?.id,
    queuedAt: new Date().toISOString(),
  });
  saveOfflineQueue(queue);
}

export function getPendingSyncCount(): number {
  return getOfflineQueue().length;
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  mergedTransactions?: Transaction[];
  lastSyncedAt: string;
  message?: string;
}

export async function performCloudSync(
  userId: string,
  localTransactions: Transaction[],
  categories: Category[],
  settings: AppSettings,
  familyMembers: FamilyMember[]
): Promise<SyncResult> {
  if (!isOnline()) {
    return {
      success: false,
      syncedCount: 0,
      lastSyncedAt: new Date().toISOString(),
      message: 'Device is offline. Changes are saved safely in local storage.',
    };
  }

  const queue = getOfflineQueue();

  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId || 'default_user',
        records: localTransactions,
        categories,
        settings,
        familyMembers,
      }),
    });

    if (!response.ok) {
      throw new Error(`Sync failed with status ${response.status}`);
    }

    const resData = await response.json();
    const mergedList: Transaction[] = (resData.data?.records || localTransactions).map((t: any) => ({
      ...t,
      synced: true,
      syncStatus: 'synced' as const,
    }));

    // Clear queue upon successful server handshake
    saveOfflineQueue([]);

    return {
      success: true,
      syncedCount: queue.length,
      mergedTransactions: mergedList,
      lastSyncedAt: resData.syncedAt || new Date().toISOString(),
      message: queue.length > 0
        ? `Uploaded ${queue.length} pending offline record(s) to cloud.`
        : 'All ledger records are up-to-date with cloud storage.',
    };
  } catch (err: any) {
    console.warn('Cloud sync error, operating in offline fallback:', err);
    return {
      success: false,
      syncedCount: 0,
      lastSyncedAt: new Date().toISOString(),
      message: 'Sync deferred: server unreachable. Local changes preserved.',
    };
  }
}
