import { Router } from 'express';
import { distributedRateLimit } from '../middleware/distributedRateLimit';
import { contactValidators, submitContactForm } from '../controllers/contactController';

const router = Router();

router.post('/', distributedRateLimit('contact'), contactValidators, submitContactForm);

export default router;
