// scripts/check-om-status.ts
// Check OM record status with proper type handling
import { LibSQLStore } from '@mastra/libsql';
import { config } from 'dotenv';

config();

const THREAD = 'test-om-tas';

async function run() {
  const store = new LibSQLStore({
    id: 'opencode-om-store',
    url: process.env.DATABASE_URL || 'file:./opencode_om.db'
  });
  
  const memoryStore = await store.getStore('memory') as any;
  const record = await memoryStore.getObservationalMemory(THREAD, 'opencode-om-resource');
  
  console.log('📊 OM Record Status:');
  console.log('  - Last observed:', record?.lastObservedAt || 'Never');
  console.log('  - Generation count:', record?.generationCount);
  console.log('  - Total tokens:', record?.totalTokensObserved);
  console.log('  - Pending message tokens:', record?.pendingMessageTokens);
  console.log('  - Observation tokens:', record?.observationTokenCount);
  console.log('  - Active observations:', record?.activeObservations ? (Array.isArray(record.activeObservations) ? record.activeObservations.length : 'Present') : 0);
  console.log('  - Is observing:', record?.isObserving);
  console.log('  - Is reflecting:', record?.isReflecting);
  
  if (record?.activeObservations) {
    console.log('\n✅ OBSERVATIONS CREATED!');
    if (Array.isArray(record.activeObservations)) {
      console.log('Number of observations:', record.activeObservations.length);
      console.log('\nFirst observation:');
      console.log(record.activeObservations[0].substring(0, 500) + '...');
    } else {
      console.log('Observations data type:', typeof record.activeObservations);
      console.log('Observations (first 500 chars):', String(record.activeObservations).substring(0, 500) + '...');
    }
  } else {
    console.log('\n⚠️  No active observations found');
  }
}

run().catch(console.error);
