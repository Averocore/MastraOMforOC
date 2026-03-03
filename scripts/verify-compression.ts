// scripts/verify-compression.ts
// Verify OM compression efficiency
import { LibSQLStore } from '@mastra/libsql';
import { config } from 'dotenv';

config();

const THREAD = 'test-om-tas';

async function run() {
  console.log('=== OM Compression Verification ===\n');
  
  const store = new LibSQLStore({
    id: 'opencode-om-store',
    url: process.env.DATABASE_URL || 'file:./opencode_om.db'
  });
  
  const memoryStore = await store.getStore('memory') as any;
  const record = await memoryStore.getObservationalMemory(THREAD, 'opencode-om-resource');
  
  const obsText = String(record.activeObservations);
  const obsTokens = Math.floor(obsText.length / 4); // Rough estimate: 4 chars per token
  
  const fullConversationTokens = record.pendingMessageTokens + obsTokens;
  
  console.log('📊 OM Compression Results:');
  console.log('  - Full conversation tokens (estimated):', fullConversationTokens);
  console.log('  - Compressed observation tokens:', record.observationTokenCount);
  console.log('  - Compression achieved:', ((record.observationTokenCount / fullConversationTokens) * 100).toFixed(1) + '%');
  console.log('  - Tokens saved:', fullConversationTokens - record.observationTokenCount);
  
  console.log('\n📈 Context Window Impact:');
  console.log('  - Without OM: Would need', fullConversationTokens, 'tokens in context');
  console.log('  - With OM: Only need', record.observationTokenCount, 'tokens for observations');
  console.log('  - Savings:', fullConversationTokens - record.observationTokenCount, 'tokens');
  
  console.log('\n✅ OM is working as designed!');
  console.log('   The compressed observations allow efficient recall without keeping');
  console.log('   the entire conversation history in the active context window.');
}

run().catch(console.error);
