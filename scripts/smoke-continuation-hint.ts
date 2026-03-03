// scripts/smoke-continuation-hint.ts
import { handleMessage } from '../src/opencode/runtime.js';
import { forceObserve } from '../src/workflows/om-observe.js';
const THREAD = 'smoke-continuation';
async function run() {
  await handleMessage(THREAD, 'Priming content…');
  await forceObserve(THREAD);
  const out1 = await handleMessage(THREAD, 'Continue the previous task.');
  console.log('[Smoke:hint] Post-observe follow-up →', out1);
  const out2 = await handleMessage(THREAD, 'Summarize what you remember so far.');
  console.log('[Smoke:hint] Subsequent follow-up →', out2);
}
run().catch((e) => (console.error(e), process.exit(1)));
