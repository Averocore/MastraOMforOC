// scripts/test-om-threshold.ts
// Test OM by generating enough messages to trigger observation threshold
import { handleMessage } from '../src/opencode/runtime.js';
import { forceObserve } from '../src/workflows/om-observe.js';

const THREAD = 'test-om-threshold';

async function run() {
  console.log('[Test-OM-Threshold] Testing observation threshold...\n');
  console.log('Thresholds: Observation=30,000 tokens, Reflection=40,000 tokens\n');

  try {
    // Generate multiple messages to build up token count
    const messages = [
      'Note: The project deadline is March 15, 2026.',
      'Note: The team consists of 5 developers.',
      'Note: The tech stack includes React, Node.js, and PostgreSQL.',
      'Note: The budget is $50,000 for this quarter.',
      'Note: The client prefers daily standups at 9 AM.',
      'Note: The testing framework is Jest.',
      'Note: The deployment pipeline uses GitHub Actions.',
      'Note: The monitoring tool is Datadog.',
      'Note: The database is hosted on AWS RDS.',
      'Note: The cache layer uses Redis.',
      'Note: The API gateway is Kong.',
      'Note: The frontend uses TypeScript.',
      'Note: The backend uses Express.js.',
      'Note: The CI/CD pipeline runs on every commit.',
      'Note: The staging environment mirrors production.',
    ];

    console.log('Sending messages to build up token count...\n');

    for (let i = 0; i < messages.length; i++) {
      console.log(`Message ${i + 1}/${messages.length}: ${messages[i].substring(0, 50)}...`);
      await handleMessage(THREAD, messages[i]);
    }

    console.log('\n✅ All messages sent. Checking OM status...\n');

    // Check the OM record
    const { LibSQLStore } = await import('@mastra/libsql');
    const store = new LibSQLStore({
      id: 'opencode-om-store',
      url: 'file:./opencode_om.db'
    });

    const memoryStore = await store.getStore('memory') as any;
    const record = await memoryStore.getObservationalMemory(THREAD, 'opencode-om-resource');

    if (record) {
      console.log('📊 OM Record Status:');
      console.log(`   - Last observed: ${record.lastObservedAt || 'Never'}`);
      console.log(`   - Generation count: ${record.generationCount}`);
      console.log(`   - Total tokens: ${record.totalTokensObserved}`);
      console.log(`   - Observation tokens: ${record.observationTokenCount}`);
      console.log(`   - Active observations: ${record.activeObservations ? record.activeObservations.length : 0}`);
      console.log(`   - Is observing: ${record.isObserving}`);
      console.log(`   - Is reflecting: ${record.isReflecting}`);

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
    } else {
      console.log('❌ No OM record found');
    }

    console.log('\n✅ Test completed');

  } catch (error) {
    console.error('[Test-OM-Threshold] Error:', error);
  }
}

run().catch((e) => (console.error(e), process.exit(1)));
