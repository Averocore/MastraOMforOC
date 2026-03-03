// src/utils/env.ts
// Environment configuration with validation

export interface EnvConfig {
  DATABASE_URL: string;
  ACTOR_MODEL: string;
  OM_MODEL?: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  GOOGLE_API_KEY?: string;
}

export function loadEnv(): EnvConfig {
  const errors: string[] = [];

  const config: EnvConfig = {
    DATABASE_URL: process.env.DATABASE_URL || '',
    ACTOR_MODEL: process.env.ACTOR_MODEL || 'openai/gpt-5-mini',
    OM_MODEL: process.env.OM_MODEL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY
  };

  if (!config.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n- ${errors.join('\n- ')}`);
  }

  return config;
}

export const ENV = loadEnv();
