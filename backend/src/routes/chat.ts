import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, type AuthRequest } from '../middleware/auth';
import AnalysisResult from '../models/AnalysisResult';
import { generateChatReply, type ChatTurn } from '../utils/chatAgent';

const router = Router();

router.post(
  '/',
  authenticate,
  [
    body('message').isString().trim().isLength({ min: 1, max: 4000 }),
    body('history').optional().isArray({ max: 12 }),
  ],
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat payload',
        errors: errors.array(),
      });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const message = String(req.body.message || '');
    const rawHistory = Array.isArray(req.body.history) ? req.body.history : [];
    const history: ChatTurn[] = rawHistory
      .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
      .map((item) => ({ role: item.role, content: item.content.slice(0, 4000) }));

    const latestAnalysis = await AnalysisResult.findOne({
      where: { userId: req.user.id, status: 'completed' },
      order: [['createdAt', 'DESC']],
    });

    const reply = await generateChatReply({
      message,
      history,
      user: req.user,
      latestAnalysis,
    });

    return res.json({
      success: true,
      data: {
        reply,
        usedLatestAnalysis: Boolean(latestAnalysis),
      },
    });
  },
);

export default router;
