import { Client, Receiver } from '@upstash/qstash';
import { env } from '../../config/env';

let client: Client | null = null;
let receiver: Receiver | null = null;

export function isQstashConfigured() {
  return Boolean(
    env.qstashToken
    && env.qstashCurrentSigningKey
    && env.qstashNextSigningKey
    && env.qstashWorkerUrl,
  );
}

export function getQstashClient() {
  if (!env.qstashToken) throw new Error('QStash is not configured.');
  if (!client) client = new Client({ token: env.qstashToken });
  return client;
}

export function getQstashReceiver() {
  if (!env.qstashCurrentSigningKey || !env.qstashNextSigningKey) {
    throw new Error('QStash signing keys are not configured.');
  }
  if (!receiver) {
    receiver = new Receiver({
      currentSigningKey: env.qstashCurrentSigningKey,
      nextSigningKey: env.qstashNextSigningKey,
    });
  }
  return receiver;
}

export async function enqueueAnalysis(jobId: string, analysisId: number) {
  if (!isQstashConfigured()) throw new Error('QStash is not fully configured.');
  return getQstashClient().publishJSON({
    url: env.qstashWorkerUrl,
    body: { jobId, analysisId },
    retries: 5,
    delay: 0,
    headers: {
      'x-morgans-hope-job-id': jobId,
    },
  });
}
