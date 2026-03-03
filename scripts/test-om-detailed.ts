// scripts/test-om-detailed.ts
// Detailed test to check if observer/reflector agents are working
import { handleMessage } from '../src/opencode/runtime.js';
import { memory } from '../src/mastra/memory.js';
import { LibSQLStore } from '@mastra/libsql';
import { config } from 'dotenv';

config();

const THREAD = 'test-om-detailed';

async function run() {
  console.log('[Test-OM-Detailed] Detailed OM test...\n');

  try {
    // Check if observer agent exists
    const mem = memory as any;
    if (typeof mem.getObserverAgent === 'function') {
      const observer = mem.getObserverAgent();
      console.log('✓ Observer agent created:');
      console.log(`  - ID: ${observer.id}`);
      console.log(`  - Name: ${observer.name}`);
      console.log(`  - Model: ${observer.model}`);
    } else {
      console.log('✗ getObserverAgent method not found');
    }

    if (typeof mem.getReflectorAgent === 'function') {
      const reflector = mem.getReflectorAgent();
      console.log('\n✓ Reflector agent created:');
      console.log(`  - ID: ${reflector.id}`);
      console.log(`  - Name: ${reflector.name}`);
      console.log(`  - Model: ${reflector.model}`);
    } else {
      console.log('\n✗ getReflectorAgent method not found');
    }

    // Send a few messages
    console.log('\n📝 Sending test messages...\n');

    const messages = [
      'Note: The project deadline is March 15, 2026.',
      'Note: The team consists of 5 developers.',
      'Note: The tech stack includes React, Node.js, and PostgreSQL.',
    ];

    for (let i = 0; i < messages.length; i++) {
      console.log(`Message ${i + 1}: ${messages[i]}`);
      await handleMessage(THREAD, messages[i]);
      console.log(`  ✓ Response received\n`);
    }

    // Check OM record status
    console.log('📊 Checking OM record status...\n');

    const store = new LibSQLStore({
      id: 'opencode-om-store',
      url: process.env.DATABASE_URL || 'file:./opencode_om.db'
    });

    const memoryStore = await store.getStore('memory') as any;
    const record = await memoryStore.getObservationalMemory(THREAD, 'opencode-om-resource');

    if (record) {
      console.log('OM Record Status:');
      console.log(`  - Last observed: ${record.lastObservedAt || 'Never'}`);
      console.log(`  - Generation count: ${record.generationCount}`);
      console.log(`  - Total tokens: ${record.totalTokensObserved}`);
      console.log(`  - Observation tokens: ${record.observationTokenCount}`);
      console.log(`  - Pending message tokens: ${record.pendingMessageTokens}`);
      console.log(`  - Active observations: ${record.activeObservations ? record.activeObservations.length : 0}`);
      console.log(`  - Is observing: ${record.isObserving}`);
      console.log(`  - Is reflecting: ${record.isReflecting}`);
      console.log(`  - Is buffering observation: ${record.isBufferingObservation}`);
      console.log(`  - Is buffering reflection: ${record.isBufferingReflection}`);

      if (record.isBufferingObservation) {
        console.log('\n⚠️  Observation is currently being buffered (async)');
      }
    } else {
      console.log('✗ No OM record found');
    }

    console.log('\n✅ Test completed');

  } catch (error) {
    console.error('[Test-OM-Detailed] Error:', error);
  }
}

run().catch((e) => (console.error(e), process.exit(1)));
