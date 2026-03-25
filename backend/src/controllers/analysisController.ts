import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import AnalysisResult from '../models/AnalysisResult';
import Hospital from '../models/Hospital';
import City from '../models/City';
import { AuthRequest } from '../middleware/auth';

const CT_URL = process.env.CT_SERVICE_URL || 'http://localhost:8000';
const XRAY_URL = process.env.XRAY_SERVICE_URL || 'http://localhost:8001';

// ── Urgency helper ─────────────────────────────────────────────────────────
type UrgencyLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

function computeUrgency(r: AnalysisResult): UrgencyLevel {
  if (!r.hasFindings) return 'none';
  if (!r.hasCancer) return 'low';
  if (!r.isMalignant) return 'medium';
  if (r.cancerProbability !== null && r.cancerProbability >= 0.8) return 'critical';
  return 'high';
}

// ── Upload & analyse ───────────────────────────────────────────────────────
export async function upload(req: AuthRequest, res: Response): Promise<void> {
  const file = req.file;
  if (!file) {
    res.status(400).json({ success: false, message: 'No image file provided' });
    return;
  }

  // Normalise imageType (frontend may send "CT" or "XRAY")
  const imageType = ((req.body.imageType as string) || '').toLowerCase() as 'xray' | 'ct';
  if (!['xray', 'ct'].includes(imageType)) {
    try { fs.unlinkSync(file.path); } catch { }
    res.status(400).json({ success: false, message: 'imageType must be "xray" or "ct"' });
    return;
  }

  const startTime = Date.now();
  const sessionId = req.body.sessionId || null;

  // ── Create pending record ────────────────────────────────────────────────
  const record = await AnalysisResult.create({
    userId: req.user!.id,
    sessionId,
    imageType,
    imagePath: file.filename,
    originalFilename: file.originalname,
    classification: 'Pending',
    confidence: 0,
    hasFindings: false,
    allProbabilities: {},
    status: 'pending',
  });

  try {
    // ── Call AI service ────────────────────────────────────────────────────
    const form = new FormData();
    // Using readFileSync instead of createReadStream prevents unhandled stream rejections in Node if Axios fails instantly (ECONNREFUSED)
    form.append('file', fs.readFileSync(file.path), file.originalname);

    let aiData: Record<string, unknown>;
    if (imageType === 'ct') {
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

    // ── Map AI response to DB columns ─────────────────────────────────────
    let classification: string;
    let confidence: number;
    let hasFindings: boolean;
    let hasCancer: boolean | null = null;
    let cancerProbability: number | null = null;
    let isMalignant: boolean | null = null;
    let allProbabilities: Record<string, number>;
    let nextStep: string | null = null;

    if (imageType === 'ct') {
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

    // ── Fetch recommended hospitals if malignant ───────────────────────────
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

    res.status(201).json({
      success: true,
      message: 'Analysis complete',
      data: {
        result: { ...record.toJSON(), urgencyLevel },
        urgencyLevel,
        recommendedHospitals,
        processingTimeMs,
      },
    });
  } catch (err) {
    await record.update({ status: 'failed' });
    console.error('AI service error:', err);
    res.status(503).json({ success: false, message: 'AI service unavailable. Please try again.' });
  }
}

// ── History ─────────────────────────────────────────────────────────────────
export async function getHistory(req: AuthRequest, res: Response): Promise<void> {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
  const offset = (page - 1) * limit;

  const { count, rows } = await AnalysisResult.findAndCountAll({
    where: { userId: req.user!.id },
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  const data = rows.map(r => ({ ...r.toJSON(), urgencyLevel: computeUrgency(r) }));

  res.json({
    success: true,
    message: 'History retrieved',
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
}

// ── Get single ───────────────────────────────────────────────────────────────
export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const result = await AnalysisResult.findOne({
    where: { id: req.params.id, userId: req.user!.id },
  });

  if (!result) {
    res.status(404).json({ success: false, message: 'Analysis not found' });
    return;
  }

  res.json({
    success: true,
    message: 'Analysis retrieved',
    data: { ...result.toJSON(), urgencyLevel: computeUrgency(result) },
  });
}

// ── Delete ───────────────────────────────────────────────────────────────────
export async function deleteAnalysis(req: AuthRequest, res: Response): Promise<void> {
  const result = await AnalysisResult.findOne({
    where: { id: req.params.id, userId: req.user!.id },
  });

  if (!result) {
    res.status(404).json({ success: false, message: 'Analysis not found' });
    return;
  }

  // Delete stored file (Windows-safe)
  try {
    const uploadsRoot = process.env.UPLOAD_DIR || 'uploads';
    const uploadPath = path.isAbsolute(uploadsRoot)
      ? uploadsRoot
      : path.join(process.cwd(), uploadsRoot);
    const filePath = path.join(uploadPath, result.imagePath);
    fs.unlinkSync(filePath);
  } catch { }

  await result.destroy();
  res.json({ success: true, message: 'Analysis deleted' });
}
