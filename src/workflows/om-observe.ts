// src/workflows/om-observe.ts
// Manual observation trigger for OM with hooks support
import { memory } from '../mastra/memory.js';

export async function forceObserve(threadId: string, externalMessages?: any[]) {
  console.log(`[OM] Manual observation triggered for thread: ${threadId}`);
  
  try {
    // Access the internal memory observation system
    const mem = memory as any;
    
    // Check if observational memory is available
    if (mem.observationalMemory) {
      await mem.observationalMemory.observe({
        threadId,
        messages: externalMessages,
        hooks: {
          onObservationStart: () => console.log(`[OM] observation start (${threadId})`),
          onObservationEnd:   () => console.log('[OM] observation end'),
          onReflectionStart:  () => console.log('[OM] reflection start'),
          onReflectionEnd:    () => console.log('[OM] reflection end')
        }
      });
    } else {
      console.log('[OM] Observational memory not available in current implementation');
    }
    
    return { threadId, messages: externalMessages, observed: true };
  } catch (error) {
    console.error(`[OM] Error during observation for thread ${threadId}:`, error);
    throw error;
  }
}
