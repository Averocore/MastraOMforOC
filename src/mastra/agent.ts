// src/mastra/agent.ts
// Minimal Actor agent wired to OM memory.
import { Agent } from '@mastra/core/agent';
import { memory } from './memory.js';

export const agent = new Agent({
  id: 'opencode-om-agent',
  name: 'opencode-om-agent',
  instructions: 'You are a helpful assistant with strong long-term memory.',
  model: process.env.ACTOR_MODEL ?? 'openai/gpt-5-mini',
  memory
});
