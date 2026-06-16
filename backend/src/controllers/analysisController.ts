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
      errors: errors.array().map(e => ({ field: (e as any).path, message: e.msg })),
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
    try { fs.unlinkSync(file.path); } catch { }
    const status = result.error.startsWith('imageType') ? 400 : 503;
    res.status(status).json({ success: false, message: result.error });
    return;
  }

  res.status(201).json({
    success: true,
    message: 'Analysis complete',
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
      errors: errors.array().map(e => ({ field: (e as any).path, message: e.msg })),
    });
    return;
  }

  const result = await analysisService.getAnalysisById(req.user!.id, req.params.id as unknown as number);

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
      errors: errors.array().map(e => ({ field: (e as any).path, message: e.msg })),
    });
    return;
  }

  const result = await analysisService.deleteAnalysisById(req.user!.id, req.params.id as unknown as number);

  if (result.success === false) {
    res.status(404).json({ success: false, message: result.error });
    return;
  }

  res.json({ success: true, message: 'Analysis deleted' });
});
