import { Router } from 'express';
import { handleAnalysisJob } from '../controllers/internalController';

const router = Router();

router.post('/jobs/analysis', handleAnalysisJob);

export default router;
