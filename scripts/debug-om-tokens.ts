// scripts/debug-om-tokens.ts
// Debug token usage and OM compression
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
  
  console.log('📊 Detailed OM Record Status:');
  console.log('  - Last observed:', record?.lastObservedAt || 'Never');
  console.log('  - Generation count:', record?.generationCount);
  console.log('  - Total tokens observed:', record?.totalTokensObserved);
  console.log('  - Pending message tokens:', record?.pendingMessageTokens);
  console.log('  - Observation tokens:', record?.observationTokenCount);
  console.log('  - Active observations length:', record?.activeObservations ? String(record.activeObservations).length : 0);
  console.log('  - Is observing:', record?.isObserving);
  console.log('  - Is reflecting:', record?.isReflecting);
  console.log('  - Is buffering observation:', record?.isBufferingObservation);
  console.log('  - Is buffering reflection:', record?.isBufferingReflection);
  console.log('  - Buffered observations:', record?.bufferedObservations ? record.bufferedObservations.length : 0);
  console.log('  - Buffered reflections:', record?.bufferedReflections ? record.bufferedReflections.length : 0);
  
  // Check if observations are being compressed
  if (record?.activeObservations) {
    const obsText = String(record.activeObservations);
    console.log('\n📝 Observation Analysis:');
    console.log('  - Total characters:', obsText.length);
    console.log('  - Lines:', obsText.split('\n').length);
    console.log('  - First 500 chars:', obsText.substring(0, 500));
  }
  
  // Calculate compression ratio
  const originalTokens = record?.pendingMessageTokens || 0;
  const observationChars = record?.activeObservations ? String(record.activeObservations).length : 0;
  const estimatedObsTokens = Math.floor(observationChars / 4); // Rough estimate: 4 chars per token
  
  console.log('\n📈 Compression Analysis:');
  console.log('  - Original tokens (pending):', originalTokens);
  console.log('  - Estimated observation tokens:', estimatedObsTokens);
  console.log('  - Compression ratio:', originalTokens > 0 ? (estimatedObsTokens / originalTokens * 100).toFixed(1) + '%' : 'N/A');
  console.log('  - Tokens saved:', originalTokens - estimatedObsTokens);
}

run().catch(console.error);
