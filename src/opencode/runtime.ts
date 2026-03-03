// src/opencode/runtime.ts
// Direct-wiring runtime handler for OpenCode → Mastra agent.
import { agent } from '../mastra/agent.js';
import { getMemoryRecord } from '../mastra/memory.js';
import { logger } from '@utils/logger.js';

export async function handleMessage(threadId: string, userText: string) {
  logger.info('Handling message', { threadId, messageLength: userText.length });

  try {
    // Pre-warm memory for this thread
    await getMemoryRecord(threadId);
    logger.debug('Memory pre-warmed', { threadId });

    // Execute agent response with thread context
    const response = await agent.generate([
      { role: 'user', content: userText }
    ], {
      memory: {
        thread: threadId,
        resource: 'opencode-om-resource'
      }
    });

    logger.info('Agent response generated', {
      threadId,
      outputLength: response.text?.length || 0
    });

    return response.text;
  } catch (error) {
    logger.error('Error handling message', {
      threadId,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

// Alternative method for backward compatibility
export async function runAgent(threadId: string, input: string) {
  return handleMessage(threadId, input);
}
