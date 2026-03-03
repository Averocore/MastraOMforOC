// scripts/test-om-tas-continue.ts
// Continue the TAS test to reach the 30,000 token threshold
import { handleMessage } from '../src/opencode/runtime.js';
import { LibSQLStore } from '@mastra/libsql';
import { config } from 'dotenv';

config();

const THREAD = 'test-om-tas';

// Additional questions to push us over the 30,000 token threshold
const ADDITIONAL_QUESTIONS = [
  "Can you explain the backpressure mechanism in TAS in more detail?",
  "What are the key components of the TAS architecture?",
  "How does TAS handle multi-tenant isolation?",
  "What storage backends does TAS use for aggregates and raw events?",
  "Explain the query API and how it decides between OLAP and object storage.",
  "What are the scaling strategies for TAS components?",
  "Describe the failure modes and mitigations for TAS.",
  "How does TAS ensure security and compliance?",
];

async function run() {
  console.log('[Test-OM-TAS-Continue] Continuing TAS test to reach token threshold...\n');

  try {
    // Get current token count
    const store = new LibSQLStore({
      id: 'opencode-om-store',
      url: process.env.DATABASE_URL || 'file:./opencode_om.db'
    });

    const memoryStore = await store.getStore('memory') as any;
    let record = await memoryStore.getObservationalMemory(THREAD, 'opencode-om-resource');

    console.log(`Current tokens: ${record?.pendingMessageTokens || 0}`);
    console.log(`Target: 30,000 tokens`);
    console.log(`Remaining: ${30000 - (record?.pendingMessageTokens || 0)}\n`);

    // Send additional questions until we reach threshold
    let i = 0;
    while (i < ADDITIONAL_QUESTIONS.length && (record?.pendingMessageTokens || 0) < 30000) {
      console.log(`Sending question ${i + 1}/${ADDITIONAL_QUESTIONS.length}: ${ADDITIONAL_QUESTIONS[i].substring(0, 50)}...`);
      await handleMessage(THREAD, ADDITIONAL_QUESTIONS[i]);

      // Check token count after each message
      record = await memoryStore.getObservationalMemory(THREAD, 'opencode-om-resource');
      console.log(`  → Tokens: ${record?.pendingMessageTokens || 0}`);

      if (record?.isBufferingObservation) {
        console.log(`  → ⚠️  Observation buffering is active!`);
      }

      i++;
    }

    console.log('\n📊 Final OM Record Status:');
    record = await memoryStore.getObservationalMemory(THREAD, 'opencode-om-resource');
    if (record) {
      console.log(`  - Last observed: ${record.lastObservedAt || 'Never'}`);
      console.log(`  - Generation count: ${record.generationCount}`);
      console.log(`  - Total tokens: ${record.totalTokensObserved}`);
      console.log(`  - Pending message tokens: ${record.pendingMessageTokens}`);
      console.log(`  - Observation tokens: ${record.observationTokenCount}`);
      console.log(`  - Active observations: ${record.activeObservations ? record.activeObservations.length : 0}`);
      console.log(`  - Is observing: ${record.isObserving}`);
      console.log(`  - Is reflecting: ${record.isReflecting}`);
      console.log(`  - Is buffering observation: ${record.isBufferingObservation}`);

      if (record.activeObservations && record.activeObservations.length > 0) {
        console.log('\n📝 Active Observations:');
        const obsArray = Array.isArray(record.activeObservations)
          ? record.activeObservations
          : [record.activeObservations];
        obsArray.forEach((obs: string, i: number) => {
          if (obs) {
            console.log(`   ${i + 1}. ${obs.substring(0, 200)}${obs.length > 200 ? '...' : ''}`);
          }
        });
      }
    }

    console.log('\n✅ Test completed');

  } catch (error) {
    console.error('[Test-OM-TAS-Continue] Error:', error);
    process.exit(1);
  }
}

run();
