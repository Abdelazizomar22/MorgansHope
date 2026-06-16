import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../config/redis';
import type { ChatJobData } from '../queues/chat.queue';
import User from '../models/User';
import ChatMessage from '../models/ChatMessage';
import AnalysisResult from '../models/AnalysisResult';
import { generateChatReply, type ChatTurn } from '../utils/chatAgent';

const CHAT_CONCURRENCY = parseInt(process.env.CHAT_QUEUE_CONCURRENCY || '5', 10);

async function processChat(job: Job<ChatJobData>): Promise<void> {
  const { userMessageId, userId } = job.data;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const userMsg = await ChatMessage.findByPk(userMessageId);
  if (!userMsg) {
    throw new Error(`Message ${userMessageId} not found`);
  }

  const storedMessages = await ChatMessage.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit: 12,
  });

  const history: ChatTurn[] = storedMessages
    .filter((m) => m.id !== userMsg.id)
    .reverse()
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  const latestAnalysis = await AnalysisResult.findOne({
    where: { userId, status: 'completed' },
    order: [['createdAt', 'DESC']],
  });

  const reply = await generateChatReply({
    message: userMsg.content,
    history,
    user,
    latestAnalysis,
  });

  await ChatMessage.create({
    userId,
    role: 'assistant',
    content: reply.slice(0, 4000),
  });

  const totalMessages = await ChatMessage.count({ where: { userId } });
  if (totalMessages > 30) {
    const staleMessages = await ChatMessage.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']],
      limit: totalMessages - 30,
    });

    if (staleMessages.length) {
      await ChatMessage.destroy({
        where: { id: staleMessages.map((m) => m.id) },
      });
    }
  }

  job.updateProgress(100);
}

let worker: Worker | null = null;

export function startChatWorker(): Worker {
  if (worker) return worker;

  worker = new Worker(
    'chat',
    processChat,
    {
      connection: getRedisConnection() as any,
      concurrency: CHAT_CONCURRENCY,
    },
  );

  worker.on('failed', async (job, err) => {
    console.error(`[ChatWorker] Job ${job?.id} failed for message ${job?.data.userMessageId}:`, err?.message || err?.toString() || 'Unknown error');
  });

  worker.on('completed', (job) => {
    console.log(`[ChatWorker] Job ${job.id} completed for message ${job.data.userMessageId}`);
  });

  return worker;
}

export async function stopChatWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
  }
}
