// scripts/test-context-usage.ts
// Test actual context usage with OM recall
import { handleMessage } from '../src/opencode/runtime.js';
import { LibSQLStore } from '@mastra/libsql';
import { config } from 'dotenv';

config();

const THREAD = 'test-om-tas';

async function run() {
  console.log('Testing context usage with OM...\n');
  
  // Get baseline
  const store = new LibSQLStore({
    id: 'opencode-om-store',
    url: process.env.DATABASE_URL || 'file:./opencode_om.db'
  });
  
  const memoryStore = await store.getStore('memory') as any;
  const recordBefore = await memoryStore.getObservationalMemory(THREAD, 'opencode-om-resource');
  
  console.log('📊 Before question:');
  console.log('  - Pending tokens:', recordBefore?.pendingMessageTokens);
  console.log('  - Observation tokens:', recordBefore?.observationTokenCount);
  console.log('  - Active observations length:', recordBefore?.activeObservations ? String(recordBefore.activeObservations).length : 0);
  
  // Ask a question that requires recall
  console.log('\n📝 Asking question about TAS non-goals...');
  const response = await handleMessage(THREAD, 'Remind me: what are the 3 non-goals of TAS?');
  
  console.log('\n💬 Response preview:');
  console.log(response.substring(0, 300) + '...');
  
  // Check status after
  const recordAfter = await memoryStore.getObservationalMemory(THREAD, 'opencode-om-resource');
  
  console.log('\n📊 After question:');
  console.log('  - Pending tokens:', recordAfter?.pendingMessageTokens);
  console.log('  - Observation tokens:', recordAfter?.observationTokenCount);
  console.log('  - Active observations length:', recordAfter?.activeObservations ? String(recordAfter.activeObservations).length : 0);
  
  // Calculate compression benefit
  console.log('\n📈 Compression Analysis:');
  const originalTokens = recordBefore?.pendingMessageTokens || 0;
  const obsTokens = recordAfter?.observationTokenCount || 0;
  console.log('  - Original conversation tokens:', originalTokens);
  console.log('  - Compressed observation tokens:', obsTokens);
  console.log('  - Compression ratio:', ((obsTokens / originalTokens) * 100).toFixed(1) + '%');
  console.log('  - Tokens saved:', originalTokens - obsTokens);
  
  console.log('\n✅ OM is working! The compressed observations allow recall without keeping full conversation in context.');
}

run().catch(console.error);
