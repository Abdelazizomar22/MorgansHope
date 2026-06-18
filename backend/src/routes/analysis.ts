import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { distributedRateLimit } from '../middleware/distributedRateLimit';
import upload from '../middleware/upload';
import {
  upload as uploadAnalysis,
  createUploadIntent,
  submitAnalysis,
  getAnalysisStatus,
  validateScan,
  getHistory,
  getById,
  deleteAnalysis,
} from '../controllers/analysisController';

const router = Router();

router.post('/upload', authenticate, distributedRateLimit('upload'), upload.single('image'), [
  body('imageType').isIn(['xray', 'ct']).withMessage('imageType must be "xray" or "ct"'),
  body('sessionId').optional().isString().trim(),
], uploadAnalysis);

router.post('/validate', authenticate, distributedRateLimit('upload'), upload.single('image'), [
  body('imageType').isIn(['xray', 'ct']).withMessage('imageType must be "xray" or "ct"'),
], validateScan);

router.post('/upload-intent', authenticate, distributedRateLimit('upload'), [
  body('originalFilename').isString().trim().notEmpty(),
  body('imageType').isIn(['xray', 'ct']).withMessage('imageType must be "xray" or "ct"'),
  body('mimeType').isString().trim().notEmpty(),
  body('fileSizeBytes').isInt({ min: 1, max: 10 * 1024 * 1024 }),
  body('sessionId').optional().isString().trim(),
], createUploadIntent);

router.post('/:id/submit', authenticate, distributedRateLimit('upload'), param('id').isInt().toInt(), submitAnalysis);
router.get('/:id/status', authenticate, param('id').isInt().toInt(), getAnalysisStatus);
router.get('/history', authenticate, getHistory);
router.get('/:id', authenticate, param('id').isInt().toInt(), getById);
router.delete('/:id', authenticate, param('id').isInt().toInt(), deleteAnalysis);

export default router;
