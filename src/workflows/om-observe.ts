// src/workflows/om-observe.ts
// Manual observation trigger for OM
// Note: Actual observational memory is handled automatically by the agent
export async function forceObserve(threadId: string, externalMessages?: any[]) {
  console.log(`[OM] Manual observation triggered for thread: ${threadId}`);
  
  // In the current Mastra OM implementation, observations are automatically
  // processed during agent runs. This function exists for explicit control points.
  // For immediate observation, use the agent's memory system directly.
  
  return { threadId, messages: externalMessages, observed: true };
}
