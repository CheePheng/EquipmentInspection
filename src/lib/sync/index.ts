/**
 * Future sync layer interface stubs.
 * When a backend is added, implement these interfaces to enable
 * bidirectional sync between IndexedDB and the server.
 */

export interface SyncConfig {
  apiUrl: string;
  authToken: string;
}

export interface SyncResult {
  pushed: number;
  pulled: number;
  conflicts: number;
}

export interface SyncEngine {
  initialize(config: SyncConfig): Promise<void>;
  pushChanges(): Promise<SyncResult>;
  pullChanges(): Promise<SyncResult>;
  getStatus(): 'idle' | 'syncing' | 'error';
  getLastSyncedAt(): string | null;
}

/**
 * Each Dexie table will gain these fields via a version migration:
 * - syncStatus: 'local' | 'pending' | 'synced'
 * - lastSyncedAt: string | null
 * - syncVersion: number
 *
 * Photos sync separately (large payload, lower priority).
 * Conflict resolution: last-write-wins for simple fields, merge for arrays.
 */

// Placeholder — not yet implemented
export const syncEngine: SyncEngine | null = null;
