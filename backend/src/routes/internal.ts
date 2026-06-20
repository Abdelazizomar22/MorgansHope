import { Router } from 'express';
import { getAnalysisJobEndpointStatus, handleAnalysisJob } from '../controllers/internalController';

const router = Router();

router.get('/jobs/analysis', getAnalysisJobEndpointStatus);
router.post('/jobs/analysis', handleAnalysisJob);

export default router;
