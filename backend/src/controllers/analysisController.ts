import { Response } from 'express';
import fs from 'fs';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as analysisService from '../services/analysisService';

export const upload = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: (e as any).path, message: e.msg })),
    });
    return;
  }

  const file = req.file;
  if (!file) {
    res.status(400).json({ success: false, message: 'No image file provided' });
    return;
  }

  const imageType = (req.body.imageType as string).toLowerCase() as 'xray' | 'ct';
  const sessionId = req.body.sessionId || null;

  const result = await analysisService.uploadAndAnalyze({
    userId: req.user!.id,
    filePath: file.path,
    originalFilename: file.originalname,
    imageType,
    sessionId,
  });

  if (result.success === false) {
    try { fs.unlinkSync(file.path); } catch {}
    const isClientUploadError =
      result.error.startsWith('imageType') ||
      result.error.startsWith('Image appears') ||
      result.error.startsWith('Uploaded file') ||
      result.error.startsWith('This image');
    const status = isClientUploadError ? 400 : 503;
    res.status(status).json({ success: false, message: result.error });
    return;
  }

  res.status(201).json({
    success: true,
    message: 'Analysis complete',
    data: result.data,
  });
});

export const createUploadIntent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: (e as any).path, message: e.msg })),
    });
    return;
  }

  const result = await analysisService.createUploadIntent({
    userId: req.user!.id,
    originalFilename: req.body.originalFilename,
    imageType: req.body.imageType,
    mimeType: req.body.mimeType,
    fileSizeBytes: Number(req.body.fileSizeBytes),
    sessionId: req.body.sessionId || null,
  });

  if (result.success === false) {
    res.status(503).json({ success: false, message: result.error });
    return;
  }

  res.status(201).json({
    success: true,
    message: 'Upload intent created',
    data: result.data,
  });
});

export const submitAnalysis = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await analysisService.submitAnalysis(req.user!.id, Number(req.params.id));
  if (result.success === false) {
    const status = result.error === 'Analysis not found' ? 404 : 400;
    res.status(status).json({ success: false, message: result.error });
    return;
  }

  res.status(202).json({
    success: true,
    message: 'Analysis job accepted',
    data: result.data,
  });
});

export const getAnalysisStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await analysisService.getAnalysisStatus(req.user!.id, Number(req.params.id));
  if (result.success === false) {
    const status = result.error === 'Analysis not found' ? 404 : 400;
    res.status(status).json({ success: false, message: result.error });
    return;
  }

  res.json({
    success: true,
    message: 'Analysis status retrieved',
    data: result.data,
  });
});

export const validateScan = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: (e as any).path, message: e.msg })),
    });
    return;
  }

  const file = req.file;
  if (!file) {
    res.status(400).json({ success: false, message: 'No image file provided' });
    return;
  }

  const imageType = (req.body.imageType as string).toLowerCase() as 'xray' | 'ct';
  const result = await analysisService.validateUploadedScan(file.path, file.originalname, imageType);

  try { fs.unlinkSync(file.path); } catch {}

  if (result.success === false) {
    const status = result.error.startsWith('imageType') ? 400 : 503;
    res.status(status).json({ success: false, message: result.error });
    return;
  }

  if (!result.data.valid) {
    res.status(400).json({
      success: false,
      message: result.data.message,
      data: result.data,
    });
    return;
  }

  res.json({
    success: true,
    message: 'Scan validated',
    data: result.data,
  });
});

export const getHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || 10);

  const result = await analysisService.getAnalysisHistory(req.user!.id, page, limit);

  if (result.success === false) {
    res.status(500).json({ success: false, message: result.error });
    return;
  }

  res.json({
    success: true,
    message: 'History retrieved',
    data: result.data.data,
    pagination: result.data.pagination,
  });
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Invalid analysis ID',
      errors: errors.array().map((e) => ({ field: (e as any).path, message: e.msg })),
    });
    return;
  }

  const result = await analysisService.getAnalysisById(req.user!.id, Number(req.params.id));

  if (result.success === false) {
    res.status(404).json({ success: false, message: result.error });
    return;
  }

  res.json({
    success: true,
    message: 'Analysis retrieved',
    data: result.data,
  });
});

export const deleteAnalysis = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Invalid analysis ID',
      errors: errors.array().map((e) => ({ field: (e as any).path, message: e.msg })),
    });
    return;
  }

  const result = await analysisService.deleteAnalysisById(req.user!.id, Number(req.params.id));

  if (result.success === false) {
    res.status(404).json({ success: false, message: result.error });
    return;
  }

  res.json({ success: true, message: 'Analysis deleted' });
});
