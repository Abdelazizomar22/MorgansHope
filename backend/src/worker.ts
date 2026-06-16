import dotenv from 'dotenv';
dotenv.config();

import { startAnalysisWorker, stopAnalysisWorker } from './workers/analysis.worker';
import { startChatWorker, stopChatWorker } from './workers/chat.worker';
import { closeRedisConnection } from './config/redis';
import { closeAnalysisQueue } from './queues/analysis.queue';
import { closeChatQueue } from './queues/chat.queue';
import sequelize from './config/database';

import './models/User';
import './models/City';
import './models/Hospital';
import './models/AnalysisResult';
import './models/ChatMessage';

async function main() {
  await sequelize.authenticate();
  console.log('[Worker] Database connected');

  await sequelize.sync();
  console.log('[Worker] Database synced');

  const analysisWorker = startAnalysisWorker();
  const chatWorker = startChatWorker();

  console.log('[Worker] Analysis and chat workers started');

  process.on('SIGTERM', async () => {
    console.log('[Worker] Shutting down...');
    await stopAnalysisWorker();
    await stopChatWorker();
    await closeAnalysisQueue();
    await closeChatQueue();
    await closeRedisConnection();
    await sequelize.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('[Worker] Shutting down...');
    await stopAnalysisWorker();
    await stopChatWorker();
    await closeAnalysisQueue();
    await closeChatQueue();
    await closeRedisConnection();
    await sequelize.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('[Worker] Failed to start:', err);
  process.exit(1);
});
