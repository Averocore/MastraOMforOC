// scripts/check-db-structure.ts
// Check database structure and table contents
import { LibSQLStore } from '@mastra/libsql';
import { config } from 'dotenv';

config();

async function checkDbStructure() {
  console.log('[Check-DB] Analyzing database structure...\n');

  const store = new LibSQLStore({
    id: 'opencode-om-store',
    url: process.env.DATABASE_URL || 'file:./opencode_om.db'
  });

  try {
    const memoryStore = await store.getStore('memory');
    if (!memoryStore) {
      console.log('Could not access memory store');
      return;
    }

    // Try to get raw SQL access
    const rawStore = memoryStore as any;

    // Check if we can query the database directly
    console.log('🔍 Checking for observation-related data...\n');

    // Method 1: Check message content for OM data
    console.log('1. Checking message content for OM status data:');
    const threads = await memoryStore.listThreads({ filter: {}, page: 0, perPage: 100 });
    
    for (const thread of threads.threads) {
      const messages = await memoryStore.listMessages({
        threadId: thread.id,
        perPage: 50
      });
      
      console.log(`\n   Thread: ${thread.id}`);
      let omDataCount = 0;
      
      messages.messages.forEach((msg: any) => {
        if (msg.content && typeof msg.content === 'string') {
          // Check if message contains OM status data
          if (msg.content.includes('data-om-status') || msg.content.includes('windows')) {
            omDataCount++;
            try {
              const parsed = JSON.parse(msg.content);
              if (parsed.parts) {
                parsed.parts.forEach((part: any) => {
                  if (part.type === 'data-om-status' && part.data) {
                    console.log(`     OM Status found in ${msg.role} message:`);
                    console.log(`       - Tokens: ${part.data.windows?.active?.messages?.tokens || 'N/A'}`);
                    console.log(`       - Observations: ${JSON.stringify(part.data).substring(0, 200)}...`);
                  }
                });
              }
            } catch (e) {
              // Not valid JSON, skip
            }
          }
        }
      });
      
      if (omDataCount > 0) {
        console.log(`   Found ${omDataCount} messages with OM data`);
      }
    }

    // Method 2: Try to query specific tables that might exist
    console.log('\n2. Attempting to query potential OM tables:');
    const potentialTables = [
      'mastra_observations',
      'mastra_reflections', 
      'mastra_memory_observations',
      'mastra_memory_reflections',
      'observations',
      'reflections'
    ];

    for (const table of potentialTables) {
      try {
        // Try a simple query (this will fail if table doesn't exist)
        const result = await (memoryStore as any).query?.(`SELECT * FROM ${table} LIMIT 1`);
        if (result) {
          console.log(`   ✓ Table '${table}' exists with ${result.length || 0} rows`);
        }
      } catch (e) {
        // Table doesn't exist or query failed
      }
    }

    // Method 3: Check for observation methods on memory store
    console.log('\n3. Checking memory store methods:');
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(memoryStore));
    const observationMethods = methods.filter(m => 
      m.toLowerCase().includes('observ') || 
      m.toLowerCase().includes('reflect') ||
      m.toLowerCase().includes('recall')
    );
    console.log(`   Observation-related methods: ${observationMethods.join(', ') || 'None found'}`);

  } catch (error) {
    console.error('[Check-DB] Error:', error);
  }
}

checkDbStructure().catch(console.error);
