import fs from 'fs';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';
import axios from 'axios';
import FormData from 'form-data';
import AnalysisResult from '../models/AnalysisResult';
import AnalysisJob from '../models/AnalysisJob';
import Hospital from '../models/Hospital';
import City from '../models/City';
import type { Result } from '../types/result';
import { Ok, Err } from '../types/result';
import {
  createPrivateReadUrl,
  createPrivateUpload,
  downloadPrivateObject,
  isSupabaseStorageConfigured,
  removePrivateObject,
} from '../infrastructure/storage/supabaseStorage';
import { env } from '../config/env';
import { enqueueAnalysis, isQstashConfigured } from '../infrastructure/queue/qstash';
import { logger, safeError } from '../infrastructure/observability/logger';
import {
  resolveAnalysisInputFile,
  resolveAnalysisTempFile,
  resolveStoredUpload,
  safeUnlinkAnalysisInputFile,
  safeUnlinkAnalysisTempFile,
  safeUnlinkUploadedFile,
} from '../utils/safeFiles';

const cleanServiceUrl = (value: string) => {
  let normalized = value.trim();
  if (
    normalized.length >= 2
    && ((normalized.startsWith('"') && normalized.endsWith('"'))
      || (normalized.startsWith("'") && normalized.endsWith("'")))
  ) {
    normalized = normalized.slice(1, -1);
  }

  try {
    const parsed = new URL(normalized);
    const path = parsed.pathname.replace(/\/+$/, '');
    const suffixes = ['/predict/xray', '/predict', '/detect', '/health', '/'];
    const matched = suffixes.find((suffix) => path.endsWith(suffix) && path !== suffix);
    if (matched) {
      parsed.pathname = path.slice(0, -matched.length) || '/';
    } else {
      parsed.pathname = path || '/';
    }
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString().replace(/\/+$/, '');
  } catch {
    while (normalized.endsWith('/')) normalized = normalized.slice(0, -1);
    return normalized;
  }
};

const CT_URL = env.ctServiceUrl;
const XRAY_URL = env.xrayServiceUrl;
const GATE_URL = env.gateServiceUrl;
const NODULE_URL = env.noduleServiceUrl;

type UrgencyLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';
type GateClassification = 'Chest_XRay' | 'Chest_CT' | 'Other_Medical' | 'Non_Medical';

interface GateResult {
  classification: GateClassification;
  confidence: number | null;
  routedImageType: 'xray' | 'ct' | null;
  rejectedMessage: string | null;
}

interface ValidationResult {
  valid: boolean;
  classification: GateClassification;
  confidence: number | null;
  detectedImageType: 'xray' | 'ct' | null;
  message: string | null;
}

function computeUrgency(r: AnalysisResult): UrgencyLevel {
  if (!r.hasFindings) return 'none';
  if (!r.hasCancer) return 'low';
  if (!r.isMalignant) return 'medium';
  if (r.cancerProbability !== null && r.cancerProbability >= 0.8) return 'critical';
  return 'high';
}

function createForm(filePath: string, originalFilename: string) {
  const trustedPath = resolveAnalysisInputFile(filePath);
  if (!trustedPath) {
    throw new Error('Invalid analysis file path.');
  }

  const form = new FormData();
  form.append('file', fs.readFileSync(trustedPath), originalFilename);
  return form;
}

const retryableAiStatuses = new Set([408, 429, 502, 503, 504]);
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function postScanToAi(
  service: 'gate' | 'ct' | 'xray' | 'nodule',
  baseUrl: string,
  endpoint: string,
  input: UploadInput,
  timeout: number,
  maxAttempts = 2,
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const form = createForm(input.filePath, input.originalFilename);
    try {
      return await axios.post(`${baseUrl}${endpoint}`, form, {
        headers: {
          ...form.getHeaders(),
          ...(env.aiInternalToken ? { 'x-ai-internal-token': env.aiInternalToken } : {}),
        },
        timeout,
      });
    } catch (error) {
      lastError = error;
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const retryable = status ? retryableAiStatuses.has(status) : axios.isAxiosError(error);

      logger.warn({
        service,
        attempt,
        status,
        error: safeError(error),
      }, 'ai_service_request_failed');

      if (!retryable || attempt === maxAttempts) break;
      await wait(5_000);
    }
  }

  throw lastError;
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function topProbability(probabilities: Record<string, number>) {
  return Object.entries(probabilities).sort((a, b) => b[1] - a[1])[0] || null;
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-120);
}

