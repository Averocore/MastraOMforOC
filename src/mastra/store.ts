// src/mastra/store.ts
// LibSQL (SQLite) OM store adapter with local file storage.
// Note: This configuration is for LOCAL WORKSPACE ONLY.
// For cloud deployment, switch to Turso, Cloudflare D1, or Docker PostgreSQL.
import { LibSQLStore } from '@mastra/libsql';
import { ENV } from '@utils/env';

let storeInstance: LibSQLStore | null = null;

export async function getStore(): Promise<LibSQLStore> {
  if (storeInstance) {
    return storeInstance;
  }

  try {
    // LOCAL WORKSPACE CONFIGURATION
    // Uses SQLite file-based storage (opencode_om.db)
    // Works only on the local machine where the file exists
    storeInstance = new LibSQLStore({
      id: 'opencode-om-store',
      url: ENV.DATABASE_URL
    });

    // Test connection on initialization
    await storeInstance.getStore('memory');
    
    console.log('[Store] Successfully connected to LibSQL store (LOCAL)');
    console.log('[Store] Database location:', ENV.DATABASE_URL);
    return storeInstance;
  } catch (error) {
    console.error('[Store] Failed to initialize LibSQL store:', error);
    throw error;
  }
}

export const store = await getStore();

// Export memory domain for OM
export const memoryStore = await store.getStore('memory');
