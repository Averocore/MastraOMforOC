// scripts/test-om-heavy.ts
// Heavy test to trigger observation thresholds
import { handleMessage } from '../src/opencode/runtime.js';
import { LibSQLStore } from '@mastra/libsql';
import { config } from 'dotenv';

config();

const THREAD = 'test-om-heavy';

async function run() {
  console.log('[Test-OM-Heavy] Heavy OM test to trigger thresholds...\n');
  console.log('Target: 30,000 tokens for observation threshold\n');

  try {
    // Generate many messages with longer content to build up tokens
    const baseMessage = 'Note: This is a detailed observation about the project. ';
    const projectDetails = [
      'The project deadline is March 15, 2026, which is approximately 6 weeks from now.',
      'The team consists of 5 senior developers, 2 mid-level developers, and 1 junior developer.',
      'The tech stack includes React 18 for frontend, Node.js 20 for backend, and PostgreSQL 15 for database.',
      'The budget allocation is $50,000 for this quarter, with additional funds available if needed.',
      'The client prefers daily standups at 9 AM EST via Zoom, with weekly sprint reviews on Fridays.',
      'The testing framework is Jest for unit tests and Cypress for end-to-end testing.',
      'The deployment pipeline uses GitHub Actions with automated testing and staging environment.',
      'The monitoring tools include Datadog for application monitoring and Sentry for error tracking.',
      'The database is hosted on AWS RDS with automated backups and read replicas for scaling.',
      'The cache layer uses Redis for session management and frequently accessed data.',
      'The API gateway is Kong, providing rate limiting, authentication, and request routing.',
      'The frontend uses TypeScript for type safety and follows atomic design principles.',
      'The backend uses Express.js with middleware for authentication, logging, and error handling.',
      'The CI/CD pipeline runs on every commit to main, with automated security scanning.',
      'The staging environment mirrors production configuration for accurate testing.',
      'The production environment uses auto-scaling groups and load balancers for high availability.',
      'The development environment uses Docker containers for consistent setup across team members.',
      'The documentation is maintained in Markdown format with automated API documentation generation.',
      'The code review process requires at least 2 approvals before merging to main branch.',
      'The sprint cycle is 2 weeks with planning, daily standups, and retrospective meetings.',
    ];

    console.log('Sending messages...\n');

    let totalTokens = 0;
    for (let i = 0; i < 50; i++) {
      const messageIndex = i % projectDetails.length;
      const message = baseMessage + projectDetails[messageIndex];
      console.log(`Message ${i + 1}/${50}: ${message.substring(0, 60)}...`);
      
      await handleMessage(THREAD, message);
      
      // Check token count every 10 messages
      if (i % 10 === 9) {
        const store = new LibSQLStore({
          id: 'opencode-om-store',
          url: process.env.DATABASE_URL || 'file:./opencode_om.db'
        });
        const memoryStore = await store.getStore('memory') as any;
        const record = await memoryStore.getObservationalMemory(THREAD, 'opencode-om-resource');
        
        if (record) {
          console.log(`  → Tokens: ${record.pendingMessageTokens}, Observations: ${record.activeObservations?.length || 0}`);
          totalTokens = record.pendingMessageTokens || 0;
        }
      }
    }

    console.log('\n📊 Final OM record status:\n');

    const store = new LibSQLStore({
      id: 'opencode-om-store',
      url: process.env.DATABASE_URL || 'file:./opencode_om.db'
    });
    const memoryStore = await store.getStore('memory') as any;
    const record = await memoryStore.getObservationalMemory(THREAD, 'opencode-om-resource');

    if (record) {
      console.log('OM Record Status:');
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
      }
    } else {
      console.log('✗ No OM record found');
    }

    console.log(`\n✅ Test completed. Total tokens accumulated: ${totalTokens}`);

  } catch (error) {
    console.error('[Test-OM-Heavy] Error:', error);
  }
}

run().catch((e) => (console.error(e), process.exit(1)));
