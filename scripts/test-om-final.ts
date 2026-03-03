// scripts/test-om-final.ts
// Send final question to cross the 30,000 token threshold
import { handleMessage } from '../src/opencode/runtime.js';
import { LibSQLStore } from '@mastra/libsql';
import { config } from 'dotenv';

config();

const THREAD = 'test-om-tas';

async function run() {
  console.log('Sending final question to cross 30,000 token threshold...\n');
  
  const question = 'Can you provide a detailed comparison of the pros and cons of using ClickHouse vs BigQuery as the OLAP store for TAS aggregates, including considerations for cost, performance, scalability, and operational overhead?';
  
  console.log('Question:', question.substring(0, 100) + '...');
  await handleMessage(THREAD, question);
  
  const store = new LibSQLStore({
    id: 'opencode-om-store',
    url: process.env.DATABASE_URL || 'file:./opencode_om.db'
  });
  
  const memoryStore = await store.getStore('memory') as any;
  const record = await memoryStore.getObservationalMemory(THREAD, 'opencode-om-resource');
  
  console.log('\n📊 OM Record Status after final question:');
  console.log('  - Pending message tokens:', record?.pendingMessageTokens || 0);
  console.log('  - Is buffering observation:', record?.isBufferingObservation);
  console.log('  - Is observing:', record?.isObserving);
  
  if (record?.activeObservations && record.activeObservations.length > 0) {
    console.log('\n✅ OBSERVATIONS CREATED!');
    console.log('Active observations:', record.activeObservations.length);
    record.activeObservations.forEach((obs: string, i: number) => {
      console.log(`\nObservation ${i + 1}:`);
      console.log(obs.substring(0, 300) + '...');
    });
  } else {
    console.log('\n⚠️  Still waiting for observations...');
    console.log('Tokens needed:', 30000 - (record?.pendingMessageTokens || 0));
  }
}

run().catch(console.error);