function createTempFilePath(analysisId: number, filename: string) {
  return path.join(os.tmpdir(), `morgans-hope-${analysisId}-${Date.now()}-${sanitizeFilename(filename)}`);
}

async function runGate(input: UploadInput): Promise<GateResult> {
  if (!GATE_URL) {
    return {
      classification: input.imageType === 'ct' ? 'Chest_CT' : 'Chest_XRay',
      confidence: null,
      routedImageType: input.imageType,
      rejectedMessage: null,
    };
  }

  try {
    const response = await postScanToAi('gate', GATE_URL, '/predict', input, 45_000);

    const classification = response.data?.classification as GateClassification;
    const confidence = response.data?.confidence === undefined ? null : asNumber(response.data.confidence, 0);

    if (classification === 'Chest_XRay') {
      return { classification, confidence, routedImageType: 'xray', rejectedMessage: null };
    }

    if (classification === 'Chest_CT') {
      return { classification, confidence, routedImageType: 'ct', rejectedMessage: null };
    }

    if (classification === 'Other_Medical') {
      return {
        classification,
        confidence,
        routedImageType: null,
        rejectedMessage: 'Image appears to be a non-chest medical scan. Please upload a chest X-ray or CT scan.',
      };
    }

    return {
      classification: 'Non_Medical',
      confidence,
      routedImageType: null,
      rejectedMessage: 'Uploaded file does not appear to be a medical image. Please upload a valid chest scan.',
    };
  } catch (error) {
    logger.warn(
      {
        error: safeError(error),
        imageType: input.imageType,
      },
      'gate_unavailable_falling_back_to_selected_image_type',
    );

    return {
      classification: input.imageType === 'ct' ? 'Chest_CT' : 'Chest_XRay',
      confidence: null,
      routedImageType: input.imageType,
      rejectedMessage: null,
    };
  }
}

function buildGateValidationMessage(
  selectedImageType: 'xray' | 'ct',
  gate: Pick<GateResult, 'classification' | 'routedImageType' | 'rejectedMessage'>,
) {
  if (gate.rejectedMessage || !gate.routedImageType) {
    if (gate.classification === 'Other_Medical') {
      return 'This appears to be a medical image, but not a chest lung scan. Please upload a chest CT or chest X-ray focused on the lungs.';
    }

    return 'This file does not appear to be a medical chest scan. Please upload a chest CT or chest X-ray image.';
  }

  if (selectedImageType === gate.routedImageType) {
    return null;
  }

  if (selectedImageType === 'xray' && gate.routedImageType === 'ct') {
    return 'This image looks like a chest CT scan, but you selected X-Ray. Please switch to CT Scan or upload a chest X-ray.';
  }

  return 'This image looks like a chest X-ray, but you selected CT Scan. Please switch to X-Ray or upload a chest CT scan.';
}

async function runNoduleDetection(input: UploadInput) {
  if (!NODULE_URL) return null;

  let response;
  try {
    response = await postScanToAi('nodule', NODULE_URL, '/detect', input, 45_000, 1);
  } catch (error) {
    logger.warn({ error: safeError(error) }, 'optional_nodule_detection_unavailable');
    return null;
  }

  const best = response.data?.best_detection || response.data?.detection || null;
  if (!best) return null;

  return {
    boundingBox: best.bounding_box || best.bbox || null,
    sizeMm: best.size_mm === undefined ? null : asNumber(best.size_mm, 0),
    confidence: best.confidence === undefined ? null : asNumber(best.confidence, 0),
  };
}

