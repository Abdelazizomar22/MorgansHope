import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, type AuthRequest } from '../middleware/auth';
import AnalysisResult from '../models/AnalysisResult';
import ChatMessage from '../models/ChatMessage';
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
    const requestHistory: ChatTurn[] = rawHistory
      .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
      .map((item) => ({ role: item.role, content: item.content.slice(0, 4000) }));

    const storedMessages = await ChatMessage.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 12,
    });

    const dbHistory: ChatTurn[] = storedMessages.reverse().map((item) => ({
      role: item.role,
      content: item.content,
    }));

    const mergedHistoryMap = new Map<string, ChatTurn>();
    [...dbHistory, ...requestHistory].forEach((item) => {
      const key = `${item.role}:${item.content.trim()}`;
      if (!mergedHistoryMap.has(key)) {
        mergedHistoryMap.set(key, item);
      }
    });

    const history = Array.from(mergedHistoryMap.values()).slice(-12);

    const latestAnalysis = await AnalysisResult.findOne({
      where: { userId: req.user.id, status: 'completed' },
      order: [['createdAt', 'DESC']],
    });

    await ChatMessage.create({
      userId: req.user.id,
      role: 'user',
      content: message.slice(0, 4000),
    });

    const reply = await generateChatReply({
      message,
      history,
      user: req.user,
      latestAnalysis,
    });

    await ChatMessage.create({
      userId: req.user.id,
      role: 'assistant',
      content: reply.slice(0, 4000),
    });

    const totalMessages = await ChatMessage.count({ where: { userId: req.user.id } });
    if (totalMessages > 30) {
      const staleMessages = await ChatMessage.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'ASC']],
        limit: totalMessages - 30,
      });

      if (staleMessages.length) {
        await ChatMessage.destroy({
          where: { id: staleMessages.map((item) => item.id) },
        });
      }
    }

    return res.json({
      success: true,
      data: {
        reply,
        usedLatestAnalysis: Boolean(latestAnalysis),
        memoryTurnsUsed: history.length,
      },
    });
  },
);

router.get('/history', authenticate, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const messages = await ChatMessage.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'ASC']],
    limit: 100,
    attributes: ['id', 'role', 'content', 'createdAt'],
  });

  return res.json({
    success: true,
    data: messages.map((m) => ({
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
  });
});

export default router;
