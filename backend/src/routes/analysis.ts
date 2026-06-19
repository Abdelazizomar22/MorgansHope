import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, requireAcceptedDisclaimer, requireVerifiedEmail } from '../middleware/auth';
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
router.use(authenticate, requireVerifiedEmail, requireAcceptedDisclaimer);

router.post('/upload', distributedRateLimit('upload'), upload.single('image'), [
  body('imageType').isIn(['xray', 'ct']).withMessage('imageType must be "xray" or "ct"'),
  body('sessionId').optional().isString().trim(),
], uploadAnalysis);

router.post('/validate', distributedRateLimit('upload'), upload.single('image'), [
  body('imageType').isIn(['xray', 'ct']).withMessage('imageType must be "xray" or "ct"'),
], validateScan);

router.post('/upload-intent', distributedRateLimit('upload'), [
  body('originalFilename').isString().trim().notEmpty(),
  body('imageType').isIn(['xray', 'ct']).withMessage('imageType must be "xray" or "ct"'),
  body('mimeType').isString().trim().notEmpty(),
  body('fileSizeBytes').isInt({ min: 1, max: 10 * 1024 * 1024 }),
  body('sessionId').optional().isString().trim(),
], createUploadIntent);

router.post('/:id/submit', distributedRateLimit('upload'), param('id').isInt().toInt(), submitAnalysis);
router.get('/:id/status', param('id').isInt().toInt(), getAnalysisStatus);
router.get('/history', getHistory);
router.get('/:id', param('id').isInt().toInt(), getById);
router.delete('/:id', param('id').isInt().toInt(), deleteAnalysis);

export default router;
