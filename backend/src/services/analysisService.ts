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

type UrgencyLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

function computeUrgency(r: AnalysisResult): UrgencyLevel {
  if (!r.hasFindings) return 'none';
  if (!r.hasCancer) return 'low';
  if (!r.isMalignant) return 'medium';
  if (r.cancerProbability !== null && r.cancerProbability >= 0.8) return 'critical';
  return 'high';
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
    const form = new FormData();
    form.append('file', fs.readFileSync(input.filePath), input.originalFilename);

    let aiData: Record<string, unknown>;
    if (input.imageType === 'ct') {
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

    if (input.imageType === 'ct') {
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
