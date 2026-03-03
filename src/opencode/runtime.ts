// src/opencode/runtime.ts
// Direct-wiring runtime handler for OpenCode → Mastra agent.
import { agent } from '../mastra/agent.js';
import { getMemoryRecord } from '../mastra/memory.js';

export async function handleMessage(threadId: string, userText: string) {
  try {
    // Pre-warm memory for this thread
    await getMemoryRecord(threadId);
    
    // Execute agent response with thread context
    // Agent.generate expects messages array with memory thread and resource
    const response = await agent.generate([
      { role: 'user', content: userText }
    ], {
      memory: {
        thread: threadId,
        resource: 'opencode-om-resource'
      }
    });

    return response.text;
  } catch (error) {
    console.error(`[Runtime] Error handling message for thread ${threadId}:`, error);
    throw error;
  }
}

// Alternative method for backward compatibility
export async function runAgent(threadId: string, input: string) {
  return handleMessage(threadId, input);
}
