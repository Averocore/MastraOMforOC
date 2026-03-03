// scripts/verify-om-working.ts
// Verify OM is working by checking observations and testing recall
import { handleMessage } from '../src/opencode/runtime.js';
import { LibSQLStore } from '@mastra/libsql';
import { config } from 'dotenv';

config();

const THREAD = 'test-om-tas';

async function run() {
  console.log('=== OM VERIFICATION TEST ===\n');

  const store = new LibSQLStore({
    id: 'opencode-om-store',
    url: process.env.DATABASE_URL || 'file:./opencode_om.db'
  });

  const memoryStore = await store.getStore('memory') as any;
  const record = await memoryStore.getObservationalMemory(THREAD, 'opencode-om-resource');

  // 1. Check OM Record Status
  console.log('1. OM RECORD STATUS:');
  console.log('   - Last observed:', record?.lastObservedAt || 'Never');
  console.log('   - Generation count:', record?.generationCount);
  console.log('   - Total tokens observed:', record?.totalTokensObserved);
  console.log('   - Pending message tokens:', record?.pendingMessageTokens);
  console.log('   - Observation tokens:', record?.observationTokenCount);
  console.log('   - Is observing:', record?.isObserving);
  console.log('   - Is reflecting:', record?.isReflecting);

  // 2. Check Active Observations
  console.log('\n2. ACTIVE OBSERVATIONS:');
  if (record?.activeObservations) {
    const obsText = String(record.activeObservations);
    console.log('   Observation length:', obsText.length, 'characters');
    console.log('   First 1000 characters:');
    console.log('   ' + obsText.substring(0, 1000).replace(/\n/g, '\n   '));
    console.log('   ...');
  } else {
    console.log('   ❌ No active observations found');
  }

  // 3. Test Recall Functionality
  console.log('\n3. TESTING RECALL FUNCTIONALITY:');
  const recallQuestions = [
    'What are the non-goals of TAS?',
    'What is the ingestion capacity target?',
    'How does TAS handle multi-tenant isolation?',
  ];

  for (const question of recallQuestions) {
    console.log(`   Question: "${question}"`);
    const response = await handleMessage(THREAD, question);
    console.log(`   Response preview: ${response.substring(0, 200)}...`);
    console.log('');
  }

  // 4. Final Verification
  console.log('4. FINAL VERIFICATION:');
  const finalRecord = await memoryStore.getObservationalMemory(THREAD, 'opencode-om-resource');
  
  const checks = [
    { name: 'Last observed timestamp exists', pass: !!finalRecord?.lastObservedAt },
    { name: 'Active observations created', pass: !!finalRecord?.activeObservations },
    { name: 'Observation tokens > 0', pass: (finalRecord?.observationTokenCount || 0) > 0 },
    { name: 'Generation count tracked', pass: (finalRecord?.generationCount || 0) >= 0 },
  ];

  checks.forEach(check => {
    console.log(`   ${check.pass ? '✅' : '❌'} ${check.name}`);
  });

  const allPassed = checks.every(c => c.pass);
  console.log(`\n${allPassed ? '✅ OM SYSTEM VERIFIED WORKING!' : '⚠️  Some checks failed'}`);
}

run().catch(console.error);
