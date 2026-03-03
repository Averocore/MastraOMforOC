// scripts/smoke-observation.ts
// Test observation growth & history shrink behavior
import { handleMessage } from '../src/opencode/runtime.js';
import { forceObserve } from '../src/workflows/om-observe.js';

const THREAD = 'smoke-obs';

async function run() {
  console.log('[Smoke:obs] Starting observation test...');
  
  try {
    await handleMessage(THREAD, 'Note: I prefer PostgreSQL over SQLite.');
    console.log('[Smoke:obs] Message 1 logged');
    
    await handleMessage(THREAD, 'Also note: my timezone is UTC.');
    console.log('[Smoke:obs] Message 2 logged');
    
    await handleMessage(THREAD, 'Please remember those.');
    console.log('[Smoke:obs] Message 3 logged');
    
    await forceObserve(THREAD);
    console.log('[Smoke:obs] Observation triggered');
    
    const answer = await handleMessage(THREAD, 'What DB do I prefer? What time zone?');
    console.log('[Smoke:obs] Recall →', answer);
    console.log('[Smoke:obs] ✅ Test completed successfully');
  } catch (error) {
    console.error('[Smoke:obs] ❌ Test failed:', error);
    throw error;
  }
}

run().catch((e) => (console.error(e), process.exit(1)));
