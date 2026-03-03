# Mastra OM ↔ OpenCode Integration Playbook
**Version:** 2026-03-03 • **Status:** Stable • **Audience:** Engineering (Agents/Runtime)

> This document delivers two **official** ways to integrate **Mastra Observational Memory (OM)** into **OpenCode**, plus **smoke tests** for your runtime. It is aligned with the Mastra monorepo’s OpenCode integration work (see `.opencode` and `integrations/opencode`) and OM docs/releases. citeturn11search50turn4search25turn11search54

---

## Contents
- [A. Official Integration (Option‑B: Direct Wiring)](#a-official-integration-optionb-direct-wiring)
  - [A.1 Overview & Assumptions](#a1-overview--assumptions)
  - [A.2 Interactive To‑Dos (Progress Log)](#a2-interactive-to-dos-progress-log)
  - [A.3 Code Snippets (Direct Wiring)](#a3-code-snippets-direct-wiring)
- [B. Official Integration (Plugin Path)](#b-official-integration-plugin-path)
- [C. Smoke Tests for OM Correctness](#c-smoke-tests-for-om-correctness)
- [D. References](#d-references)

---

## A. Official Integration (Option‑B: Direct Wiring)

Use this when you want **full control** of OM behavior (manual triggers, custom prompt wiring, batching, CI backfills). The Mastra repo shows a first‑party OpenCode integration area, and the OM enablement is provided by `@mastra/memory`. citeturn11search50

### A.1 Overview & Assumptions
- You run **Node 20+**, TypeScript.
- Your OM store is **Postgres**, **LibSQL**, or **MongoDB** (the officially supported OM stores today). citeturn4search25  
- When you enable `observationalMemory: true`, the **default background model** for OM’s Observer/Reflector is **`google/gemini‑2.5‑flash`** unless you override it. citeturn4search25  
- OM compresses conversation history into a **stable, cacheable observation prefix**, improving long‑horizon coherence and cost (supported by Mastra research and coverage). citeturn4search13turn4search15

### A.2 Interactive To‑Dos (Progress Log)

**Stage 1 — Project Setup**
- [ ] **Create project** scaffold (TypeScript, ESM).
- [ ] **Install**: `@mastra/core`, `@mastra/memory`, and **one** store: `@mastra/pg` **or** `@mastra/libsql` **or** `@mastra/mongodb`. citeturn4search25  
- [ ] Add `.env` with `DATABASE_URL`, `ACTOR_MODEL`, optional `OM_MODEL`.

**Stage 2 — Wire OM (Direct)**
- [ ] Initialize the **store** (pg/libsql/mongodb). citeturn4search25  
- [ ] Create `Memory` with `{ options: { observationalMemory: true | { model: '...' } } }`. (Default background model is Gemini if `true`.) citeturn4search25  
- [ ] Define your **Agent** (Actor) with `memory` attached.  
- [ ] Implement `handleMessage(threadId, input)` to call `agent.respond()`/`run()`.

**Stage 3 — Manual Observe (Object signature + hooks)**
- [ ] Add `forceObserve(threadId, messages?)` using **object‑signature** `observe({ threadId, resourceId?, messages?, hooks? })`.  
- [ ] Use **hooks** to instrument observation/reflection start/end.  
- [ ] If you assemble system prompts yourself, adopt **preamble → <observations> → instructions** using **exported constants**.

**Stage 4 — Introspection & Ops**
- [ ] Call `getOrCreateRecord({ threadId })` to **pre‑warm** or validate memory state.  
- [ ] (If on latest core) use `Harness.getObservationalMemoryRecord()` to inspect current observations and counters. citeturn11search54  
- [ ] Add logs/metrics for observation token counts and run cadence.

**Stage 5 — Verification**
- [ ] Run the **smoke tests** below: observation block grows; raw history shrinks; prompt order matches exports; continuation hint behaves as expected. (A recent repo entry mentions clearing stale continuation hints.) citeturn11search50

### A.3 Code Snippets (Direct Wiring)

**A.3.1 Store (choose ONE adapter)**

```ts
// src/mastra/store.ts
import { ENV } from '@utils/env';
import { createPgStore } from '@mastra/pg';
export const store = await createPgStore({ connectionString: ENV.DATABASE_URL });
// OM supports pg/libsql/mongodb; swap factory accordingly.  // per docs
```
*OM store support per official docs.* citeturn4search25

**A.3.2 Memory (enable OM; override model if desired)**

```ts
// src/mastra/memory.ts
import { Memory } from '@mastra/memory';
import { ENV } from '@utils/env';
export const memory = new Memory({
  options: {
    observationalMemory: ENV.OM_MODEL ? { model: ENV.OM_MODEL } : true
  }
});
```
*Default background model for OM is `google/gemini‑2.5‑flash` when using `true`.* citeturn4search25

**A.3.3 Agent (Actor) with OM**

```ts
// src/mastra/agent.ts
import { Agent } from '@mastra/core';
import { memory } from './memory.js';
export const agent = new Agent({
  name: 'opencode-om-agent',
  instructions: 'You are a helpful assistant with strong long-term memory.',
  model: process.env.ACTOR_MODEL ?? 'openai/gpt-5-mini',
  memory
});
```

**A.3.4 Runtime handler**

```ts
// src/opencode/runtime.ts
import { agent } from '../mastra/agent.js';
export async function handleMessage(threadId: string, userText: string) {
  const response = await (agent as any).respond?.({ threadId, input: userText })
             ?? await (agent as any).run?.({ threadId, input: userText });
  return response?.output ?? String(response);
}
```
*OM maintains a stable, cacheable observation prefix as turns grow, improving cost/coherence for long sessions.* citeturn4search13turn4search15

**A.3.5 Manual observe helper (object‑signature + hooks)**

```ts
// src/workflows/om-observe.ts
import { memory } from '@mastra/memory';
const om: any = (memory as any).observationalMemory ?? memory;
export async function forceObserve(threadId: string, externalMessages?: any[]) {
  await om.observe({
    threadId,
    messages: externalMessages,
    hooks: {
      onObservationStart: () => console.log(`[OM] observation start (${threadId})`),
      onObservationEnd:   () => console.log('[OM] observation end'),
      onReflectionStart:  () => console.log('[OM] reflection start'),
      onReflectionEnd:    () => console.log('[OM] reflection end')
    }
  });
}
```

**A.3.6 Prompt composition with exported constants (order)**

```ts
// src/utils/prompt.ts
import {
  OBSERVATION_CONTEXT_PROMPT,
  OBSERVATION_CONTEXT_INSTRUCTIONS,
  OBSERVATION_CONTINUATION_HINT
} from '@mastra/memory/processors/observationalmemory';
export function buildSystemPrompt(observationsText: string, includeHint = false) {
  return [
    OBSERVATION_CONTEXT_PROMPT,         // preamble
    observationsText,                   // <observations> block (dated, prioritized)
    OBSERVATION_CONTEXT_INSTRUCTIONS,   // instructions after the block
    includeHint ? OBSERVATION_CONTINUATION_HINT : ''
  ].filter(Boolean).join('

');
}
```
> The repo shows recent fixes around observation preamble/instructions ordering and stale continuation hints. Keep **preamble → observations → instructions** and include the continuation hint only when appropriate. citeturn11search50

**A.3.7 Eager record creation / introspection**

```ts
// Eagerly create or fetch OM record before first turn:
const record = await (om as any).getOrCreateRecord({ threadId });

// (If on latest core) harness-level introspection for the current thread:
// const full = await harness.getObservationalMemoryRecord();
// console.log(full?.activeObservations, full?.observationTokenCount);
```
*The harness method for introspection appears in a recent release.* citeturn11search54

---

## B. Official Integration (Plugin Path)

Choose this path if you want **turnkey OM integration** in OpenCode—minimal code, lifecycle‑aware, and consistent behavior out of the box. The Mastra repo shows an **`integrations/opencode`** workspace consistent with a first‑party plugin for OpenCode sessions. citeturn11search50

**What the Plugin Does**
- Wires OM into **OpenCode lifecycle**: automatically **observes**, **injects** compressed observations at the **system‑prompt prefix**, and **drops** already‑observed raw messages. citeturn11search50  
- Reads config from **`.opencode/mastra.json`** (e.g., `{ "model": "google/gemini-2.5-flash", "scope": "thread" }`).  
- Reuses OM prompt exports to ensure the **correct order** around the observation block. 

**When to Prefer the Plugin**
- You don’t need custom manual observe cycles or bespoke prompt assembly.  
- You want the **supported**, **zero‑glue** integration that evolves with OpenCode.  
- You prefer convention over configuration while retaining OM’s benefits (stable, cacheable prefix + long‑horizon memory quality). citeturn4search13turn4search15

> **Guardrail:** If you switch between Plugin and Option‑B, avoid **double observation/injection** by using only one approach at a time. citeturn11search50

---

## C. Smoke Tests for OM Correctness

These minimal tests validate that your runtime is leveraging OM as intended after integration.

**C.1 Observation Growth & History Shrink**

```ts
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
  console.log('Recall:', answer);
}
run().catch((e) => (console.error(e), process.exit(1)));
```

**C.2 Prompt Order (Preamble → Observations → Instructions)**

```ts
// scripts/smoke-prompt-order.ts
import { buildSystemPrompt } from '../src/utils/prompt.js';
const observations = `## 2026-03-03
🔴 User prefers PostgreSQL over SQLite.
🟡 Timezone recorded as UTC.`;
const prompt = buildSystemPrompt(observations, true);
console.log(prompt);
```

**C.3 Continuation Hint Hygiene**

```ts
// scripts/smoke-continuation-hint.ts
import { handleMessage } from '../src/opencode/runtime.js';
import { forceObserve } from '../src/workflows/om-observe.js';
const THREAD = 'smoke-continuation';
async function run() {
  await handleMessage(THREAD, 'Priming content…');
  await forceObserve(THREAD);
  const out1 = await handleMessage(THREAD, 'Continue the previous task.');
  console.log('Follow-up after observation:', out1);
  const out2 = await handleMessage(THREAD, 'Summarize what you remember so far.');
  console.log('Subsequent follow-up:', out2);
}
run().catch((e) => (console.error(e), process.exit(1)));
```
> Repo history mentions a fix for **stale continuation hints**—keep dependencies current as you validate this behavior. citeturn11search50

---

## D. References
- **Mastra Repo Root** — shows `.opencode` / `integrations/opencode` and OpenCode‑related commits, confirming first‑party OpenCode integration alongside OM: https://github.com/mastra-ai/mastra citeturn11search50  
- **Mastra Docs — Observational Memory** — enable OM; **default background model** (Gemini) when `true`; **supported stores** (pg/libsql/mongodb): https://mastra.ai/docs/memory/observational-memory citeturn4search25  
- **Mastra Releases/Changelog** — recent **OM introspection** (`Harness.getObservationalMemoryRecord()`) and reliability updates: https://github.com/mastra-ai/mastra/releases citeturn11search54  
- **VentureBeat / Mastra Research** — OM’s stable, cacheable context & long‑context performance characteristics: https://venturebeat.com/data/observational-memory-cuts-ai-agent-costs-10x-and-outscores-rag-on-long and https://mastra.ai/research/observational-memory citeturn4search15turn4search13
