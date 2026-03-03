// src/mastra/store.ts
// Postgres OM store adapter with connection pooling and error handling.
import { PostgresStore } from '@mastra/pg';
import { ENV } from '@utils/env';

let storeInstance: PostgresStore | null = null;

export async function getStore(): Promise<PostgresStore> {
  if (storeInstance) {
    return storeInstance;
  }

  try {
    storeInstance = new PostgresStore({
      id: 'opencode-om-store',
      connectionString: ENV.DATABASE_URL
    });

    // Test connection on initialization
    await storeInstance.getStore('memory');
    
    console.log('[Store] Successfully connected to Postgres store');
    return storeInstance;
  } catch (error) {
    console.error('[Store] Failed to initialize Postgres store:', error);
    throw error;
  }
}

export const store = await getStore();

// Export memory domain for OM
export const memoryStore = await store.getStore('memory');
