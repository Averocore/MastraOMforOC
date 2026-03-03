// scripts/smoke-prompt-order.ts
import { buildSystemPrompt } from '../src/utils/prompt.js';
const today = new Date().toISOString().slice(0,10);
const observations = `## ${today}
🔴 User prefers PostgreSQL over SQLite.
🟡 Timezone recorded as UTC.`;
const prompt = buildSystemPrompt(observations, true);
console.log('[Smoke:prompt] Prompt →\n', prompt);
