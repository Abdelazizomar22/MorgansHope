import { Queue } from 'bullmq';
import { getRedisConnection } from '../config/redis';

export interface ChatJobData {
  userMessageId: number;
  userId: number;
}

let queue: Queue | null = null;

export function getChatQueue(): Queue {
  if (!queue) {
    queue = new Queue('chat', {
      connection: getRedisConnection() as any,
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { age: 60 * 60 },
        removeOnFail: { age: 24 * 60 * 60 },
      },
    });
  }
  return queue;
}

export async function closeChatQueue(): Promise<void> {
  if (queue) {
    await queue.close();
    queue = null;
  }
}
