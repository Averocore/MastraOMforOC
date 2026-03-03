// scripts/smoke-observation.ts
import { handleMessage } from '../src/opencode/runtime.js';
import { forceObserve } from '../src/workflows/om-observe.js';
const THREAD = 'smoke-obs';
async function run() {
  await handleMessage(THREAD, 'Note: I prefer PostgreSQL over SQLite.');
  await handleMessage(THREAD, 'Also note: my timezone is UTC.');
  await handleMessage(THREAD, 'Please remember those.');
  await forceObserve(THREAD);
  const answer = await handleMessage(THREAD, 'What DB do I prefer? What time zone?');
  console.log('[Smoke:obs] Recall →', answer);
}
run().catch((e) => (console.error(e), process.exit(1)));
