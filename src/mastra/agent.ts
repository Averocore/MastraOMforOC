// src/mastra/agent.ts
// Actor agent wired to OM memory with proper configuration.
import { Agent } from '@mastra/core/agent';
import { memory } from './memory.js';
import { ENV } from '@utils/env';

export const agent = new Agent({
  id: 'opencode-om-agent',
  name: 'opencode-om-agent',
  instructions: `You are a helpful assistant with strong long-term memory capabilities.

Your memory system (Observational Memory) automatically:
- Compresses conversation history into stable, cacheable observations
- Maintains context across long sessions
- Prioritizes important information for retrieval

Please be helpful, concise, and reference relevant past observations when appropriate.`,
  model: ENV.ACTOR_MODEL,
  memory,
  maxRetries: 2
});
