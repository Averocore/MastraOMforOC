# Deployment Guide: Local vs Global

## Current Configuration: LOCAL WORKSPACE ONLY

Your application is currently configured for **local workspace only** using SQLite file-based storage.

### Local Configuration (Current)
- **Storage:** SQLite file (`opencode_om.db`)
- **Location:** Project root directory
- **Scope:** Single machine only
- **Use Case:** Development, testing, personal use

### Why Local Only?
1. **File-based storage** - SQLite database is a single file on your machine
2. **No network access** - Other machines cannot access the database file
3. **Single user** - Only one person can use the application at a time

---

## Switching to Cloud/Global Deployment

If you need to deploy globally (accessible from anywhere), you have several options:

### Option 1: Turso (Recommended for SQLite-compatible)
```bash
# Install Turso CLI
curl -sSLf https://get.tur.so/install.sh | bash

# Create database
turso db create opencode-om

# Get connection URL
turso db show opencode-om --url

# Update .env
DATABASE_URL="libsql://your-database.turso.io"
# Add auth token
TURSO_AUTH_TOKEN="your-token"
```

### Option 2: Cloudflare D1
```bash
# Create D1 database
wrangler d1 create opencode-om

# Get binding info
# Update wrangler.toml and .env
```

### Option 3: Docker PostgreSQL
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: opencode_om
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Then update `.env`:
```env
DATABASE_URL=postgres://user:password@localhost:5432/opencode_om
```

### Option 4: Managed PostgreSQL
- **AWS RDS PostgreSQL**
- **Google Cloud SQL**
- **Azure Database for PostgreSQL**
- **Supabase** (free tier available)

---

## Environment-Specific Configuration

Create separate environment files:

### `.env.local` (Local Development)
```env
DATABASE_URL=file:./opencode_om.db
ACTOR_MODEL=openrouter/xiaomi/mimo-v2-flash
OPENROUTER_API_KEY=sk-or-v1-...
```

### `.env.production` (Cloud Deployment)
```env
DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-token
ACTOR_MODEL=openrouter/xiaomi/mimo-v2-flash
OPENROUTER_API_KEY=sk-or-v1-...
```

### `.env.example` (Template)
Update `.env.example` to show both options:
```env
# Local Development (SQLite)
DATABASE_URL=file:./opencode_om.db

# Cloud Deployment (Turso)
# DATABASE_URL=libsql://your-database.turso.io
# TURSO_AUTH_TOKEN=your-token

# Actor model
ACTOR_MODEL=openrouter/xiaomi/mimo-v2-flash

# API Keys
OPENROUTER_API_KEY=sk-or-v1-...
```

---

## Migration Steps

### From Local to Cloud

1. **Choose a cloud provider** (Turso recommended for SQLite compatibility)
2. **Create cloud database**
3. **Export local data** (if needed):
   ```bash
   # Dump SQLite database
   sqlite3 opencode_om.db .dump > backup.sql
   ```
4. **Import to cloud database** (provider-specific)
5. **Update `.env`** with cloud connection string
6. **Test the connection**
7. **Deploy your application**

### Maintaining Both Environments

Use environment variables to switch between local and cloud:

```typescript
// src/mastra/store.ts
import { LibSQLStore } from '@mastra/libsql';
import { ENV } from '@utils/env';

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

export async function getStore() {
  const url = isProduction 
    ? ENV.CLOUD_DATABASE_URL  // Cloud connection
    : ENV.LOCAL_DATABASE_URL; // Local SQLite file
  
  return new LibSQLStore({
    id: 'opencode-om-store',
    url: url
  });
}
```

---

## Current Status

✅ **Local workspace configured and working**
- SQLite database: `opencode_om.db`
- All smoke tests passing
- OM system verified working

⚠️ **Not accessible globally**
- Database file is local to your machine
- Other users cannot access it
- Not suitable for team collaboration

---

## Recommendations

### For Personal/Development Use
- **Keep current local configuration**
- Simple, fast, no infrastructure needed
- Perfect for testing and development

### For Team/Collaboration Use
- **Switch to Turso** (SQLite-compatible, easy migration)
- **Or use Supabase** (free PostgreSQL, great for teams)

### For Production Deployment
- **Use managed PostgreSQL** (RDS, Cloud SQL, etc.)
- **Add proper security** (encryption, backups, monitoring)
- **Consider scaling** (read replicas, connection pooling)

---

## Quick Start for Cloud Deployment

### Turso (Recommended)
```bash
# 1. Install Turso
curl -sSLf https://get.tur.so/install.sh | bash

# 2. Login
turso auth login

# 3. Create database
turso db create opencode-om --location us-east

# 4. Get connection info
turso db show opencode-om

# 5. Update .env
DATABASE_URL="libsql://your-database.turso.io"
TURSO_AUTH_TOKEN="your-token"

# 6. Test connection
npm run smoke:prompt
```

### Supabase (Free PostgreSQL)
```bash
# 1. Create project at supabase.com
# 2. Get connection string from dashboard
# 3. Update .env
DATABASE_URL="postgresql://user:pass@host:5432/db"

# 4. Install PostgreSQL driver
npm install @mastra/pg

# 5. Update src/mastra/store.ts to use PostgresStore
```
