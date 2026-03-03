// src/mastra/memory.ts
// OM-enabled Memory with observational memory configuration.
// Default background model for OM is google/gemini-2.5-flash when observationalMemory: true.
import { Memory } from '@mastra/memory';
import { ENV } from '@utils/env';

export const memory = new Memory({
  options: {
    observationalMemory: ENV.OM_MODEL ? { model: ENV.OM_MODEL } : true
  }
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