function normalizeXrayResult(aiData: Record<string, unknown>) {
  const allProbabilities = (aiData.all_probs as Record<string, number>) || {};
  const tbResult = (aiData.tb_result as { detected?: boolean; confidence?: number } | null) || null;
  const top = topProbability(allProbabilities);
  const classification = String(aiData.diagnosis || aiData.clinical_group || top?.[0] || 'Unknown');
  const clinicalGroup = (aiData.clinical_group as string) || (classification.includes('Finding') ? classification : null);
  const confidence = asNumber(aiData.confidence, top?.[1] || 0);
  const hasFindings =
    Boolean(aiData.has_finding) ||
    Boolean(tbResult?.detected) ||
    !['Normal', 'No Finding', 'Unknown'].includes(classification);
  const potentialMalignancy = /malignancy|nodule|mass/i.test(`${classification} ${clinicalGroup || ''}`);

  return {
    classification,
    clinicalGroup,
    confidence,
    hasFindings,
    hasCancer: potentialMalignancy,
    cancerProbability: potentialMalignancy ? confidence : null,
    isMalignant: false,
    allProbabilities,
    tbDetected: tbResult?.detected ?? null,
    tbConfidence: tbResult?.confidence === undefined ? null : asNumber(tbResult.confidence, 0),
    tbLocalizations: (tbResult as { localizations?: Array<Record<string, unknown>> } | null)?.localizations || null,
    nextStep: (aiData.next_step as string) || null,
  };
}

async function fetchRecommendedHospitals(isMalignant: boolean | null) {
  if (!isMalignant) return [];
  return Hospital.findAll({
    where: { isActive: true },
    include: [{ model: City, as: 'city' }],
    limit: 3,
    order: [['rating', 'DESC']],
  });
}

async function withImageUrl<T extends Record<string, unknown>>(record: T & { storageKey?: string | null; storageBucket?: string | null; imagePath?: string }) {
  if (record.storageKey && record.storageBucket && isSupabaseStorageConfigured()) {
    return {
      ...record,
      imageUrl: await createPrivateReadUrl(record.storageBucket, record.storageKey),
    };
  }
  return record;
}

export interface UploadInput {
  userId: number;
  filePath: string;
  originalFilename: string;
  imageType: 'xray' | 'ct';
  sessionId: string | null;
}

export interface UploadResult {
  result: Record<string, unknown>;
  urgencyLevel: UrgencyLevel;
  recommendedHospitals: Hospital[];
  processingTimeMs: number;
}

export interface UploadIntentResult {
  analysisId: number;
  objectPath: string;
  bucket: string;
  token: string;
  signedUrl: string;
}

export interface AnalysisStatusResult {
  analysisId: number;
  status: AnalysisResult['status'];
  jobId?: string | null;
  jobStatus?: AnalysisJob['status'] | null;
  errorMessage?: string | null;
  result?: Record<string, unknown>;
  recommendedHospitals?: Hospital[];
}

