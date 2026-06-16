import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requestSignature, confirmUpload } from '../controllers/mediaController';

const router = Router();

router.post('/request-signature', authenticate, requestSignature);
router.post('/confirm-upload', authenticate, confirmUpload);

export default router;
