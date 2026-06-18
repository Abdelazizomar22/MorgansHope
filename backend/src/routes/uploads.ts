import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { distributedRateLimit } from '../middleware/distributedRateLimit';
import { createUploadIntent } from '../controllers/analysisController';

const router = Router();

router.post('/intents', authenticate, distributedRateLimit('upload'), [
  body('originalFilename').isString().trim().notEmpty(),
  body('imageType').isIn(['xray', 'ct']).withMessage('imageType must be "xray" or "ct"'),
  body('mimeType').isString().trim().notEmpty(),
  body('fileSizeBytes').isInt({ min: 1, max: 10 * 1024 * 1024 }),
  body('sessionId').optional().isString().trim(),
], createUploadIntent);

export default router;
