// src/mastra/memory.ts
// OM-enabled Memory with observational memory configuration.
// Default background model for OM is google/gemini-2.5-flash when observationalMemory: true.
import { Memory } from '@mastra/memory';
import { ENV } from '@utils/env';
import { store } from './store.js';

// Configure observational memory with a model that works with OpenRouter
// Using a cheaper model that's available on OpenRouter for the observer/reflector
const observationalMemoryConfig = ENV.OM_MODEL 
  ? { model: ENV.OM_MODEL }
  : { 
      model: 'openrouter/openai/gpt-4o-mini', // Use GPT-4o-mini for observer/reflector
      observation: {
        messageTokens: 30_000,
      },
      reflection: {
        observationTokens: 40_000,
      }
    };

export const memory = new Memory({
  storage: store,
  options: {
    observationalMemory: observationalMemoryConfig
  }
});

console.log('[Memory] Observational memory config:', {
  enabled: true,
  model: observationalMemoryConfig.model,
  storage: 'LibSQL (SQLite)',
  observationThreshold: observationalMemoryConfig.observation?.messageTokens || 30000,
  reflectionThreshold: observationalMemoryConfig.reflection?.observationTokens || 40000
});

export async function getMemoryRecord(threadId: string) {
  try {
    const record = await (memory as any).getOrCreateRecord?.({ threadId });
    return record;
  } catch (error) {
    console.error(`[Memory] Failed to get record for thread ${threadId}:`, error);
    return null;
  }
}
