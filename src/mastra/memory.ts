// src/mastra/memory.ts
// Minimal OM-enabled Memory scaffold.
// Default background model for OM is google/gemini-2.5-flash when observationalMemory: true.
import { Memory } from '@mastra/memory';
import { store } from './store.js';

const OM_MODEL = process.env.OM_MODEL;

export const memory = new Memory({
  options: {
    observationalMemory: OM_MODEL ? { model: OM_MODEL } : true
  }
});
