import { Worker, Job } from 'bullmq';
import fs from 'fs';
import path from 'path';
import os from 'os';
import axios from 'axios';
import FormData from 'form-data';
import { getRedisConnection } from '../config/redis';
import type { AnalysisJobData } from '../queues/analysis.queue';
import AnalysisResult from '../models/AnalysisResult';

const CT_URL = process.env.CT_SERVICE_URL || 'http://localhost:8000';
const XRAY_URL = process.env.XRAY_SERVICE_URL || 'http://localhost:8001';
const ANALYSIS_CONCURRENCY = parseInt(process.env.ANALYSIS_QUEUE_CONCURRENCY || '3', 10);

function getUploadDir(): string {
  const uploadsRoot = process.env.UPLOAD_DIR || 'uploads';
  if (Boolean(process.env.VERCEL)) {
    return path.join(os.tmpdir(), 'morgans-hope-uploads');
  }
  return path.isAbsolute(uploadsRoot) ? uploadsRoot : path.join(process.cwd(), uploadsRoot);
}

async function processAnalysis(job: Job<AnalysisJobData>): Promise<void> {
  const { analysisId } = job.data;

  const record = await AnalysisResult.findByPk(analysisId);
  if (!record) {
    throw new Error(`Analysis record ${analysisId} not found`);
  }

  const filePath = path.join(getUploadDir(), record.imagePath);
  if (!fs.existsSync(filePath)) {
    await record.update({ status: 'failed' });
    throw new Error(`Image file not found: ${filePath}`);
  }

  const startTime = Date.now();

  const form = new FormData();
  form.append('file', fs.readFileSync(filePath), record.originalFilename);

  let aiData: Record<string, unknown>;
  if (record.imageType === 'ct') {
    const response = await axios.post(`${CT_URL}/predict`, form, {
      headers: form.getHeaders(),
      timeout: 120_000,
    });
    aiData = response.data;
  } else {
    const response = await axios.post(`${XRAY_URL}/predict/xray`, form, {
      headers: form.getHeaders(),
      timeout: 120_000,
    });
    aiData = response.data;
  }

  let classification: string;
  let confidence: number;
  let hasFindings: boolean;
  let hasCancer: boolean | null = null;
  let cancerProbability: number | null = null;
  let isMalignant: boolean | null = null;
  let allProbabilities: Record<string, number>;
  let nextStep: string | null = null;

  if (record.imageType === 'ct') {
    classification = aiData.diagnosis as string;
    confidence = aiData.confidence as number;
    hasFindings = (aiData.has_cancer as boolean) || false;
    hasCancer = aiData.has_cancer as boolean;
    cancerProbability = aiData.cancer_prob as number;
    isMalignant = aiData.is_malignant as boolean;
    allProbabilities = (aiData.all_probs as Record<string, number>) || {};
  } else {
    classification = aiData.diagnosis as string;
    confidence = aiData.confidence as number;
    hasFindings = (aiData.has_finding as boolean) || false;
    allProbabilities = (aiData.all_probs as Record<string, number>) || {};
    nextStep = (aiData.next_step as string) || null;
  }

  const processingTimeMs = Date.now() - startTime;

  await record.update({
    classification,
    confidence,
    hasFindings,
    hasCancer,
    cancerProbability,
    isMalignant,
    allProbabilities,
    nextStep,
    status: 'completed',
    processingTimeMs,
  });

  job.updateProgress(100);
}

let worker: Worker | null = null;

export function startAnalysisWorker(): Worker {
  if (worker) return worker;

  worker = new Worker(
    'analysis',
    processAnalysis,
    {
      connection: getRedisConnection() as any,
      concurrency: ANALYSIS_CONCURRENCY,
    },
  );

  worker.on('failed', async (job, err) => {
    console.error(`[AnalysisWorker] Job ${job?.id} failed:`, err?.message || err?.toString() || 'Unknown error');
    if (job?.data.analysisId) {
      try {
        await AnalysisResult.update(
          { status: 'failed' },
          { where: { id: job.data.analysisId as number } },
        );
      } catch { }
    }
  });

  worker.on('completed', (job) => {
    console.log(`[AnalysisWorker] Job ${job.id} completed for analysis ${job.data.analysisId}`);
  });

  return worker;
}

export async function stopAnalysisWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
  }
}
