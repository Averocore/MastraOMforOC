// scripts/check-om-data.ts
// Check OM data using the memory store's observation methods
import { LibSQLStore } from '@mastra/libsql';
import { Memory } from '@mastra/memory';
import { config } from 'dotenv';

config();

async function checkOMData() {
  console.log('[Check-OM] Checking observational memory data...\n');

  const store = new LibSQLStore({
    id: 'opencode-om-store',
    url: process.env.DATABASE_URL || 'file:./opencode_om.db'
  });

  try {
    // Create memory instance with the same config as our app
    const memory = new Memory({
      storage: store,
      options: {
        observationalMemory: true
      }
    });

    // Check threads
    const threads = await memory.listThreads({ filter: {}, page: 0, perPage: 100 });
    console.log(`📊 Found ${threads.threads.length} threads\n`);

    for (const thread of threads.threads) {
      console.log(`🔍 Thread: ${thread.id}`);
      console.log(`   Created: ${thread.createdAt}`);
      
      try {
        // Try to get the memory record (which includes observational data)
        const mem = memory as any;
        if (typeof mem.getOrCreateRecord === 'function') {
          const record = await mem.getOrCreateRecord({ threadId: thread.id });
          console.log(`   Memory Record:`);
          console.log(`     - Last observed at: ${record.lastObservedAt || 'Never'}`);
          console.log(`     - Observation count: ${record.observationCount || 0}`);
          console.log(`     - Active observations: ${record.activeObservations?.length || 0}`);
          console.log(`     - Buffered observations: ${record.bufferedObservations?.length || 0}`);
          console.log(`     - Buffered reflections: ${record.bufferedReflections?.length || 0}`);
          
          if (record.activeObservations && record.activeObservations.length > 0) {
            console.log(`\n   Active Observations:`);
            record.activeObservations.forEach((obs: any, i: number) => {
              console.log(`     ${i + 1}. ${obs.substring(0, 150)}${obs.length > 150 ? '...' : ''}`);
            });
          }
          
          if (record.bufferedObservations && record.bufferedObservations.length > 0) {
            console.log(`\n   Buffered Observations (waiting to be processed):`);
            record.bufferedObservations.forEach((obs: any, i: number) => {
              console.log(`     ${i + 1}. ${obs.substring(0, 150)}${obs.length > 150 ? '...' : ''}`);
            });
          }
          
          if (record.bufferedReflections && record.bufferedReflections.length > 0) {
            console.log(`\n   Buffered Reflections:`);
            record.bufferedReflections.forEach((refl: any, i: number) => {
              console.log(`     ${i + 1}. ${refl.substring(0, 150)}${refl.length > 150 ? '...' : ''}`);
            });
          }
        }
      } catch (e: any) {
        console.log(`   Could not get memory record: ${e.message}`);
      }
      
      console.log('');
    }

    // Check message content for OM data
    console.log('\n💬 Checking messages for OM data:');
    for (const thread of threads.threads) {
      const messages = await (memory as any).listMessagesByResourceId({
        resourceId: 'opencode-om-resource',
        perPage: 20
      }) || { messages: [] };
      
      console.log(`\n   Thread: ${thread.id}`);
      let omDataFound = false;
      
      messages.messages.forEach((msg: any) => {
        if (msg.content && typeof msg.content === 'string') {
          // Check for OM status data in message content
          if (msg.content.includes('data-om-status')) {
            omDataFound = true;
            try {
              const parsed = JSON.parse(msg.content);
              if (parsed.parts) {
                parsed.parts.forEach((part: any) => {
                  if (part.type === 'data-om-status' && part.data) {
                    const data = part.data;
                    console.log(`     OM Status in ${msg.role} message:`);
                    if (data.windows?.active?.observations) {
                      console.log(`       Active observations: ${data.windows.active.observations.length}`);
                    }
                    if (data.windows?.active?.reflections) {
                      console.log(`       Active reflections: ${data.windows.active.reflections.length}`);
                    }
                  }
                });
              }
            } catch (e) {
              // Not JSON, ignore
            }
          }
        }
      });
      
      if (!omDataFound) {
        console.log(`   No OM data found in messages`);
      }
    }

  } catch (error) {
    console.error('[Check-OM] Error:', error);
  }
}

checkOMData().catch(console.error);