async function finalizeAnalysis(record: AnalysisResult, input: UploadInput): Promise<Result<UploadResult>> {
  const startTime = Date.now();

  try {
    let gate: GateResult;
    try {
      gate = await runGate(input);
    } catch (err) {
      logger.error({ error: safeError(err), analysisId: record.id }, 'analysis_gate_pipeline_failed');
      return Err('Gate service unavailable. Please try again.');
    }
    await record.update({
      gateClassification: gate.classification,
      gateConfidence: gate.confidence,
      imageType: gate.routedImageType || input.imageType,
    });

    const validationMessage = buildGateValidationMessage(input.imageType, gate);
    if (validationMessage || !gate.routedImageType) {
      await record.update({
        classification: gate.classification,
        confidence: gate.confidence || 0,
        status: 'failed',
        processingTimeMs: Date.now() - startTime,
      });
      return Err(validationMessage || 'Unsupported scan type.');
    }

    const routedImageType = gate.routedImageType;
    let aiData: Record<string, unknown>;

    if (routedImageType === 'ct') {
      let response;
      try {
        response = await postScanToAi('ct', CT_URL, '/predict', input, 120_000);
      } catch (err) {
        logger.error({ error: safeError(err), analysisId: record.id }, 'analysis_ct_pipeline_failed');
        return Err('CT service unavailable. Please try again.');
      }
      aiData = response.data;
    } else {
      let response;
      try {
        response = await postScanToAi('xray', XRAY_URL, '/predict/xray', input, 180_000);
      } catch (err) {
        logger.error({ error: safeError(err), analysisId: record.id }, 'analysis_xray_pipeline_failed');
        return Err('X-Ray service unavailable. Please try again.');
      }
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
    let clinicalGroup: string | null = null;
    let tbDetected: boolean | null = null;
    let tbConfidence: number | null = null;
    let tbLocalizations: Array<Record<string, unknown>> | null = null;
    let noduleBoundingBox: Record<string, number> | null = null;
    let noduleSizeMm: number | null = null;
    let noduleDetectionConfidence: number | null = null;

    if (routedImageType === 'ct') {
      classification = aiData.diagnosis as string;
      confidence = asNumber(aiData.confidence, 0);
      hasFindings = !['Normal'].includes(classification);
      hasCancer = aiData.has_cancer as boolean;
      cancerProbability = asNumber(aiData.cancer_prob, 0);
      isMalignant = aiData.is_malignant as boolean;
      allProbabilities = (aiData.all_probs as Record<string, number>) || {};
      nextStep = (aiData.next_step as string) || null;

      if (classification !== 'Normal') {
        const nodule = await runNoduleDetection(input);
        if (nodule) {
          noduleBoundingBox = nodule.boundingBox;
          noduleSizeMm = nodule.sizeMm;
          noduleDetectionConfidence = nodule.confidence;
        }
      }
    } else {
      const normalized = normalizeXrayResult(aiData);
      classification = normalized.classification;
      clinicalGroup = normalized.clinicalGroup;
      confidence = normalized.confidence;
      hasFindings = normalized.hasFindings;
      hasCancer = normalized.hasCancer;
      cancerProbability = normalized.cancerProbability;
      isMalignant = normalized.isMalignant;
      allProbabilities = normalized.allProbabilities;
      tbDetected = normalized.tbDetected;
      tbConfidence = normalized.tbConfidence;
      tbLocalizations = normalized.tbLocalizations;
      nextStep = normalized.nextStep;
    }

    const processingTimeMs = Date.now() - startTime;

    await record.update({
      classification,
      clinicalGroup,
      confidence,
      hasFindings,
      hasCancer,
      cancerProbability,
      isMalignant,
      allProbabilities,
      tbDetected,
      tbConfidence,
      tbLocalizations,
      noduleBoundingBox,
      noduleSizeMm,
      noduleDetectionConfidence,
      nextStep,
      status: 'completed',
      processingTimeMs,
    });

    const urgencyLevel = computeUrgency(record);
    const recommendedHospitals = await fetchRecommendedHospitals(isMalignant);

    return Ok({
      result: await withImageUrl({ ...record.toJSON(), urgencyLevel }),
      urgencyLevel,
      recommendedHospitals,
      processingTimeMs,
    });
  } catch (err) {
    await record.update({ status: 'failed' });
    logger.error({ error: safeError(err), analysisId: record.id }, 'analysis_ai_pipeline_failed');
    return Err('AI service unavailable. Please try again.');
  } finally {
    safeUnlinkAnalysisInputFile(input.filePath);
  }
}

export async function validateUploadedScan(
  filePath: string,
  originalFilename: string,
  imageType: 'xray' | 'ct',
): Promise<Result<ValidationResult>> {
  if (!['xray', 'ct'].includes(imageType)) {
    return Err('imageType must be "xray" or "ct"');
  }

  try {
    const gate = await runGate({
      userId: 0,
      filePath,
      originalFilename,
      imageType,
      sessionId: null,
    });

    const message = buildGateValidationMessage(imageType, gate);

    return Ok({
      valid: !message,
      classification: gate.classification,
      confidence: gate.confidence,
      detectedImageType: gate.routedImageType,
      message,
    });
  } catch (err) {
    logger.error({ error: safeError(err) }, 'gate_validation_failed');
    return Err('Validation service unavailable. Please try again.');
  }
}

export async function uploadAndAnalyze(input: UploadInput): Promise<Result<UploadResult>> {
  if (!['xray', 'ct'].includes(input.imageType)) {
    safeUnlinkUploadedFile(input.filePath);
    return Err('imageType must be "xray" or "ct"');
  }

  const record = await AnalysisResult.create({
    userId: input.userId,
    sessionId: input.sessionId,
    imageType: input.imageType,
    imagePath: path.basename(input.filePath),
    originalFilename: input.originalFilename,
    classification: 'Pending',
    confidence: 0,
    hasFindings: false,
    allProbabilities: {},
    status: 'pending',
  });

  return finalizeAnalysis(record, input);
}

export async function createUploadIntent(params: {
  userId: number;
  originalFilename: string;
  imageType: 'xray' | 'ct';
  mimeType: string;
  fileSizeBytes: number;
  sessionId?: string | null;
}): Promise<Result<UploadIntentResult>> {
  if (!isSupabaseStorageConfigured()) {
    return Err('Private storage is not configured yet.');
  }

  const bucket = env.medicalScansBucket;
  const record = await AnalysisResult.create({
    userId: params.userId,
    sessionId: params.sessionId || null,
    imageType: params.imageType,
    imagePath: '',
    originalFilename: params.originalFilename,
    classification: 'Pending',
    confidence: 0,
    hasFindings: false,
    allProbabilities: {},
    status: 'pending',
    mimeType: params.mimeType,
    fileSizeBytes: params.fileSizeBytes,
  });

  const objectPath = `users/${params.userId}/analysis/${record.id}/${Date.now()}-${sanitizeFilename(params.originalFilename)}`;
  const upload = await createPrivateUpload(bucket, objectPath);

  await record.update({
    storageBucket: bucket,
    storageKey: objectPath,
    imagePath: objectPath,
  });

  return Ok({
    analysisId: record.id,
    objectPath,
    bucket,
    token: upload.token,
    signedUrl: upload.signedUrl,
  });
}

export async function submitAnalysis(userId: number, analysisId: number): Promise<Result<{ analysisId: number; jobId: string; status: string }>> {
  const analysis = await AnalysisResult.findOne({ where: { id: analysisId, userId } });
  if (!analysis) {
    return Err('Analysis not found');
  }

  if (!analysis.storageKey || !analysis.storageBucket) {
    return Err('No uploaded scan was found for this analysis.');
  }

  let job = await AnalysisJob.findOne({ where: { analysisId: analysis.id, userId } });
  if (!job) {
    job = await AnalysisJob.create({
      id: randomUUID(),
      analysisId: analysis.id,
      userId,
      status: 'queued',
    });
  } else if (['completed', 'processing'].includes(job.status)) {
    return Ok({ analysisId: analysis.id, jobId: job.id, status: job.status });
  } else {
    await job.update({ status: 'queued', lastError: null });
  }

  const shouldUseAsyncAnalysis =
    isQstashConfigured() && (env.enableAsyncAnalysis || env.nodeEnv === 'production');

  if (shouldUseAsyncAnalysis) {
    logger.info({
      analysisId: analysis.id,
      jobId: job.id,
      mode: env.enableAsyncAnalysis ? 'flag-enabled' : 'production-fallback',
    }, 'analysis_job_queued');
    await enqueueAnalysis(job.id, analysis.id);
    return Ok({ analysisId: analysis.id, jobId: job.id, status: 'queued' });
  }

  await processAnalysisJob(job.id);
  const refreshedJob = await AnalysisJob.findByPk(job.id);
  return Ok({ analysisId: analysis.id, jobId: job.id, status: refreshedJob?.status || 'completed' });
}

export async function processAnalysisJob(jobId: string): Promise<Result<UploadResult>> {
  const job = await AnalysisJob.findByPk(jobId);
  if (!job) {
    return Err('Analysis job not found');
  }

  const analysis = await AnalysisResult.findByPk(job.analysisId);
  if (!analysis) {
    await job.update({ status: 'failed', lastError: 'Analysis record not found.' });
    return Err('Analysis record not found.');
  }

  if (!analysis.storageBucket || !analysis.storageKey) {
    await job.update({ status: 'failed', lastError: 'Storage reference is missing.' });
    return Err('Storage reference is missing.');
  }

  await job.update({
    status: 'processing',
    attempts: job.attempts + 1,
    lockedAt: new Date(),
    lastError: null,
  });
  const currentAttempt = job.attempts + 1;

  const tempPath = resolveAnalysisTempFile(
    createTempFilePath(analysis.id, analysis.originalFilename),
  );
  if (!tempPath) {
    await job.update({ status: 'failed', lastError: 'Could not create a secure temporary file.' });
    return Err('Could not create a secure temporary file.');
  }

  try {
    const buffer = await downloadPrivateObject(analysis.storageBucket, analysis.storageKey);
    fs.writeFileSync(tempPath, buffer);

    const result = await finalizeAnalysis(analysis, {
      userId: analysis.userId,
      filePath: tempPath,
      originalFilename: analysis.originalFilename,
      imageType: analysis.imageType,
      sessionId: analysis.sessionId,
    });

    if (result.success === false) {
      await job.update({
        status: job.attempts + 1 >= job.maxAttempts ? 'dead_letter' : 'failed',
        lastError: result.error,
        completedAt: new Date(),
        lockedAt: null,
      });
      return result;
    }

    await job.update({
      status: 'completed',
      completedAt: new Date(),
      lockedAt: null,
      lastError: null,
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analysis processing failed.';
    await analysis.update({ status: 'failed' });
    await job.update({
      status: currentAttempt >= job.maxAttempts ? 'dead_letter' : 'failed',
      lastError: message,
      completedAt: new Date(),
      lockedAt: null,
    });
    return Err(message);
  } finally {
    safeUnlinkAnalysisTempFile(tempPath);
  }
}

export async function getAnalysisStatus(
  userId: number,
  analysisId: number,
): Promise<Result<AnalysisStatusResult>> {
  const analysis = await AnalysisResult.findOne({ where: { id: analysisId, userId } });
  if (!analysis) {
    return Err('Analysis not found');
  }

  const job = await AnalysisJob.findOne({ where: { analysisId: analysis.id, userId } });

  if (analysis.status === 'completed') {
    const recommendedHospitals = await fetchRecommendedHospitals(analysis.isMalignant);
    return Ok({
      analysisId: analysis.id,
      status: analysis.status,
      jobId: job?.id || null,
      jobStatus: job?.status || null,
      result: await withImageUrl({ ...analysis.toJSON(), urgencyLevel: computeUrgency(analysis) }),
      recommendedHospitals,
    });
  }

  return Ok({
    analysisId: analysis.id,
    status: analysis.status,
    jobId: job?.id || null,
    jobStatus: job?.status || null,
    errorMessage: job?.lastError || (analysis.status === 'failed' ? 'Analysis failed. Please try again.' : null),
  });
}

export interface HistoryResult {
  data: Array<Record<string, unknown>>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getAnalysisHistory(
  userId: number,
  page: number,
  limit: number,
): Promise<Result<HistoryResult>> {
  const offset = (page - 1) * limit;

  const { count, rows } = await AnalysisResult.findAndCountAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  const data = await Promise.all(rows.map(async (r) => withImageUrl({ ...r.toJSON(), urgencyLevel: computeUrgency(r) })));

  return Ok({
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
}

export async function getAnalysisById(
  userId: number,
  id: number,
): Promise<Result<Record<string, unknown>>> {
  const result = await AnalysisResult.findOne({
    where: { id, userId },
  });

  if (!result) {
    return Err('Analysis not found');
  }

  return Ok(await withImageUrl({ ...result.toJSON(), urgencyLevel: computeUrgency(result) }));
}

export async function deleteAnalysisById(
  userId: number,
  id: number,
): Promise<Result<void>> {
  const result = await AnalysisResult.findOne({
    where: { id, userId },
  });

  if (!result) {
    return Err('Analysis not found');
  }

  if (result.storageBucket && result.storageKey && isSupabaseStorageConfigured()) {
    try {
      await removePrivateObject(result.storageBucket, result.storageKey);
    } catch {
      // Ignore storage cleanup errors and continue deleting DB record.
    }
  } else if (result.imagePath) {
    const filePath = resolveStoredUpload(result.imagePath);
    if (filePath) {
      safeUnlinkUploadedFile(filePath);
    }
  }

  await AnalysisJob.destroy({ where: { analysisId: result.id } });
  await result.destroy();
  return Ok(undefined);
}

