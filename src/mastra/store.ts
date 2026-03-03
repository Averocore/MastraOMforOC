// src/mastra/store.ts
// Postgres OM store adapter. Ensure DATABASE_URL is set in your environment.
import { PostgresStore } from '@mastra/pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required for the Postgres OM store.');
}

export const store = new PostgresStore({
  id: 'opencode-om-store',
  connectionString
});

// Export memory domain for OM
export const memoryStore = await store.getStore('memory');
