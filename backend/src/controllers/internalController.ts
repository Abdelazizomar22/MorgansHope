import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { env } from '../config/env';
import { getQstashReceiver, isQstashConfigured } from '../infrastructure/queue/qstash';
import { processAnalysisJob } from '../services/analysisService';

async function verifyInternalRequest(req: Request) {
  const internalToken = req.headers['x-ai-internal-token'];
  if (typeof internalToken === 'string' && env.aiInternalToken && internalToken === env.aiInternalToken) {
    return true;
  }

  const signature = req.headers['upstash-signature'];
  if (typeof signature !== 'string' || !isQstashConfigured()) {
    return false;
  }

  const protocol = (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim() || req.protocol;
  const host = req.get('host');
  const url = host ? `${protocol}://${host}${req.originalUrl}` : undefined;

  return getQstashReceiver().verify({
    signature,
    body: (req as any).rawBody || '',
    url,
    upstashRegion: req.headers['upstash-region'] as string | undefined,
  });
}

export const handleAnalysisJob = asyncHandler(async (req: Request, res: Response) => {
  if (!(await verifyInternalRequest(req))) {
    res.status(401).json({ success: false, message: 'Unauthorized internal request.' });
    return;
  }

  const jobId = String(req.body?.jobId || '').trim();
  if (!jobId) {
    res.status(400).json({ success: false, message: 'jobId is required.' });
    return;
  }

  const result = await processAnalysisJob(jobId);
  if (result.success === false) {
    res.status(500).json({ success: false, message: result.error });
    return;
  }

  res.json({ success: true, message: 'Analysis job processed.', data: result.data });
});
