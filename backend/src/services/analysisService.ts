import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import AnalysisResult from '../models/AnalysisResult';
import Hospital from '../models/Hospital';
import City from '../models/City';
import type { Result } from '../types/result';
import { Ok, Err } from '../types/result';

const CT_URL = process.env.CT_SERVICE_URL || 'http://localhost:8000';
const XRAY_URL = process.env.XRAY_SERVICE_URL || 'http://localhost:8001';
const GATE_URL = process.env.GATE_SERVICE_URL || '';
const NODULE_URL = process.env.NODULE_SERVICE_URL || '';

type UrgencyLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';
type GateClassification = 'Chest_XRay' | 'Chest_CT' | 'Other_Medical' | 'Non_Medical';

interface GateResult {
  classification: GateClassification;
  confidence: number | null;
  routedImageType: 'xray' | 'ct' | null;
  rejectedMessage: string | null;
}

function computeUrgency(r: AnalysisResult): UrgencyLevel {
  if (!r.hasFindings) return 'none';
  if (!r.hasCancer) return 'low';
  if (!r.isMalignant) return 'medium';
  if (r.cancerProbability !== null && r.cancerProbability >= 0.8) return 'critical';
  return 'high';
}

function createForm(filePath: string, originalFilename: string) {
  const form = new FormData();
  form.append('file', fs.readFileSync(filePath), originalFilename);
  return form;
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function topProbability(probabilities: Record<string, number>) {
  return Object.entries(probabilities).sort((a, b) => b[1] - a[1])[0] || null;
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

  const form = createForm(input.filePath, input.originalFilename);
  const response = await axios.post(`${GATE_URL}/predict`, form, {
    headers: form.getHeaders(),
    timeout: 60_000,
  });

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
}

async function runNoduleDetection(input: UploadInput) {
  if (!NODULE_URL) return null;

  const form = createForm(input.filePath, input.originalFilename);
  const response = await axios.post(`${NODULE_URL}/detect`, form, {
    headers: form.getHeaders(),
    timeout: 120_000,
  });

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

export async function uploadAndAnalyze(input: UploadInput): Promise<Result<UploadResult>> {
  if (!['xray', 'ct'].includes(input.imageType)) {
    try { fs.unlinkSync(input.filePath); } catch { }
    return Err('imageType must be "xray" or "ct"');
  }

  const startTime = Date.now();

  const record = await AnalysisResult.create({
    userId: input.userId,
    sessionId: input.sessionId,
    imageType: input.imageType,
    imagePath: input.filePath.split('/').pop() || input.filePath,
    originalFilename: input.originalFilename,
    classification: 'Pending',
    confidence: 0,
    hasFindings: false,
    allProbabilities: {},
    status: 'pending',
  });

  try {
    const gate = await runGate(input);
    await record.update({
      gateClassification: gate.classification,
      gateConfidence: gate.confidence,
      imageType: gate.routedImageType || input.imageType,
    });

    if (gate.rejectedMessage || !gate.routedImageType) {
      await record.update({
        classification: gate.classification,
        confidence: gate.confidence || 0,
        status: 'failed',
        processingTimeMs: Date.now() - startTime,
      });
      return Err(gate.rejectedMessage || 'Unsupported scan type.');
    }

    const routedImageType = gate.routedImageType;

    let aiData: Record<string, unknown>;
    if (routedImageType === 'ct') {
      const form = createForm(input.filePath, input.originalFilename);
      const response = await axios.post(`${CT_URL}/predict`, form, {
        headers: form.getHeaders(),
        timeout: 120_000,
      });
      aiData = response.data;
    } else {
      const form = createForm(input.filePath, input.originalFilename);
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

      if (!['Normal', 'Benign'].includes(classification)) {
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
    let recommendedHospitals: Hospital[] = [];
    if (isMalignant) {
      recommendedHospitals = await Hospital.findAll({
        where: { isActive: true },
        include: [{ model: City, as: 'city' }],
        limit: 3,
        order: [['rating', 'DESC']],
      });
    }

    return Ok({
      result: { ...record.toJSON(), urgencyLevel },
      urgencyLevel,
      recommendedHospitals,
      processingTimeMs,
    });
  } catch (err) {
    await record.update({ status: 'failed' });
    console.error('AI service error:', err);
    return Err('AI service unavailable. Please try again.');
  }
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

  const data = rows.map(r => ({ ...r.toJSON(), urgencyLevel: computeUrgency(r) }));

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

  return Ok({ ...result.toJSON(), urgencyLevel: computeUrgency(result) });
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

  try {
    const uploadsRoot = process.env.UPLOAD_DIR || 'uploads';
    const uploadPath = path.isAbsolute(uploadsRoot)
      ? uploadsRoot
      : path.join(process.cwd(), uploadsRoot);
    const filePath = path.join(uploadPath, result.imagePath);
    fs.unlinkSync(filePath);
  } catch { }

  await result.destroy();
  return Ok(undefined);
}
