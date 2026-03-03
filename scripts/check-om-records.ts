// scripts/check-om-records.ts
// Query observational memory records directly from the database
import { LibSQLStore, MemoryLibSQL } from '@mastra/libsql';
import { config } from 'dotenv';

config();

async function checkOMRecords() {
  console.log('[Check-OM-Records] Querying observational memory records...\n');

  const store = new LibSQLStore({
    id: 'opencode-om-store',
    url: process.env.DATABASE_URL || 'file:./opencode_om.db'
  });

  try {
    // Get the memory domain directly
    const memoryStore = await store.getStore('memory') as any;
    
    // Try to access the underlying client to query the OM table
    console.log('🔍 Checking observational memory records...\n');

    // Method 1: Use getObservationalMemory method if available
    if (typeof memoryStore.getObservationalMemory === 'function') {
      console.log('1. Using getObservationalMemory method:');
      
      // Check for our smoke test threads
      const threads = ['smoke-obs', 'smoke-continuation'];
      
      for (const threadId of threads) {
        console.log(`\n   Thread: ${threadId}`);
        try {
          const record = await memoryStore.getObservationalMemory(threadId, 'opencode-om-resource');
          if (record) {
            console.log(`   ✓ Record found:`);
            console.log(`     - ID: ${record.id}`);
            console.log(`     - Last observed: ${record.lastObservedAt || 'Never'}`);
            console.log(`     - Generation count: ${record.generationCount}`);
            console.log(`     - Total tokens: ${record.totalTokensObserved}`);
            console.log(`     - Observation tokens: ${record.observationTokenCount}`);
            console.log(`     - Active observations: ${record.activeObservations ? record.activeObservations.length : 0}`);
            console.log(`     - Is observing: ${record.isObserving}`);
            console.log(`     - Is reflecting: ${record.isReflecting}`);
            
            if (record.activeObservations) {
              console.log(`\n     Active Observations:`);
              const obsArray = Array.isArray(record.activeObservations) 
                ? record.activeObservations 
                : [record.activeObservations];
              obsArray.forEach((obs: string, i: number) => {
                if (obs) {
                  console.log(`       ${i + 1}. ${obs.substring(0, 150)}${obs.length > 150 ? '...' : ''}`);
                }
              });
            }
          } else {
            console.log(`   ✗ No record found`);
          }
        } catch (e: any) {
          console.log(`   ✗ Error: ${e.message}`);
        }
      }
    } else {
      console.log('1. getObservationalMemory method not available on memory store');
    }

    // Method 2: Try to get history
    if (typeof memoryStore.getObservationalMemoryHistory === 'function') {
      console.log('\n2. Using getObservationalMemoryHistory method:');
      
      for (const threadId of ['smoke-obs']) {
        console.log(`\n   Thread: ${threadId}`);
        try {
          const history = await memoryStore.getObservationalMemoryHistory(threadId, 'opencode-om-resource', 5);
          if (history && history.length > 0) {
            console.log(`   ✓ Found ${history.length} historical records:`);
            history.forEach((rec: any, i: number) => {
              console.log(`     ${i + 1}. Gen ${rec.generationCount}: ${rec.totalTokensObserved} tokens`);
            });
          } else {
            console.log(`   ✗ No historical records found`);
          }
        } catch (e: any) {
          console.log(`   ✗ Error: ${e.message}`);
        }
      }
    } else {
      console.log('\n2. getObservationalMemoryHistory method not available');
    }

    console.log('\n📝 Summary:');
    console.log('   Observational memory is stored in a separate table (mastra_om or similar).');
    console.log('   Records are created when observations are processed.');
    console.log('   If no records exist, it means observations haven\'t been processed yet.');
    console.log('\n   Check the agent logs for "[OM] observation start/end" messages to see');
    console.log('   when observations are being processed.');

  } catch (error) {
    console.error('[Check-OM-Records] Error:', error);
  }
}

checkOMRecords().catch(console.error);
