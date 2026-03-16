import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import upload from '../middleware/upload';
import {
  upload as uploadAnalysis,
  getHistory,
  getById,
  deleteAnalysis,
} from '../controllers/analysisController';

const router = Router();

router.post('/upload',  authenticate, upload.single('image'), uploadAnalysis);
router.get('/history',  authenticate, getHistory);
router.get('/:id',      authenticate, getById);
router.delete('/:id',   authenticate, deleteAnalysis);

export default router;
