// scripts/test-om-threshold-cross.ts
// Test to cross the 30,000 token threshold
import { handleMessage } from '../src/opencode/runtime.js';
import { LibSQLStore } from '@mastra/libsql';
import { config } from 'dotenv';

config();

const THREAD = 'test-om-threshold-cross';

async function run() {
  console.log('[Test-OM-Threshold-Cross] Crossing 30,000 token threshold...\n');

  try {
    // Generate messages with longer content to quickly build up tokens
    const baseMessage = 'Note: This is a detailed observation about the project. ';
    const projectDetails = [
      'The project deadline is March 15, 2026, which is approximately 6 weeks from now. The client has emphasized that this deadline is firm and cannot be extended under any circumstances.',
      'The team consists of 5 senior developers, 2 mid-level developers, and 1 junior developer. Each senior developer has at least 8 years of experience in their respective domains.',
      'The tech stack includes React 18 for frontend, Node.js 20 for backend, and PostgreSQL 15 for database. All components are deployed using Docker containers orchestrated by Kubernetes.',
      'The budget allocation is $50,000 for this quarter, with additional funds available if needed. The finance team has approved an emergency fund of $25,000 for unexpected expenses.',
      'The client prefers daily standups at 9 AM EST via Zoom, with weekly sprint reviews on Fridays. They also require a comprehensive progress report every Monday morning.',
      'The testing framework is Jest for unit tests and Cypress for end-to-end testing. All code must achieve at least 80% test coverage before being merged to the main branch.',
      'The deployment pipeline uses GitHub Actions with automated testing and staging environment. Every commit to main triggers a deployment to staging within 5 minutes.',
      'The monitoring tools include Datadog for application monitoring and Sentry for error tracking. Alerts are configured to notify the team via Slack for any critical issues.',
      'The database is hosted on AWS RDS with automated backups and read replicas for scaling. The primary instance is in us-east-1, with a read replica in us-west-2.',
      'The cache layer uses Redis for session management and frequently accessed data. Redis is configured with automatic failover and persistence enabled.',
      'The API gateway is Kong, providing rate limiting, authentication, and request routing. All API endpoints are documented using OpenAPI 3.0 specification.',
      'The frontend uses TypeScript for type safety and follows atomic design principles. State management is handled by Redux Toolkit with RTK Query for API caching.',
      'The backend uses Express.js with middleware for authentication, logging, and error handling. All routes are protected with JWT authentication and role-based access control.',
      'The CI/CD pipeline runs on every commit to main, with automated security scanning and dependency vulnerability checks. Code coverage reports are generated automatically.',
      'The staging environment mirrors production configuration for accurate testing. Database migrations are run automatically before each deployment.',
      'The production environment uses auto-scaling groups and load balancers for high availability. Health checks are configured to automatically replace unhealthy instances.',
      'The development environment uses Docker containers for consistent setup across team members. Each developer has their own isolated development database.',
      'The documentation is maintained in Markdown format with automated API documentation generation. All code changes must include corresponding documentation updates.',
      'The code review process requires at least 2 approvals before merging to main branch. Each PR must pass all automated checks and maintain existing test coverage.',
      'The sprint cycle is 2 weeks with planning, daily standups, and retrospective meetings. Each sprint begins with backlog grooming and story point estimation.',
    ];

    let totalTokens = 0;
    let messageCount = 0;

    // Keep sending messages until we reach 30,000+ tokens
    while (totalTokens < 35000) {
      const messageIndex = messageCount % projectDetails.length;
      const message = baseMessage + projectDetails[messageIndex];
      
      await handleMessage(THREAD, message);
      messageCount++;

      // Check token count every 5 messages
      if (messageCount % 5 === 0) {
        const store = new LibSQLStore({
          id: 'opencode-om-store',
          url: process.env.DATABASE_URL || 'file:./opencode_om.db'
        });
        const memoryStore = await store.getStore('memory') as any;
        const record = await memoryStore.getObservationalMemory(THREAD, 'opencode-om-resource');
        
        if (record) {
          totalTokens = record.pendingMessageTokens || 0;
          console.log(`Message ${messageCount}: ${totalTokens} tokens`);
          
          if (record.isBufferingObservation) {
            console.log(`  → ⚠️  Observation buffering is active!`);
          }
          if (record.isObserving) {
            console.log(`  → 🔍 Observation is running!`);
          }
        }
      }
    }

    console.log(`\n✅ Reached ${totalTokens} tokens (threshold: 30,000)\n`);

    // Check final OM record status
    const store = new LibSQLStore({
      id: 'opencode-om-store',
      url: process.env.DATABASE_URL || 'file:./opencode_om.db'
    });
    const memoryStore = await store.getStore('memory') as any;
    const record = await memoryStore.getObservationalMemory(THREAD, 'opencode-om-resource');

    if (record) {
      console.log('📊 Final OM Record Status:');
      console.log(`  - Last observed: ${record.lastObservedAt || 'Never'}`);
      console.log(`  - Generation count: ${record.generationCount}`);
      console.log(`  - Total tokens: ${record.totalTokensObserved}`);
      console.log(`  - Pending message tokens: ${record.pendingMessageTokens}`);
      console.log(`  - Observation tokens: ${record.observationTokenCount}`);
      console.log(`  - Active observations: ${record.activeObservations ? record.activeObservations.length : 0}`);
      console.log(`  - Is observing: ${record.isObserving}`);
      console.log(`  - Is reflecting: ${record.isReflecting}`);
      console.log(`  - Is buffering observation: ${record.isBufferingObservation}`);
      console.log(`  - Is buffering reflection: ${record.isBufferingReflection}`);

      if (record.activeObservations && record.activeObservations.length > 0) {
        console.log('\n📝 Active Observations:');
        const obsArray = Array.isArray(record.activeObservations) 
          ? record.activeObservations 
          : [record.activeObservations];
        obsArray.forEach((obs: string, i: number) => {
          if (obs) {
            console.log(`   ${i + 1}. ${obs.substring(0, 200)}${obs.length > 200 ? '...' : ''}`);
          }
        });
      } else {
        console.log('\n⚠️  No active observations found yet');
      }
    } else {
      console.log('✗ No OM record found');
    }

    console.log(`\n✅ Test completed. Sent ${messageCount} messages.`);

  } catch (error) {
    console.error('[Test-OM-Threshold-Cross] Error:', error);
  }
}

run().catch((e) => (console.error(e), process.exit(1)));
