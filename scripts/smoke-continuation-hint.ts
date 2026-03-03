// scripts/smoke-continuation-hint.ts
// Test continuation hint hygiene
import { handleMessage } from '../src/opencode/runtime.js';
import { forceObserve } from '../src/workflows/om-observe.js';

const THREAD = 'smoke-continuation';

async function run() {
  console.log('[Smoke:hint] Starting continuation hint test...');
  
  try {
    await handleMessage(THREAD, 'Priming content for context.');
    console.log('[Smoke:hint] Priming message sent');
    
    await forceObserve(THREAD);
    console.log('[Smoke:hint] Observation triggered');
    
    const out1 = await handleMessage(THREAD, 'Continue the previous task.');
    console.log('[Smoke:hint] Post-observe follow-up →', out1);
    
    const out2 = await handleMessage(THREAD, 'Summarize what you remember so far.');
    console.log('[Smoke:hint] Subsequent follow-up →', out2);
    console.log('[Smoke:hint] ✅ Test completed successfully');
  } catch (error) {
    console.error('[Smoke:hint] ❌ Test failed:', error);
    throw error;
  }
}

run().catch((e) => (console.error(e), process.exit(1)));
