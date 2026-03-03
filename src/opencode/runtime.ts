// src/opencode/runtime.ts
// Direct-wiring runtime handler for OpenCode → Mastra agent.
import { agent } from '../mastra/agent.js';

export async function handleMessage(threadId: string, userText: string) {
  const response = await (agent as any).respond?.({ threadId, input: userText })
    ?? await (agent as any).run?.({ threadId, input: userText });
  return response?.output ?? String(response);
}
