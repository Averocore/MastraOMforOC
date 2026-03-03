// scripts/check-observations.ts
// Query and display OM observations and reflections from SQLite database
import { LibSQLStore } from '@mastra/libsql';
import { config } from 'dotenv';

config();

async function checkObservations() {
  console.log('[Check-Observations] Loading database...\n');

  const store = new LibSQLStore({
    id: 'opencode-om-store',
    url: process.env.DATABASE_URL || 'file:./opencode_om.db'
  });

  try {
    // Get memory store domain
    const memoryStore = await store.getStore('memory');
    if (!memoryStore) {
      console.log('Could not access memory store');
      return;
    }

    // List threads to see what's available
    console.log('📊 Available Threads:');
    const threads = await memoryStore.listThreads({ filter: {}, page: 0, perPage: 100 });
    threads.threads.forEach((thread: any) => {
      console.log(`  - ID: ${thread.id}`);
      console.log(`    Title: ${thread.title || '(untitled)'}`);
      console.log(`    Created: ${thread.createdAt}`);
      console.log('');
    });

    // Check for observation records
    console.log('\n🔍 Observation Records:');
    // Note: The exact table structure may vary by Mastra version
    // Try to query common observation-related tables

    // Check mastra_observations table if it exists
    try {
      const observations = await (memoryStore as any).query?.('mastra_observations', {}) ||
                           await (memoryStore as any).listObservations?.() ||
                           [];
      if (observations.length > 0) {
        observations.forEach((obs: any) => {
          console.log(`  Observation ID: ${obs.id}`);
          console.log(`  Thread ID: ${obs.threadId}`);
          console.log(`  Content: ${JSON.stringify(obs.content, null, 2)}`);
          console.log(`  Created: ${obs.createdAt}`);
          console.log('');
        });
      } else {
        console.log('  No observation records found in mastra_observations table');
      }
    } catch (e) {
      console.log('  Could not query mastra_observations table (table may not exist yet)');
    }

    // Check for reflection records
    console.log('\n💭 Reflection Records:');
    try {
      const reflections = await (memoryStore as any).query?.('mastra_reflections', {}) ||
                          await (memoryStore as any).listReflections?.() ||
                          [];
      if (reflections.length > 0) {
        reflections.forEach((refl: any) => {
          console.log(`  Reflection ID: ${refl.id}`);
          console.log(`  Thread ID: ${refl.threadId}`);
          console.log(`  Summary: ${refl.summary}`);
          console.log(`  Created: ${refl.createdAt}`);
          console.log('');
        });
      } else {
        console.log('  No reflection records found in mastra_reflections table');
      }
    } catch (e) {
      console.log('  Could not query mastra_reflections table (table may not exist yet)');
    }

    // Check messages to see conversation history
    console.log('\n💬 Conversation Messages (Sample):');
    for (const thread of threads.threads) {
      const messages = await memoryStore.listMessages({
        threadId: thread.id,
        perPage: 10
      });
      console.log(`  Thread: ${thread.id}`);
      messages.messages.slice(0, 5).forEach((msg: any) => {
        const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
        console.log(`    ${msg.role}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
      });
      console.log('');
    }

    // List all available tables
    console.log('\n📋 Database Tables:');
    try {
      // Try to list tables (SQL syntax varies by database)
      const tables = await (memoryStore as any).listIndexes?.() || [];
      if (tables.length > 0) {
        tables.forEach((table: any) => {
          console.log(`  - ${table.name || table}`);
        });
      }
    } catch (e) {
      console.log('  Could not list tables');
    }

  } catch (error) {
    console.error('[Check-Observations] Error:', error);
  } finally {
    // LibSQLStore doesn't have a disconnect method, connection is managed internally
  }
}

checkObservations().catch(console.error);
