import { Queue } from 'bullmq';
import { getRedisConnection } from '../config/redis';

export interface AnalysisJobData {
  analysisId: number;
}

let queue: Queue | null = null;

export function getAnalysisQueue(): Queue {
  if (!queue) {
    queue = new Queue('analysis', {
      connection: getRedisConnection() as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { age: 60 * 60 },
        removeOnFail: { age: 24 * 60 * 60 },
      },
    });
  }
  return queue;
}

export async function closeAnalysisQueue(): Promise<void> {
  if (queue) {
    await queue.close();
    queue = null;
  }
}
