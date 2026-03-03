// src/utils/prompt.ts
// Observation prompt constants from @mastra/memory
const OBSERVATION_CONTEXT_PROMPT = `The following observations block contains your memory of past conversations with this user.`;
const OBSERVATION_CONTEXT_INSTRUCTIONS = `Please use the observations block above as context for your response.`;
const OBSERVATION_CONTINUATION_HINT = `If this appears to be a continuation of a previous task, please note any progress made and what comes next.`;

export function buildSystemPrompt(observationsText: string, includeHint = false) {
  return [
    OBSERVATION_CONTEXT_PROMPT,
    observationsText,
    OBSERVATION_CONTEXT_INSTRUCTIONS,
    includeHint ? OBSERVATION_CONTINUATION_HINT : ''
  ].filter(Boolean).join('\n\n');
}
