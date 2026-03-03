# Mastra OM ↔ OpenCode Integration Playbook
**Version:** 2026-03-03 • **Status:** Stable • **Audience:** Engineering (Agents/Runtime)

This playbook provides two **official** ways to integrate **Mastra Observational Memory (OM)** into **OpenCode**, plus smoke tests for verification.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL and API keys
   ```

3. **Run smoke tests:**
   ```bash
   npm run smoke:obs        # Test observation growth & history shrink
   npm run smoke:prompt     # Test prompt order
   npm run smoke:hint       # Test continuation hint hygiene
   ```

## Documentation

- **[Full Playbook](docs/Mastra-OM-OpenCode-Integration-Playbook-2026-03-03.md)** - Complete integration guide
- **[Integration Checklist](docs/om-checklist.md)** - Step-by-step integration tasks
- **[Smoke Tests Guide](docs/SMOKE_TESTS.md)** - Testing verification

## Project Structure

```
├── src/
│   ├── mastra/          # Mastra OM configuration
│   │   ├── agent.ts     # Agent with OM memory
│   │   ├── memory.ts    # OM memory setup
│   │   └── store.ts     # Postgres store adapter
│   ├── opencode/        # OpenCode runtime
│   │   └── runtime.ts   # Message handler
│   ├── utils/           # Utilities
│   │   └── prompt.ts    # Prompt composition helpers
│   └── workflows/       # OM workflows
│       └── om-observe.ts # Manual observe helper
├── scripts/             # Smoke tests
├── docs/                # Documentation
└── tests/              # Additional tests
```

## Integration Options

### Option A: Direct Wiring
Full control of OM behavior with manual triggers, custom prompt wiring, and batching.

### Option B: Plugin Path
Turnkey OM integration with automatic lifecycle management and zero configuration.

See the [full playbook](docs/Mastra-OM-OpenCode-Integration-Playbook-2026-03-03.md) for detailed implementation.

## Requirements

- Node.js 20+
- TypeScript 5+
- PostgreSQL, LibSQL, or MongoDB for OM store
- API keys for your chosen LLM models

## License

MIT
