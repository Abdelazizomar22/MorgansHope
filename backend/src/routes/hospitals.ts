import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getAll, getCities, getById } from '../controllers/hospitalController';

const router = Router();

router.get('/',        authenticate, getAll);
router.get('/cities',  authenticate, getCities);
router.get('/:id',     authenticate, getById);

export default router;
